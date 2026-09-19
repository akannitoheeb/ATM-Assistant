// ============================================================
// Text-to-speech via ElevenLabs — gives Beeto its actual chosen
// voice, instead of (or as an upgrade over) whatever robotic default
// voice the browser/OS ships. Used by both the per-message "Listen"
// button and voice mode's auto-playback, via speakText() in script.js.
//
// Restricted to logged-in users only: ElevenLabs bills per character
// generated, so this follows the same cost-gating reasoning as the
// send_email tool in chat.js — guests get a 401 here and the client
// silently falls back to the browser's free built-in voice instead.
//
// Requires an ELEVENLABS_API_KEY env var (from elevenlabs.io).
// ============================================================

const ALLOWED_ORIGIN = "https://beeto.toheebakanni.name.ng";

// The specific ElevenLabs voice picked for Beeto.
const VOICE_ID = "J9NvviOEdVm6E7Hwdpdj";

// ElevenLabs bills per character — this caps what a single reply can
// cost to speak. Long replies still show in full as text; only the
// audio gets trimmed.
const MAX_TTS_CHARS = 2000;

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

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const origin = req.headers.origin;
  if (origin !== ALLOWED_ORIGIN) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const user = await verifySupabaseToken(req.headers.authorization);
  if (!user) {
    // Client-side, this 401 is expected and silent for guests — it's
    // what triggers the fallback to the browser's own voice rather
    // than showing an error.
    return res.status(401).json({ error: "Sign in to use Beeto's voice." });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing ELEVENLABS_API_KEY. Set it in Vercel's dashboard." });
  }

  const { text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "No text provided." });
  }

  const trimmedText = text.trim().slice(0, MAX_TTS_CHARS);

  try {
    const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: trimmedText,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!elevenResponse.ok) {
      const errText = await elevenResponse.text();
      console.error("ElevenLabs TTS error:", elevenResponse.status, errText);
      return res.status(elevenResponse.status).json({ error: "TTS generation failed." });
    }

    const arrayBuffer = await elevenResponse.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("ElevenLabs TTS request failed:", error.message);
    return res.status(500).json({ error: "Server error: " + error.message });
  }
};
