// ============================================================
// This function runs on Vercel's SERVER, not in the browser.
// Same purpose as before: keeps the real Groq API key hidden
// from anyone visiting the site.
//
// Stage 4: requests with no login token are now allowed through
// as "guests," limited to 1 message per IP address per day.
// ============================================================

const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.6-27b";

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

Do not use emoji by default — keep a mature, professional tone. Only use one
if the user's own message includes emoji, or in the rare moment a touch of
humor or genuine sympathy calls for it.
`.trim();

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

const DAILY_MESSAGE_LIMIT = 25;
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

async function checkAndIncrementUsage(userId) {
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

  if (row.message_count >= DAILY_MESSAGE_LIMIT) {
    return { blocked: true };
  }

  await fetch(`${SUPABASE_URL}/rest/v1/usage_limits?user_id=eq.${userId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ message_count: row.message_count + 1 })
  });
  return { blocked: false };
}

// Same idea as checkAndIncrementUsage, but keyed by IP address in a
// separate table — for visitors who haven't logged in yet.
async function checkAndIncrementGuestUsage(ip) {
  const today = new Date().toISOString().slice(0, 10);
  const headers = supabaseHeaders();

  const getRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ip_usage_limits?ip_address=eq.${encodeURIComponent(ip)}&select=*`,
    { headers }
  );
  const rows = await getRes.json();
  const row = rows[0];

  if (!row) {
    await fetch(`${SUPABASE_URL}/rest/v1/ip_usage_limits`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ip_address: ip, message_count: 1, reset_date: today })
    });
    return { blocked: false };
  }

  if (row.reset_date !== today) {
    await fetch(`${SUPABASE_URL}/rest/v1/ip_usage_limits?ip_address=eq.${encodeURIComponent(ip)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ message_count: 1, reset_date: today })
    });
    return { blocked: false };
  }

  if (row.message_count >= GUEST_DAILY_LIMIT) {
    return { blocked: true };
  }

  await fetch(`${SUPABASE_URL}/rest/v1/ip_usage_limits?ip_address=eq.${encodeURIComponent(ip)}`, {
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

  const authHeader = req.headers.authorization;
  const user = authHeader ? await verifySupabaseToken(authHeader) : null;

  if (user) {
    const usage = await checkAndIncrementUsage(user.id);
    if (usage.blocked) {
      return res.status(429).json({
        error: `You've reached today's limit of ${DAILY_MESSAGE_LIMIT} messages. Resets at midnight.`,
        code: "USER_LIMIT"
      });
    }
  } else {
    const ip = getClientIp(req);
    const usage = await checkAndIncrementGuestUsage(ip);
    if (usage.blocked) {
      return res.status(403).json({
        error: "You've used your free message for today. Sign up or log in to keep chatting.",
        code: "GUEST_LIMIT"
      });
    }
  }

  try {
    const { messages, settings } = req.body;
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
        ...(usingTextModel ? { reasoning_format: "hidden" } : {})
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API error:", groqResponse.status, JSON.stringify(data));
      return res.status(groqResponse.status).json({ error: data.error?.message || "Groq API error" });
    }

    const rawReply = data.choices?.[0]?.message?.content || "";
    const reply = stripThinkingBlock(rawReply);
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
};
