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
  const user = await verifySupabaseToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Not logged in." });

  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/integrations?user_id=eq.${user.id}&select=provider,created_at`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );

  const integrations = await response.json();
  res.status(200).json({ integrations: Array.isArray(integrations) ? integrations : [] });
};
