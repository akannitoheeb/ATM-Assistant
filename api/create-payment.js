const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdXZjdnJuc2VnemVjcWRrb2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDAxOTEsImV4cCI6MjEwMjMxNjE5MX0.fnkm94U5c-gbdDMrBvVoZ4ewyEUcOlRY7TJkqkEQS1Q";

const ALLOWED_ORIGIN = "https://assistant.toheebakanni.name.ng";

const PRO_PRICE = { NGN: 8000, USD: 5 };

async function verifySupabaseToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "");

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY }
  });

  if (!response.ok) return null;
  return response.json();
}

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const origin = req.headers.origin;
  if (origin !== ALLOWED_ORIGIN) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const user = await verifySupabaseToken(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Please log in to upgrade." });
  }

  const { currency } = req.body;
  const amount = PRO_PRICE[currency];

  if (!amount) {
    return res.status(400).json({ error: "Unsupported currency." });
  }

  const publicKey = process.env.KORAPAY_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ error: "Server is missing KORAPAY_PUBLIC_KEY." });
  }

  const reference = `ATM-${user.id}-${Date.now()}`;

  return res.status(200).json({
    reference,
    publicKey,
    amount,
    currency,
    email: user.email
  });
};
