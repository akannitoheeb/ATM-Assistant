const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";

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

module.exports = async function (req, res) {
  const user = await verifySupabaseToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Not logged in." });

  const provider = req.query.provider;
  if (!provider) return res.status(400).json({ error: "Missing provider." });

  const integration = await getUserIntegration(user.id, provider);
  if (!integration) return res.status(400).json({ error: `${provider} isn't connected.` });

  try {
    let lists = [];

    if (provider === "brevo") {
      const r = await fetch("https://api.brevo.com/v3/contacts/lists?limit=50", {
        headers: { "api-key": integration.access_token }
      });
      const d = await r.json();
      lists = (d.lists || []).map((l) => ({ id: l.id, name: l.name, count: l.totalSubscribers }));
    } else if (provider === "mailchimp") {
      const dc = integration.provider_account_id;
      const r = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists?count=50`, {
        headers: { Authorization: `Bearer ${integration.access_token}` }
      });
      const d = await r.json();
      lists = (d.lists || []).map((l) => ({ id: l.id, name: l.name, count: l.stats?.member_count }));
    } else if (provider === "klaviyo") {
      const r = await fetch("https://a.klaviyo.com/api/lists/", {
        headers: { Authorization: `Bearer ${integration.access_token}`, revision: "2024-10-15" }
      });
      const d = await r.json();
      lists = (d.data || []).map((l) => ({ id: l.id, name: l.attributes?.name, count: null }));
    }

    res.status(200).json({ lists });
  } catch (error) {
    console.error(`list-esp-lists (${provider}) failed:`, error.message);
    res.status(500).json({ error: "Couldn't load your lists." });
  }
};
