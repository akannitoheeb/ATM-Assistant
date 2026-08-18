// ============================================================
// /api/create-payment
//
// Called when a logged-in user clicks "Upgrade to Pro." Starts a
// Flutterwave subscription checkout and returns the payment link
// for the frontend to redirect to.
//
// Requires these Vercel environment variables:
//   FLW_SECRET_KEY   — Flutterwave secret key (Test or Live)
//   FLW_PLAN_ID_NGN  — Payment Plan ID for the ₦8,000/mo plan
//   FLW_PLAN_ID_USD  — Payment Plan ID for the $9/mo plan
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

const PLAN_CONFIG = {
  NGN: { amount: "8000", planId: process.env.FLW_PLAN_ID_NGN || "167115" },
  USD: { amount: "9", planId: process.env.FLW_PLAN_ID_USD || "167116" }
};

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const user = await verifySupabaseToken(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Please log in first." });
  }

  const { currency } = req.body || {};
  const config = PLAN_CONFIG[currency];
  if (!config) {
    return res.status(400).json({ error: "Unsupported currency." });
  }

  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Server is missing FLW_SECRET_KEY." });
  }

  const tx_ref = `atm-pro-${user.id}-${Date.now()}`;

  try {
    const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        tx_ref,
        amount: config.amount,
        currency,
        payment_plan: config.planId,
        redirect_url: "https://assistant.toheebakanni.name.ng/?upgraded=1",
        customer: { email: user.email },
        customizations: {
          title: "ATM Assistant Pro",
          description: "Monthly subscription"
        },
        meta: { user_id: user.id }
      })
    });

    const data = await flwResponse.json();

    if (data.status !== "success") {
      console.error("Flutterwave error:", JSON.stringify(data));
      return res.status(500).json({ error: data.message || "Could not start payment." });
    }

    return res.status(200).json({ link: data.data.link });
  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
};
