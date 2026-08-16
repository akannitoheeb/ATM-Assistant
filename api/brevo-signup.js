// ============================================================
// /api/brevo-signup
//
// Called once, right after a new user successfully signs up.
// Adds them as a contact in your Brevo account, in the list you
// choose below. If that list has a Brevo automation attached to
// it (Automation → "when contact is added to list X → send
// welcome email"), this is all you need for the welcome email to
// fire — no template ID required here.
//
// Requires two environment variables set in your Vercel project
// (Settings → Environment Variables):
//   BREVO_API_KEY   — from Brevo → SMTP & API → API Keys
//   BREVO_LIST_ID    — the numeric ID of the list to add contacts to
//                       (Brevo → Contacts → Lists → click the list,
//                       the ID is in the URL / list details)
// ============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    console.error("Brevo env vars are missing (BREVO_API_KEY / BREVO_LIST_ID)");
    return res.status(200).json({ ok: false, skipped: true });
  }

  const attributes = {};
  if (name) attributes.FIRSTNAME = name.split(" ")[0];

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: [Number(BREVO_LIST_ID)],
        updateEnabled: true
      })
    });

    if (!response.ok && response.status !== 400) {
      const errText = await response.text();
      console.error("Brevo API error:", response.status, errText);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Brevo request failed:", error);
    return res.status(500).json({ error: "Failed to reach Brevo" });
  }
}