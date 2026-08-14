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

exports.handler = async function (event, context) {
  // Only allow POST requests — anything else gets rejected.
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Require a logged-in user, so random visitors can't burn through
  // your API quota without an account.
  const user = context.clientContext && context.clientContext.user;
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
        model: "llama-3.3-70b-versatile",
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
