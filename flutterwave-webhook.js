// ============================================================
// /api/flutterwave-webhook
//
// Flutterwave calls this URL whenever a payment (or subscription
// renewal) completes. We verify it's genuinely from Flutterwave,
// double-check the transaction directly with their API (never
// trust the webhook body alone), then mark the user as Pro.
//
// Set this exact URL in Flutterwave → Settings → Webhooks:
//   https://assistant.toheebakanni.name.ng/api/flutterwave-webhook
//
// Requires these Vercel environment variables:
//   FLW_SECRET_KEY      — same one used in create-payment.js
//   FLW_WEBHOOK_HASH     — the secret hash you set in Flutterwave's
//                          webhook settings (any random string)
//   SUPABASE_SERVICE_KEY — already set from earlier stages
// ============================================================

const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";

function supabaseHeaders() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  return {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Prefer": "resolution=merge-duplicates"
  };
}

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  // Confirm this request actually came from Flutterwave.
  const signature = req.headers["verif-hash"];
  if (!signature || signature !== process.env.FLW_WEBHOOK_HASH) {
    return res.status(401).end();
  }

  try {
    const event = req.body;

    if (event.event === "charge.completed" && event.data?.status === "successful") {
      const txId = event.data.id;

      // Never trust the webhook payload alone — verify directly
      // with Flutterwave using our secret key.
      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${txId}/verify`,
        { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
      );
      const verifyData = await verifyRes.json();
      const tx = verifyData.data;

      if (tx && tx.status === "successful") {
        const userId = tx.meta?.user_id;

        if (userId) {
          const periodEnd = new Date();
          periodEnd.setDate(periodEnd.getDate() + 30);

          await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?on_conflict=user_id`, {
            method: "POST",
            headers: supabaseHeaders(),
            body: JSON.stringify({
              user_id: userId,
              plan: "pro",
              status: "active",
              currency: tx.currency,
              tx_ref: tx.tx_ref,
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString()
            })
          });
        }
      }
    }

    // Always 200 quickly so Flutterwave doesn't endlessly retry —
    // any real issues are visible in the Vercel logs above.
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ received: true });
  }
};
