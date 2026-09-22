const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";
const ALLOWED_ORIGIN = "https://beeto.toheebakanni.name.ng";

async function verifySupabaseToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY }
  });
  if (!response.ok) return null;
  return response.json();
}

async function getUserIntegration(userId, provider) {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/integrations?user_id=eq.${userId}&provider=eq.${provider}&select=*`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] : null;
}

function campaignHtmlBody(campaign) {
  return `<div style="white-space:pre-wrap;font-family:sans-serif;line-height:1.5;">${(campaign.body || "").replace(/</g, "&lt;")}</div>`;
}

async function sendViaBrevo(integration, { campaign, listId, subjectLine, senderName, senderEmail }) {
  const createRes = await fetch("https://api.brevo.com/v3/emailCampaigns", {
    method: "POST",
    headers: { "api-key": integration.access_token, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: subjectLine.slice(0, 60),
      subject: subjectLine,
      sender: { name: senderName || "Beeto", email: senderEmail },
      htmlContent: campaignHtmlBody(campaign),
      recipients: { listIds: [Number(listId)] }
    })
  });
  const data = await createRes.json();
  if (!createRes.ok) throw new Error(data?.message || "Brevo rejected the campaign.");

  const sendRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${data.id}/sendNow`, {
    method: "POST",
    headers: { "api-key": integration.access_token }
  });
  if (!sendRes.ok) throw new Error("Campaign created but couldn't send. Check your Brevo dashboard.");

  return { campaignId: data.id };
}

async function sendViaMailchimp(integration, { campaign, listId, subjectLine, senderName, senderEmail }) {
  const dc = integration.provider_account_id; // Mailchimp's datacenter prefix, e.g. "us21"
  if (!dc) throw new Error("Mailchimp connection is missing its datacenter info — reconnect Mailchimp.");

  const base = `https://${dc}.api.mailchimp.com/3.0`;
  const headers = { Authorization: `Bearer ${integration.access_token}`, "Content-Type": "application/json" };

  const createRes = await fetch(`${base}/campaigns`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      type: "regular",
      recipients: { list_id: listId },
      settings: { subject_line: subjectLine, from_name: senderName || "Beeto", reply_to: senderEmail }
    })
  });
  const created = await createRes.json();
  if (!createRes.ok) throw new Error(created?.detail || "Mailchimp rejected the campaign.");

  await fetch(`${base}/campaigns/${created.id}/content`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ html: campaignHtmlBody(campaign) })
  });

  const sendRes = await fetch(`${base}/campaigns/${created.id}/actions/send`, { method: "POST", headers });
  if (!sendRes.ok) throw new Error("Campaign created but couldn't send. Check your Mailchimp dashboard.");

  return { campaignId: created.id };
}

async function sendViaKlaviyo(integration, { campaign, listId, subjectLine, senderName, senderEmail }) {
  // Klaviyo's campaign-creation API needs a few more setup pieces
  // (a message template, a sending schedule) than Brevo/Mailchimp's
  // single-call flow. I'd rather build and test this one specifically
  // once Brevo/Mailchimp are confirmed working, so it doesn't silently
  // fail during multi-provider testing.
  throw new Error("Klaviyo sending isn't wired up yet — Brevo and Mailchimp are ready to use.");
}

module.exports = async function (req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const origin = req.headers.origin;
  if (origin !== ALLOWED_ORIGIN) return res.status(403).json({ error: "Forbidden" });

  const user = await verifySupabaseToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "You need to be logged in to send a campaign." });

  const { provider, campaign, listId, subjectLine, senderName, senderEmail } = req.body || {};

  if (!provider) return res.status(400).json({ error: "No platform selected." });
  if (!campaign || !campaign.body) return res.status(400).json({ error: "No campaign data provided." });
  if (!listId) return res.status(400).json({ error: "No list selected." });
  if (!subjectLine) return res.status(400).json({ error: "No subject line selected." });
  if (!senderEmail) return res.status(400).json({ error: "No sender email set." });

  const integration = await getUserIntegration(user.id, provider);
  if (!integration) {
    return res.status(400).json({ error: `Connect your ${provider} account in Settings first.` });
  }

  try {
    let result;
    if (provider === "brevo") result = await sendViaBrevo(integration, { campaign, listId, subjectLine, senderName, senderEmail });
    else if (provider === "mailchimp") result = await sendViaMailchimp(integration, { campaign, listId, subjectLine, senderName, senderEmail });
    else if (provider === "klaviyo") result = await sendViaKlaviyo(integration, { campaign, listId, subjectLine, senderName, senderEmail });
    else return res.status(400).json({ error: "Unknown platform." });

    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error(`send-campaign (${provider}) failed:`, error.message);
    res.status(500).json({ error: error.message });
  }
};
