const crypto = require("crypto");

const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";

function supabaseHeaders() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  return {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Prefer": "return=representation,resolution=merge-duplicates"
  };
}

function extractUserId(reference) {
  // reference format: ATM-<userId>-<timestamp>
  const match = /^ATM-(.+)-\d+$/.exec(reference || "");
  return match ? match[1] : null;
}

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const secretKey = process.env.KORAPAY_SECRET_KEY;
  const signature = req.headers["x-korapay-signature"];
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(req.body.data))
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.body.event;
  const data = req.body.data;

  if (event === "charge.completed" && data.status === "success") {
    const userId = extractUserId(data.reference);

    if (userId) {
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
        method: "POST",
        headers: supabaseHeaders(),
        body: JSON.stringify({
          user_id: userId,
          plan: "pro",
          status: "active",
          current_period_end: periodEnd.toISOString()
        })
      });
    }
  }

  return res.status(200).json({ received: true });
};
