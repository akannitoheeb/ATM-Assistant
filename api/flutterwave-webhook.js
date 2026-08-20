// ============================================================
// /api/flutterwave-webhook
//
// Flutterwave calls this URL whenever a payment (or subscription
// renewal) completes. We verify it's genuinely from Flutterwave,
// double-check the transaction directly with their API (never
// trust the webhook body alone), then mark the user as Pro.
//
// TEMP DEBUG BUILD: this version logs every step so we can see
// exactly where the write is failing. Once it's confirmed working,
// the extra console.log lines can be trimmed back out.
//
// Set this exact URL in Flutterwave -> Settings -> Webhooks:
//   https://assistant.toheebakanni.name.ng/api/flutterwave-webhook
//
// Requires these Vercel environment variables:
//   FLW_SECRET_KEY       - same one used in create-payment.js
//   FLW_WEBHOOK_HASH      - the secret hash you set in Flutterwave's
//                           webhook settings (any random string)
//   SUPABASE_SERVICE_KEY  - must be the service_role key, not anon
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
    console.error("Webhook: signature mismatch or missing FLW_WEBHOOK_HASH");
    return res.status(401).end();
  }

  try {
    const event = req.body;
    console.log("Webhook: received event", event?.event, "status:", event?.data?.status);

    if (event.event === "charge.completed" && event.data?.status === "successful") {
      const txId = event.data.id;

      // Never trust the webhook payload alone - verify directly
      // with Flutterwave using our secret key.
      const verifyRes = await fetch(
        `https://api.flutterwave.com/v3/transactions/${txId}/verify`,
        { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
      );
      const verifyData = await verifyRes.json();
      console.log("Webhook: verify response", JSON.stringify(verifyData));

      const tx = verifyData.data;
      if (tx && tx.status === "successful") {
        const userId = tx.meta?.user_id;
        console.log("Webhook: extracted user_id ->", userId);

        if (userId) {
          const periodEnd = new Date();
          periodEnd.setDate(periodEnd.getDate() + 30);

          const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?on_conflict=user_id`, {
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

          const upsertBody = await upsertRes.text();
          console.log("Webhook: Supabase upsert status", upsertRes.status, "body:", upsertBody);

          if (!upsertRes.ok) {
            console.error("Webhook: Supabase upsert FAILED", upsertRes.status, upsertBody);
          }
        } else {
          console.error("Webhook: no user_id in tx.meta - nothing to write. Full meta:", JSON.stringify(tx.meta));
        }
      } else {
        console.error("Webhook: verify did not return a successful transaction", JSON.stringify(tx));
      }
    } else {
      console.log("Webhook: event ignored (not a completed successful charge)");
    }

    // Always 200 quickly so Flutterwave doesn't endlessly retry -
    // any real issues are visible in the Vercel logs above.
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(200).json({ received: true });
  }
};
