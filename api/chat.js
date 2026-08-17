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
// ============================================================

const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.6-27b";

const ALLOWED_ORIGIN = "https://assistant.toheebakanni.name.ng";
const MAX_GUEST_MESSAGE_CHARS = 4000;
const GLOBAL_GUEST_DAILY_CAP = 300;

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

const BASE_INSTRUCTION = `
You are ATM Assistant, a helpful general-purpose AI assistant that can discuss
any topic the user brings up — questions, advice, writing, explanations, etc.

You have particularly deep, practical expertise in email marketing and
copywriting: subject lines, segmentation, automation flows, deliverability,
and conversion copy. When a question touches marketing, lean into that
expertise with specific, actionable answers rather than generic tips.

For everything else, just be a clear, direct, genuinely useful assistant.
Keep answers reasonably concise unless the user asks for depth.

Do not use emoji by default — keep a mature, professional tone. Only use one
if the user's own message includes emoji, or in the rare moment a touch of
humor or genuine sympathy calls for it.
`.trim();

const CAMPAIGN_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "email_campaign",
    strict: true,
    schema: {
      type: "object",
      properties: {
        subject_lines: { type: "array", items: { type: "string" } },
        preheader: { type: "string" },
        body: { type: "string" },
        cta_text: { type: "string" }
      },
      required: ["subject_lines", "preheader", "body", "cta_text"],
      additionalProperties: false
    }
  }
};

function buildSystemInstruction(settings = {}) {
  const parts = [BASE_INSTRUCTION];

  if (settings.tone) {
    parts.push(`Default tone for your replies: ${settings.tone}.`);
  }

  if (settings.emphasizeNigeria) {
    parts.push("When discussing marketing, factor in an understanding of the Nigerian small-business market specifically.");
  }

  if (settings.customInstruction) {
    parts.push(`Additional instructions from the user: ${settings.customInstruction}`);
  }

  return parts.join("\n\n");
}

function stripThinkingBlock(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdXZjdnJuc2VnemVjcWRrb2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDAxOTEsImV4cCI6MjEwMjMxNjE5MX0.fnkm94U5c-gbdDMrBvVoZ4ewyEUcOlRY7TJkqkEQS1Q";

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
async function getUserPlanLimit(userId) {
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

  return isActivePro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
}

async function checkAndIncrementUsage(userId, limit) {
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
      body: JSON.stringify({ user_id: userId, message_count: 1, reset_date: today })
    });
    return { blocked: false };
  }

  if (row.reset_date !== today) {
    await fetch(`${SUPABASE_URL}/rest/v1/usage_limits?user_id=eq.${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ message_count: 1, reset_date: today })
    });
    return { blocked: false };
  }

  if (row.message_count >= limit) {
    return { blocked: true };
  }

  await fetch(`${SUPABASE_URL}/rest/v1/usage_limits?user_id=eq.${userId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ message_count: row.message_count + 1 })
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

  const authHeader = req.headers.authorization;
  const user = authHeader ? await verifySupabaseToken(authHeader) : null;

  if (user) {
    const limit = await getUserPlanLimit(user.id);
    const usage = await checkAndIncrementUsage(user.id, limit);
    if (usage.blocked) {
      return res.status(429).json({
        error: `You've reached today's limit of ${limit} messages. Resets at midnight.${limit === FREE_DAILY_LIMIT ? " Upgrade to Pro for a higher limit." : ""}`,
        code: "USER_LIMIT"
      });
    }
  } else {
    const { messages: incomingMessages } = req.body || {};
    if (Array.isArray(incomingMessages) && totalMessageChars(incomingMessages) > MAX_GUEST_MESSAGE_CHARS) {
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
    const { messages, settings, mode } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server is missing GROQ_API_KEY. Set it in Vercel's dashboard." });
    }

    const usingTextModel = !conversationHasImage(messages);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: usingTextModel ? TEXT_MODEL : VISION_MODEL,
        messages: [
          { role: "system", content: buildSystemInstruction(settings) },
          ...messages
        ],
        ...(usingTextModel ? { reasoning_format: "hidden" } : {}),
        ...(mode === "campaign" ? { response_format: CAMPAIGN_SCHEMA } : {})
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API error:", groqResponse.status, JSON.stringify(data));
      return res.status(groqResponse.status).json({ error: data.error?.message || "Groq API error" });
    }

    const rawReply = data.choices?.[0]?.message?.content || "";

    if (mode === "campaign") {
      const campaign = JSON.parse(rawReply);
      return res.status(200).json({ campaign });
    }

    const reply = stripThinkingBlock(rawReply);
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
};
