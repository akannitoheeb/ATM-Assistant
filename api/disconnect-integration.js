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

module.exports = async function (req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await verifySupabaseToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Not logged in." });

  const { provider } = req.body || {};
  if (!provider) return res.status(400).json({ error: "Missing provider." });

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  await fetch(
    `${SUPABASE_URL}/rest/v1/integrations?user_id=eq.${user.id}&provider=eq.${provider}`,
    { method: "DELETE", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );

  res.status(200).json({ ok: true });
};
