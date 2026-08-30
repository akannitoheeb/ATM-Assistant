// ============================================================
// /api/create-support-payment
//
// Called when someone clicks "Support this project" (the "buy me a
// coffee" button). Starts a ONE-TIME Flutterwave payment for
// whatever amount they choose and returns the payment link for the
// frontend to redirect to. Unlike /api/create-payment, this is not
// a subscription and does NOT require the user to be logged in —
// guests can support the project too.
//
// Requires this Vercel environment variable (same one create-payment
// already uses):
//   FLW_SECRET_KEY   — Flutterwave secret key (Test or Live)
// ============================================================

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

  // Login is optional here — guests can support the project too.
  // We only use the token, if present, to attach the supporter's
  // real email/id instead of a generic guest one.
  const user = await verifySupabaseToken(req.headers.authorization);

  const { amount, currency } = req.body || {};

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ error: "Enter a valid amount." });
  }
  if (!["NGN", "USD"].includes(currency)) {
    return res.status(400).json({ error: "Unsupported currency." });
  }

  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Server is missing FLW_SECRET_KEY." });
  }

  const tx_ref = `atm-support-${user ? user.id : "guest"}-${Date.now()}`;

  // Flutterwave's payload validator expects meta values to be strings —
  // sending `user_id: null` for guests was tripping a generic
  // "string did not match the expected pattern" rejection. Only add
  // user_id when we actually have one.
  const meta = { type: "support" };
  if (user) meta.user_id = user.id;

  try {
    const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        tx_ref,
        amount: String(Math.round(Number(amount))),
        currency,
        redirect_url: "https://assistant.toheebakanni.name.ng/?supported=1",
        customer: { email: user ? user.email : "guest@toheebakanni.name.ng" },
        customizations: {
          title: "Support ATM Assistant",
          description: "One-time support payment — thank you!"
        },
        meta
      })
    });

    const data = await flwResponse.json();
    console.log("Flutterwave response:", JSON.stringify(data));

    if (data.status !== "success") {
      console.error("Flutterwave error:", JSON.stringify(data));
      return res.status(500).json({ error: data.message || "Could not start payment." });
    }

    return res.status(200).json({ link: data.data.link });
  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
};
