// ============================================================
// This function runs on Netlify's SERVER, not in the browser.
// That's the whole point: it's the only place that knows the
// real Groq API key, so the key never reaches anyone visiting
// your site.
//
// The browser sends it a list of chat messages, this function
// adds the secret key and the system instruction, forwards
// everything to Groq, and sends the reply back.
// ============================================================

// Groq deprecated llama-3.3-70b-versatile in June 2026. These are
// its current replacements — a strong general text model, and a
// separate vision-capable model used automatically whenever a
// message includes an image.
const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.6-27b";

// A message's content is either a plain string (text-only) or an
// array of parts (text + image) when a photo was attached. This
// checks the whole conversation for any image, so once a photo's
// in the chat, later replies can still refer back to it correctly.
function conversationHasImage(messages) {
  return messages.some(
    (msg) => Array.isArray(msg.content) && msg.content.some((part) => part.type === "image_url")
  );
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
`.trim();

// Builds the full system instruction from the base plus whatever
// the user configured in the Settings panel.
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

// Same Project URL and anon key as script.js — safe to be public,
// needed here to ask Supabase "is this login token real?"
const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdXZjdnJuc2VnemVjcWRrb2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDAxOTEsImV4cCI6MjEwMjMxNjE5MX0.fnkm94U5c-gbdDMrBvVoZ4ewyEUcOlRY7TJkqkEQS1Q";

// Asks Supabase directly whether a login token is valid, and if so,
// who it belongs to. Returns the user object, or null if invalid.
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

exports.handler = async function (event) {
  // Only allow POST requests — anything else gets rejected.
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Require a logged-in user, so random visitors can't burn through
  // your API quota without an account.
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const user = await verifySupabaseToken(authHeader);
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Please log in to use the assistant." })
    };
  }

  try {
    const { messages, settings } = JSON.parse(event.body);

    // This reads the secret key from Netlify's environment
    // variables — set in the Netlify dashboard, never in code,
    // never visible to visitors.
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server is missing GROQ_API_KEY. Set it in Netlify's dashboard." })
      };
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: conversationHasImage(messages) ? VISION_MODEL : TEXT_MODEL,
        messages: [
          { role: "system", content: buildSystemInstruction(settings) },
          ...messages
        ]
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API error:", groqResponse.status, JSON.stringify(data));
      return {
        statusCode: groqResponse.status,
        body: JSON.stringify({ error: data.error?.message || "Groq API error" })
      };
    }

    const reply = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error: " + error.message })
    };
  }
};
