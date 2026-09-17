// ============================================================
// This function runs on Vercel's SERVER, not in the browser.
// Same purpose as before: keeps the real Groq API key hidden
// from anyone visiting the site.
//
// Abuse protection layers, in order:
//   1. Origin lock — only requests from our own page are accepted
//   2. Message size cap — blocks absurdly long guest payloads
//   3. Global guest daily cap — safety net independent of per-IP
//      tracking, in case someone rotates IPs
//   4. Per-IP guest limit (1/day) — existing
//   5. Per-user limit — 25/day free, 200/day Pro (checked via the
//      subscriptions table)
//
// Web search: when the client sends webSearch: true on a normal
// (non-campaign, non-sequence) message, we call Tavily's search API
// first with the user's latest message as the query, and feed the
// results into the system prompt as grounding context before calling
// Groq. Requires a TAVILY_API_KEY env var — get a free key at
// tavily.com. If that key is missing, or the search call fails for
// any reason, we silently fall back to answering without search
// rather than failing the whole request.
//
// Private mode: when the client sends privateMode: true, the chat
// still counts against the user's daily limit like any other
// message, but the settings object it receives has already been
// stripped of brand profile / memories / custom instructions client
// side, and we additionally skip the post-reply memory-extraction
// call below so nothing from the exchange gets written back either.
//
// Modes (mutually exclusive, chosen by the client):
//   - undefined/normal  — plain chat, optionally with web search
//   - "campaign"        — single email, JSON-structured, optionally
//                          + landing page (includeLandingPage) and/or
//                          + SMS/social repurposing (includeRepurpose)
//   - "sequence"         — a 3-5 email drip sequence, JSON-structured
// ============================================================

const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.6-27b";

const ALLOWED_ORIGIN = "https://beeto.toheebakanni.name.ng";
const MAX_GUEST_MESSAGE_CHARS = 4000;
const GLOBAL_GUEST_DAILY_CAP = 300;
const NORMAL_MESSAGE_WEIGHT = 1;
const CAMPAIGN_MESSAGE_WEIGHT = 2;
const CAMPAIGN_LANDING_MESSAGE_WEIGHT = 3;
const REPURPOSE_EXTRA_WEIGHT = 1;
const SEQUENCE_MIN_LENGTH = 3;
const SEQUENCE_MAX_LENGTH = 5;

// weightOpts: { includeLandingPage, includeRepurpose, sequenceLength }
function getRequestWeight(mode, weightOpts = {}) {
  const { includeLandingPage, includeRepurpose, sequenceLength } = weightOpts;

  if (mode === "sequence") {
    // 1 credit per email in the sequence, clamped to the allowed range
    // so a bad/missing client value can't under- or over-charge.
    const length = Math.min(Math.max(sequenceLength || SEQUENCE_MIN_LENGTH, SEQUENCE_MIN_LENGTH), SEQUENCE_MAX_LENGTH);
    return length;
  }

  if (mode !== "campaign") return NORMAL_MESSAGE_WEIGHT;

  let weight = includeLandingPage ? CAMPAIGN_LANDING_MESSAGE_WEIGHT : CAMPAIGN_MESSAGE_WEIGHT;
  if (includeRepurpose) weight += REPURPOSE_EXTRA_WEIGHT;
  return weight;
}

// --------------------------------------------------------------
// Free vs Pro gating — sequence mode, and the landing-page/repurpose
// campaign add-ons, are Pro-only. Everything else (single-email
// campaigns, normal chat, web search) stays free.
// --------------------------------------------------------------
const PRO_ONLY_MODES = new Set(["sequence"]);

function requiresPro(mode, includeLandingPage, includeRepurpose) {
  if (PRO_ONLY_MODES.has(mode)) return true;
  if (mode === "campaign" && (includeLandingPage || includeRepurpose)) return true;
  return false;
}

function conversationHasImage(messages) {
  return messages.some(
    (msg) => Array.isArray(msg.content) && msg.content.some((part) => part.type === "image_url")
  );
}

function totalMessageChars(messages) {
  return messages.reduce((sum, msg) => {
    const text = Array.isArray(msg.content)
      ? (msg.content.find((p) => p.type === "text")?.text || "")
      : (msg.content || "");
    return sum + text.length;
  }, 0);
}

function getLatestUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "user") continue;
    return Array.isArray(msg.content)
      ? (msg.content.find((p) => p.type === "text")?.text || "")
      : (msg.content || "");
  }
  return "";
}

// --------------------------------------------------------------
// Web search — Tavily
// --------------------------------------------------------------
async function performWebSearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || !query || !query.trim()) return null;

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query.slice(0, 400),
        search_depth: "basic",
        max_results: 5,
        include_answer: false
      })
    });

    if (!response.ok) {
      console.error("Tavily search error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length === 0) return null;

    return results
      .filter((r) => r.url && r.title)
      .slice(0, 5)
      .map((r) => ({
        title: r.title,
        url: r.url,
        content: (r.content || "").slice(0, 1200)
      }));
  } catch (error) {
    console.error("Tavily search failed:", error.message);
    return null;
  }
}

function buildSearchContextBlock(results) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = results
    .map((r, i) => `[${i + 1}] ${r.title} (${r.url})\n${r.content}`)
    .join("\n\n");

  return `
Today's date is ${today}. The following are live web search results relevant
to the user's latest message. Use them to ground your answer in current,
accurate information — prefer them over anything you might otherwise assume
about recent events, prices, or current status. Don't dump raw excerpts;
summarize and synthesize in your own words. If the results don't actually
answer the question, say so rather than guessing.

${entries}
`.trim();
}

const BASE_INSTRUCTION = `
You are Beeto, a helpful general-purpose AI assistant that can discuss
any topic the user brings up — questions, advice, writing, explanations, etc.

You have particularly deep, practical expertise in email marketing and
copywriting: subject lines, segmentation, automation flows, deliverability,
and conversion copy. When a question touches marketing, lean into that
expertise with specific, actionable answers rather than generic tips.

For everything else, just be a clear, direct, genuinely useful assistant.
Keep answers reasonably concise unless the user asks for depth.

When a question involves math, always show real, correct step-by-step
working using LaTeX math notation: wrap inline math in single dollar signs
like $x^2 + 1$ and standalone/display equations in double dollar signs like
$$\\frac{dy}{dx} = 2x$$. Never skip steps or fake a derivation — solve it
properly, the way a math teacher would on a whiteboard.

Do not use emoji by default — keep a mature, professional tone. Only use one
if the user's own message includes emoji, or in the rare moment a touch of
humor or genuine sympathy calls for it.

Never use em dashes (—) or en dashes used as punctuation. Write the way a
person naturally punctuates: use commas, periods, colons, semicolons, or
parentheses instead of a dash to join or set off a clause.

About yourself: you are Beeto, built by Toheeb Akanni (his brand is ATM),
live at beeto.toheebakanni.name.ng. If asked what you are, what plans
exist, or what's included in each plan, answer directly and accurately
using the facts below. Never invent a feature you don't actually have.

If you used the send_email tool during this conversation, you may confirm
what was sent, but never claim to have sent an email if the tool was not
actually called and did not succeed.

Free plan: 25 messages a day, normal chat with optional web search, voice
input and read-aloud, single-email campaign mode, one brand profile,
memory capped at about 10 saved facts.

Pro plan (₦8,000/month or $5/month, billed via Flutterwave): 200 messages
a day, everything in Free plus the landing-page and SMS/social-repurposing
add-ons for campaign mode, multi-email sequence mode (3-5 emails per
sequence), unlimited brand profiles/projects, and unlimited memory.

Guests (not signed in) get 1 free message per day before being asked to
sign up.
`.trim();

// --------------------------------------------------------------
// Shared schema building blocks — pulled out to their own consts so
// both the single-campaign schema and (in principle) any future
// schema can reuse them without duplicating the shape.
// --------------------------------------------------------------
const LANDING_PAGE_SCHEMA_FIELD = {
  type: "object",
  properties: {
    headline: { type: "string" },
    subheadline: { type: "string" },
    sections: { type: "array", items: { type: "string" } },
    landing_cta_text: { type: "string" }
  },
  required: ["headline", "subheadline", "sections", "landing_cta_text"],
  additionalProperties: false
};

const REPURPOSE_SCHEMA_FIELDS = {
  sms: {
    type: "object",
    properties: {
      message: { type: "string" },
      character_count: { type: "integer" }
    },
    required: ["message", "character_count"],
    additionalProperties: false
  },
  social: {
    type: "object",
    properties: {
      instagram_caption: { type: "string" },
      linkedin_caption: { type: "string" },
      x_caption: { type: "string" },
      hashtags: { type: "array", items: { type: "string" } }
    },
    required: ["instagram_caption", "linkedin_caption", "x_caption", "hashtags"],
    additionalProperties: false
  }
};

// Builds the campaign response_format schema on the fly based on
// which add-ons are active, instead of maintaining a combinatorial
// set of static CAMPAIGN_*_SCHEMA constants (that approach doesn't
// scale past two toggles).
function buildCampaignSchema({ includeLandingPage, includeRepurpose } = {}) {
  const properties = {
    subject_lines: { type: "array", items: { type: "string" } },
    preheader: { type: "string" },
    body: { type: "string" },
    cta_text: { type: "string" }
  };
  const required = ["subject_lines", "preheader", "body", "cta_text"];

  if (includeLandingPage) {
    properties.landing_page = LANDING_PAGE_SCHEMA_FIELD;
    required.push("landing_page");
  }
  if (includeRepurpose) {
    properties.sms = REPURPOSE_SCHEMA_FIELDS.sms;
    properties.social = REPURPOSE_SCHEMA_FIELDS.social;
    required.push("sms", "social");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: "email_campaign",
      strict: true,
      schema: { type: "object", properties, required, additionalProperties: false }
    }
  };
}

// Parameterized by length now, instead of one static schema — the emails
// array gets minItems/maxItems pinned to exactly what the user asked for,
// so the model can no longer satisfy the schema by returning fewer emails
// than requested.
function buildSequenceSchema(length) {
  return {
    type: "json_schema",
    json_schema: {
      name: "email_sequence",
      strict: true,
      schema: {
        type: "object",
        properties: {
          sequence_name: { type: "string" },
          emails: {
            type: "array",
            minItems: length,
            maxItems: length,
            items: {
              type: "object",
              properties: {
                step_number: { type: "integer" },
                send_delay: { type: "string" }, // e.g. "Immediately", "Day 2", "Day 5"
                purpose: { type: "string" },    // e.g. "Welcome", "Social proof", "Urgency/close"
                subject_lines: { type: "array", items: { type: "string" } },
                preheader: { type: "string" },
                body: { type: "string" },
                cta_text: { type: "string" }
              },
              required: ["step_number", "send_delay", "purpose", "subject_lines", "preheader", "body", "cta_text"],
              additionalProperties: false
            }
          }
        },
        required: ["sequence_name", "emails"],
        additionalProperties: false
      }
    }
  };
}

const CAMPAIGN_INSTRUCTION = `
The user wants a complete email marketing campaign. Fill subject_lines with
2-3 distinct options, write a compelling preheader, a complete email body
(use \\n for line breaks), and a clear, specific call-to-action.
`.trim();

const LANDING_PAGE_INSTRUCTION = `
Also design a matching landing page for this campaign — one the email's
CTA would link to. Write a headline, a supporting subheadline, 3-5 short
page sections (each a short paragraph covering things like the offer,
benefits, social proof, or FAQs), and a landing page CTA button text.
Keep the landing page's tone and message consistent with the email itself.
`.trim();

const REPURPOSE_INSTRUCTION = `
Also repurpose this campaign into: (1) a single SMS message under 160
characters (report the actual character_count) that captures the core
offer/CTA in a way that reads naturally as a text, not a shrunk email;
(2) social captions for Instagram, LinkedIn, and X, each matching that
platform's natural tone and length norms, plus a short relevant hashtag
list. Keep the offer and CTA consistent across every format — only the
tone and length should adapt.
`.trim();

function buildSequenceInstruction(length) {
  return `
The user wants a ${length}-email marketing sequence, not a single email. Plan
the arc across all ${length} emails so each has a distinct purpose (e.g.
welcome/hook, value or education, social proof, objection handling,
urgency/close) — don't repeat the same angle twice. Give each email a
send_delay relative to the previous one (e.g. "Immediately", "2 days
later", "5 days later") that reflects realistic pacing for the campaign
goal. Each email needs its own subject_lines, preheader, body, and
cta_text, and should read as a self-contained email that also clearly
continues the sequence's narrative.
`.trim();
}

const AI_DISCLOSURE_LINE = "This email was drafted with AI assistance.";

function appendDisclosure(body) {
  if (!body) return body;
  if (body.includes(AI_DISCLOSURE_LINE)) return body; // avoid duplicating on retries
  return `${body}\n\n${AI_DISCLOSURE_LINE}`;
}

// --------------------------------------------------------------
// Email tool — lets Beeto actually send an email on the user's
// behalf via Brevo's transactional email API, instead of only ever
// drafting text for the user to copy/paste themselves.
//
// Gated to logged-in users only (checked at call time in the
// handler) — guests can't trigger outbound email, since that's an
// abuse vector (arbitrary email sending from an anonymous visitor).
// Requires a BREVO_API_KEY env var. BREVO_SENDER_EMAIL /
// BREVO_SENDER_NAME are optional overrides for the "from" address;
// they default to Toheeb's own verified sender below.
// --------------------------------------------------------------
const EMAIL_TOOL = {
  type: "function",
  function: {
    name: "send_email",
    description: "Send an email to a recipient via Brevo. Use this when the user explicitly asks you to send, email, or notify someone — not for drafting email copy they'll send themselves (that's normal chat, not this tool).",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string", description: "Email subject line" },
        body: { type: "string", description: "Email body content, plain text (line breaks preserved)" }
      },
      required: ["to", "subject", "body"],
      additionalProperties: false
    }
  }
};

const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendBrevoEmail({ to, subject, body }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Email sending isn't configured on the server (missing BREVO_API_KEY)." };
  }
  if (!to || !EMAIL_ADDRESS_PATTERN.test(to)) {
    return { ok: false, error: `"${to}" doesn't look like a valid email address.` };
  }
  if (!subject || !body) {
    return { ok: false, error: "Missing subject or body." };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "toheeb@toheebakanni.name.ng";
  const senderName = process.env.BREVO_SENDER_NAME || "Beeto";

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        htmlContent: `<div style="white-space:pre-wrap;font-family:sans-serif;">${body.replace(/</g, "&lt;")}</div>`
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Brevo send error:", response.status, errText);
      return { ok: false, error: `Brevo rejected the send (status ${response.status}).` };
    }

    return { ok: true, to, subject };
  } catch (error) {
    console.error("Brevo send failed:", error.message);
    return { ok: false, error: "Network error while sending the email." };
  }
}

// --------------------------------------------------------------
// Post-reply extras — a small second Groq call after each normal
// (non-campaign, non-sequence) reply. Does two jobs in one call: (1)
// decides whether anything durable/personal is worth remembering, the
// same as before, and (2) writes 3 suggested follow-up messages, the
// same idea as ChatGPT/Claude's suggestion chips. Silent no-op on any
// failure; a missed memory or missed suggestions are never worth
// blocking the reply.
// --------------------------------------------------------------
const POST_REPLY_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "post_reply_extras",
    strict: true,
    schema: {
      type: "object",
      properties: {
        should_remember: { type: "boolean" },
        fact: { type: "string" },
        suggestions: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["should_remember", "fact", "suggestions"],
      additionalProperties: false
    }
  }
};

function buildPostReplyInstruction(existingMemories) {
  return `
You do two small jobs after a chat exchange, the same idea as ChatGPT or
Claude:

1. MEMORY: decide if anything durable and personal about the user was
said, worth recalling in a future, unrelated conversation (their
business/role, standing preferences, etc). Do NOT remember one-off
questions, small talk, or anything already in the existing memories list
below. Set should_remember to true only when it's genuinely worth
keeping; if true, fact must be ONE short sentence, third person (e.g.
"Runs a skincare brand called Glow" not "I run a skincare brand").

2. SUGGESTIONS: write exactly 3 short follow-up messages the user might
realistically send next, based specifically on what was just discussed.
Write them in the user's own voice, first person, as if the user typed
them (e.g. "Make the subject line punchier", not "Ask for a punchier
subject line"). Keep each under 8 words. Never suggest something generic
like "Tell me more, ground every suggestion in the actual reply above.

Existing memories (never duplicate these):
${existingMemories.length > 0 ? existingMemories.map((m) => `- ${m}`).join("\n") : "(none yet)"}
`.trim();
}

async function extractPostReplyExtras(apiKey, userText, assistantText, existingMemories) {
  if (!userText || !assistantText) return null;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          { role: "system", content: buildPostReplyInstruction(existingMemories) },
          { role: "user", content: `User said: ${userText}\n\nAssistant replied: ${assistantText}` }
        ],
        response_format: POST_REPLY_SCHEMA,
        reasoning_format: "hidden"
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return {
      memory: parsed.should_remember && parsed.fact && parsed.fact.trim() ? parsed.fact.trim() : null,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3).filter(Boolean) : []
    };
  } catch (error) {
    console.error("Post-reply extraction failed:", error.message);
    return null;
  }
}

function buildSystemInstruction(settings = {}) {
  const parts = [BASE_INSTRUCTION];

  if (settings.tone) {
    parts.push(`Default tone for your replies: ${settings.tone}.`);
  }

  const regionCompliance = {
    us: "The recipients are primarily in the US. When writing campaigns, keep CAN-SPAM in mind: include a clear way to unsubscribe and don't disguise the sender.",
    eu: "The recipients are primarily in the EU. When writing campaigns, keep GDPR and the ePrivacy Directive in mind: only write as if the recipient has given consent to be emailed, and include a clear way to unsubscribe.",
    ca: "The recipients are primarily in Canada. When writing campaigns, keep CASL in mind: only write as if the recipient has given express or implied consent, identify the sending organization, and include a clear way to unsubscribe."
  };
  if (settings.region && regionCompliance[settings.region]) {
    parts.push(regionCompliance[settings.region]);
  }

  if (settings.emphasizeNigeria) {
    parts.push("When discussing marketing, factor in an understanding of the Nigerian small-business market specifically.");
  }

  if (settings.customInstruction) {
    parts.push(`Additional instructions from the user: ${settings.customInstruction}`);
  }

  const bp = settings.brandProfile;
  if (bp && (bp.name || bp.industry || bp.audience || bp.voice || bp.avoidWords || bp.sampleEmail)) {
    const brandLines = ["The user has a specific brand. Use this context whenever relevant, especially for marketing/campaign requests:"];
    if (bp.name) brandLines.push(`- Brand name: ${bp.name}`);
    if (bp.industry) brandLines.push(`- Industry: ${bp.industry}`);
    if (bp.audience) brandLines.push(`- Target audience: ${bp.audience}`);
    if (bp.voice) brandLines.push(`- Brand voice: ${bp.voice}`);
    if (bp.avoidWords) brandLines.push(`- Never use these words/phrases: ${bp.avoidWords}`);
    if (bp.sampleEmail) brandLines.push(`- Sample past email to match the style of:\n${bp.sampleEmail}`);

    parts.push(brandLines.join("\n"));
  }

  if (Array.isArray(settings.memories) && settings.memories.length > 0) {
    const memoryLines = ["Things you remember about this user from past conversations — use them naturally where relevant, don't just repeat them back:"];
    settings.memories.forEach((m) => memoryLines.push(`- ${m.text}`));
    parts.push(memoryLines.join("\n"));
  }

  return parts.join("\n\n");
}

function stripThinkingBlock(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdXZjdnJuc2VnemVjcWRrb2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDAxOTEsImV4cCI6MjEwMjMxNjE5MX0.fnkm94U5c-gbdDMrBvVoZ4ewyEUcOlRY7TJkqkEQS1Q";

const SPAM_TRIGGER_WORDS = [
  "act now", "buy now", "click here", "limited time", "risk-free",
  "no obligation", "guarantee", "guaranteed", "winner", "congratulations",
  "free money", "cash bonus", "urgent", "don't delete", "act immediately",
  "100% free", "cheap", "discount", "amazing deal", "double your",
  "as seen on", "no credit check", "call now", "order now", "once in a lifetime"
];

const REGION_LABELS = {
  us: "CAN-SPAM (US)",
  eu: "GDPR / ePrivacy Directive (EU)",
  ca: "CASL (Canada)"
};

// Very rough heuristic for "does this look like it has a postal address
// in it" — a digit followed by a street-ish word. Good enough to flag
// campaigns that clearly have no address at all, which is the common
// case; it's not meant to validate a real address is correctly formed.
const ADDRESS_LIKE_PATTERN = /\d{1,6}\s+[a-z0-9.,\s]*\b(street|st\.|avenue|ave\.?|road|rd\.?|blvd|boulevard|drive|dr\.?|lane|ln\.?|suite|ste\.?|p\.?o\.?\s*box)\b/i;

const CONSENT_LANGUAGE_PATTERN = /\b(consent|subscribed|opted[\s-]?in|signed up|you asked to hear from us|joined our list)\b/i;

function checkDeliverability(campaign, region = "us") {
  const warnings = [];
  const body = (campaign.body || "").toLowerCase();
  const rawBody = campaign.body || "";
  const subjects = campaign.subject_lines || [];

  // ---- Region-agnostic checks — apply no matter who the audience is ----
  const foundSpamWords = SPAM_TRIGGER_WORDS.filter(
    (word) => body.includes(word) || subjects.some((s) => s.toLowerCase().includes(word))
  );
  if (foundSpamWords.length > 0) {
    warnings.push(`Contains spam-trigger phrases: ${foundSpamWords.join(", ")}`);
  }

  subjects.forEach((s) => {
    if (s === s.toUpperCase() && /[A-Z]/.test(s)) {
      warnings.push(`Subject line is all caps: "${s}"`);
    }
    if ((s.match(/!/g) || []).length > 1) {
      warnings.push(`Subject line has multiple exclamation marks: "${s}"`);
    }
    if (s.length > 60) {
      warnings.push(`Subject line may get cut off on mobile (${s.length} chars): "${s}"`);
    }
  });

  const exclaimCount = (body.match(/!/g) || []).length;
  if (exclaimCount > 3) {
    warnings.push(`Body uses ${exclaimCount} exclamation marks — can trigger spam filters.`);
  }

  if (!body.includes("unsubscribe")) {
    warnings.push("No unsubscribe language found in the body — required under CAN-SPAM, CASL, and GDPR/ePrivacy alike.");
  }

  // ---- Region-specific checks ----
  const regionLabel = REGION_LABELS[region] || REGION_LABELS.us;
  const hasAddress = ADDRESS_LIKE_PATTERN.test(rawBody);
  const hasConsentLanguage = CONSENT_LANGUAGE_PATTERN.test(rawBody);

  if (region === "eu") {
    if (!hasConsentLanguage) {
      warnings.push(`No reference to consent/opt-in — ${regionLabel} generally requires a documented lawful basis (typically consent) for marketing email. Consider referencing how the recipient opted in.`);
    }
  } else if (region === "ca") {
    if (!hasAddress) {
      warnings.push(`No physical mailing address detected — ${regionLabel} requires your organization's identification info (name + mailing address) in every commercial message.`);
    }
    if (!hasConsentLanguage) {
      warnings.push(`No reference to consent/opt-in — ${regionLabel} requires proof of express or implied consent; consider referencing how the recipient opted in.`);
    }
  } else {
    // Default to US / CAN-SPAM rules.
    if (!hasAddress) {
      warnings.push(`No physical mailing address detected — ${regionLabel} requires a valid postal address in every commercial email.`);
    }
  }

  // SMS repurposing gets its own soft check — the model sometimes
  // ignores the 160-char instruction, so verify what it reported.
  if (campaign.sms && typeof campaign.sms.message === "string") {
    const actualLength = campaign.sms.message.length;
    if (actualLength > 160) {
      warnings.push(`SMS repurpose is ${actualLength} characters — over the 160-char single-segment limit.`);
    }
  }

  return warnings;
}

async function verifySupabaseToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY
    }
  });

  if (!response.ok) return null;
  return response.json();
}

const FREE_DAILY_LIMIT = 25;
const PRO_DAILY_LIMIT = 200;
const GUEST_DAILY_LIMIT = 1;

function supabaseHeaders() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  return {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Prefer": "return=representation"
  };
}

// Checks whether this user has an active, unexpired Pro subscription.
async function getUserPlanInfo(userId) {
  const headers = supabaseHeaders();

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}&select=*`,
    { headers }
  );
  const rows = await res.json();
  const sub = rows[0];

  const isActivePro =
    sub &&
    sub.plan === "pro" &&
    sub.status === "active" &&
    sub.current_period_end &&
    new Date(sub.current_period_end) > new Date();

  return {
    plan: isActivePro ? "pro" : "free",
    limit: isActivePro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT
  };
}

async function checkAndIncrementUsage(userId, limit, weight) {
  const today = new Date().toISOString().slice(0, 10);
  const headers = supabaseHeaders();

  const getRes = await fetch(
    `${SUPABASE_URL}/rest/v1/usage_limits?user_id=eq.${userId}&select=*`,
    { headers }
  );
  const rows = await getRes.json();
  const row = rows[0];

  if (!row) {
    await fetch(`${SUPABASE_URL}/rest/v1/usage_limits`, {
      method: "POST",
      headers,
      body: JSON.stringify({ user_id: userId, message_count: weight, reset_date: today })
    });
    return { blocked: false };
  }

  if (row.reset_date !== today) {
    await fetch(`${SUPABASE_URL}/rest/v1/usage_limits?user_id=eq.${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ message_count: weight, reset_date: today })
    });
    return { blocked: false };
  }

  // Blocks if THIS request would push them over, not just if they're
  // already at the cap — so a landing-page campaign near the limit
  // can't sneak through and leave the count over budget.
  if (row.message_count + weight > limit) {
    return { blocked: true };
  }

  await fetch(`${SUPABASE_URL}/rest/v1/usage_limits?user_id=eq.${userId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ message_count: row.message_count + weight })
  });
  return { blocked: false };
}

async function checkAndIncrementKeyedUsage(key, limit) {
  const today = new Date().toISOString().slice(0, 10);
  const headers = supabaseHeaders();

  const getRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ip_usage_limits?ip_address=eq.${encodeURIComponent(key)}&select=*`,
    { headers }
  );
  const rows = await getRes.json();
  const row = rows[0];

  if (!row) {
    await fetch(`${SUPABASE_URL}/rest/v1/ip_usage_limits`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ip_address: key, message_count: 1, reset_date: today })
    });
    return { blocked: false };
  }

  if (row.reset_date !== today) {
    await fetch(`${SUPABASE_URL}/rest/v1/ip_usage_limits?ip_address=eq.${encodeURIComponent(key)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ message_count: 1, reset_date: today })
    });
    return { blocked: false };
  }

  if (row.message_count >= limit) {
    return { blocked: true };
  }

  await fetch(`${SUPABASE_URL}/rest/v1/ip_usage_limits?ip_address=eq.${encodeURIComponent(key)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ message_count: row.message_count + 1 })
  });
  return { blocked: false };
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// ---- Vercel handler format ----
module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const origin = req.headers.origin;
  if (origin !== ALLOWED_ORIGIN) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const {
    messages,
    settings,
    mode,
    includeLandingPage,
    includeRepurpose,
    sequenceLength,
    webSearch,
    privateMode
  } = req.body || {};

  const requestWeight = getRequestWeight(mode, { includeLandingPage, includeRepurpose, sequenceLength });

  const authHeader = req.headers.authorization;
  const user = authHeader ? await verifySupabaseToken(authHeader) : null;
  const planInfo = user ? await getUserPlanInfo(user.id) : { plan: "free", limit: null };

  // Sequence mode and the landing-page/repurpose campaign add-ons are
  // Pro-only. This covers guests too, since planInfo.plan is "free"
  // whenever there's no logged-in user.
  if (requiresPro(mode, includeLandingPage, includeRepurpose) && planInfo.plan !== "pro") {
    return res.status(403).json({
      error: "This feature is available on the Pro plan.",
      code: "PRO_REQUIRED"
    });
  }

  if (user) {
    const limit = planInfo.limit;
    const usage = await checkAndIncrementUsage(user.id, limit, requestWeight);
    if (usage.blocked) {
      return res.status(429).json({
        error: `You've reached today's limit of ${limit} messages. Resets at midnight.${limit === FREE_DAILY_LIMIT ? " Upgrade to Pro for a higher limit." : ""}${mode === "campaign" || mode === "sequence" ? " Campaigns and sequences count as more than one message since they generate more content." : ""}`,
        code: "USER_LIMIT"
      });
    }
  } else {
    if (Array.isArray(messages) && totalMessageChars(messages) > MAX_GUEST_MESSAGE_CHARS) {
      return res.status(413).json({
        error: "That message is too long to try as a guest. Sign up for full access.",
        code: "GUEST_LIMIT"
      });
    }

    const globalUsage = await checkAndIncrementKeyedUsage("__global_guest_cap__", GLOBAL_GUEST_DAILY_CAP);
    if (globalUsage.blocked) {
      return res.status(503).json({
        error: "Guest access is temporarily paused for today. Please sign up or log in to keep chatting.",
        code: "GUEST_LIMIT"
      });
    }

    const ip = getClientIp(req);
    const usage = await checkAndIncrementKeyedUsage(ip, GUEST_DAILY_LIMIT);
    if (usage.blocked) {
      return res.status(403).json({
        error: "You've used your free message for today. Sign up or log in to keep chatting.",
        code: "GUEST_LIMIT"
      });
    }
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server is missing GROQ_API_KEY. Set it in Vercel's dashboard." });
    }

    const usingTextModel = !conversationHasImage(messages);
    const isStructuredMode = mode === "campaign" || mode === "sequence";
    const clampedSequenceLength = Math.min(Math.max(sequenceLength || SEQUENCE_MIN_LENGTH, SEQUENCE_MIN_LENGTH), SEQUENCE_MAX_LENGTH);

    // Only search for normal chat — never for campaign/sequence mode,
    // whose replies are structured JSON, not a place to splice search
    // context into.
    let searchResults = null;
    if (!isStructuredMode && webSearch) {
      const query = getLatestUserText(messages);
      searchResults = await performWebSearch(query);
    }

    const systemContent = [
      buildSystemInstruction(settings),
      mode === "campaign" ? CAMPAIGN_INSTRUCTION : "",
      mode === "campaign" && includeLandingPage ? LANDING_PAGE_INSTRUCTION : "",
      mode === "campaign" && includeRepurpose ? REPURPOSE_INSTRUCTION : "",
      mode === "sequence" ? buildSequenceInstruction(clampedSequenceLength) : "",
      searchResults ? buildSearchContextBlock(searchResults) : ""
    ].filter(Boolean).join("\n\n");

    let responseFormat;
    if (mode === "campaign") {
      responseFormat = buildCampaignSchema({ includeLandingPage, includeRepurpose });
    } else if (mode === "sequence") {
      responseFormat = buildSequenceSchema(clampedSequenceLength);
    }

    // Tool use (send_email) is only offered in normal chat mode, and
    // only to logged-in users — guests never get tool access, since
    // an anonymous visitor triggering real outbound email is an abuse
    // vector we don't want to open up.
    const toolsForThisRequest = (!isStructuredMode && user) ? [EMAIL_TOOL] : undefined;

    const conversationMessages = [
      { role: "system", content: systemContent },
      ...messages
    ];

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: usingTextModel ? TEXT_MODEL : VISION_MODEL,
        messages: conversationMessages,
        ...(usingTextModel ? { reasoning_format: "hidden" } : {}),
        ...(responseFormat ? { response_format: responseFormat } : {}),
        ...(toolsForThisRequest ? { tools: toolsForThisRequest, tool_choice: "auto" } : {})
      })
    });

    let data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API error:", groqResponse.status, JSON.stringify(data));
      return res.status(groqResponse.status).json({ error: data.error?.message || "Groq API error" });
    }

    // --------------------------------------------------------------
    // Tool-call handling — only relevant in normal mode, only when the
    // model actually asked to call something. Execute each tool call
    // for real, feed the result back, then ask Groq once more (no
    // tools this time) for the natural-language reply that reports
    // what happened.
    // --------------------------------------------------------------
    let toolResultsForClient = [];
    let assistantMessage = data.choices?.[0]?.message;

    if (assistantMessage?.tool_calls?.length) {
      conversationMessages.push(assistantMessage);

      for (const call of assistantMessage.tool_calls) {
        if (call.function.name === "send_email") {
          let args;
          try {
            args = JSON.parse(call.function.arguments);
          } catch {
            args = {};
          }

          const result = await sendBrevoEmail(args);
          toolResultsForClient.push({ tool: "send_email", ...result, to: args.to, subject: args.subject });

          conversationMessages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result)
          });
        } else {
          // Unknown tool name — shouldn't happen since we only ever
          // offer EMAIL_TOOL, but fail closed rather than silently
          // dropping the call.
          conversationMessages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({ ok: false, error: "Unknown tool" })
          });
        }
      }

      const followUpResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: usingTextModel ? TEXT_MODEL : VISION_MODEL,
          messages: conversationMessages,
          ...(usingTextModel ? { reasoning_format: "hidden" } : {})
        })
      });

      data = await followUpResponse.json();

      if (!followUpResponse.ok) {
        console.error("Groq API error (tool follow-up):", followUpResponse.status, JSON.stringify(data));
        return res.status(followUpResponse.status).json({ error: data.error?.message || "Groq API error" });
      }
    }

    const rawReply = data.choices?.[0]?.message?.content || "";

    if (mode === "campaign") {
      const campaign = JSON.parse(rawReply);
      const warnings = checkDeliverability(campaign, settings?.region);

      if (settings?.aiDisclosure) {
        campaign.body = appendDisclosure(campaign.body);
      }

      return res.status(200).json({ campaign, warnings, aiDisclosure: Boolean(settings?.aiDisclosure) });
    }

    if (mode === "sequence") {
      const sequence = JSON.parse(rawReply);
      const warnings = (sequence.emails || []).map((email) => checkDeliverability(email, settings?.region));

      if (settings?.aiDisclosure) {
        (sequence.emails || []).forEach((e) => { e.body = appendDisclosure(e.body); });
      }

      return res.status(200).json({ sequence, warnings, aiDisclosure: Boolean(settings?.aiDisclosure) });
    }

    const reply = stripThinkingBlock(rawReply);
    const sources = searchResults
      ? searchResults.map((r) => ({ title: r.title, url: r.url }))
      : [];

    // Everyone gets suggestions (guests included); only logged-in,
    // non-private-mode users get memory extraction — guests have
    // nowhere persistent to store it, and private mode is explicitly
    // "don't remember anything from this conversation."
    const latestUserText = getLatestUserText(messages);
    const existingMemories = (settings?.memories || []).map((m) => m.text);
    const extras = await extractPostReplyExtras(apiKey, latestUserText, reply, existingMemories);

    const memory = (user && !privateMode) ? extras?.memory ?? null : null;
    const suggestions = extras?.suggestions ?? [];

    return res.status(200).json({ reply, sources, memory, suggestions, toolResults: toolResultsForClient });

  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
};
