const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";

const TOKEN_ENDPOINTS = {
  klaviyo: "https://a.klaviyo.com/oauth/token",
  mailchimp: "https://login.mailchimp.com/oauth2/token"
};

function supabaseHeaders() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  return {
    "Content-Type": "application/json",
    "apikey": serviceKey,
    "Authorization": `Bearer ${serviceKey}`,
    "Prefer": "return=representation"
  };
}

async function exchangeCodeForToken(provider, code, redirectUri) {
  const isKlaviyo = provider === "klaviyo";
  const clientId = isKlaviyo ? process.env.KLAVIYO_CLIENT_ID : process.env.MAILCHIMP_CLIENT_ID;
  const clientSecret = isKlaviyo ? process.env.KLAVIYO_CLIENT_SECRET : process.env.MAILCHIMP_CLIENT_SECRET;

  const response = await fetch(TOKEN_ENDPOINTS[provider], {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${await response.text()}`);
  }
  return response.json(); // { access_token, refresh_token, expires_in, ... }
}

module.exports = async function (req, res) {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.status(400).send("Missing code or state.");
  }

  let provider, mode;
  try {
    ({ provider, mode } = JSON.parse(Buffer.from(state, "base64url").toString()));
  } catch {
    return res.status(400).send("Invalid state.");
  }

  const redirectUri = `${process.env.OAUTH_REDIRECT_BASE}/api/oauth-callback`;

  try {
    const tokenData = await exchangeCodeForToken(provider, code, redirectUri);
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    // --------------------------------------------------------------
    // "connect" mode: the browser already has a logged-in Supabase
    // session. We can't read that session server-side here without
    // the client passing its access token, so this flow finishes on
    // the frontend: redirect back with the token data in the URL
    // fragment (never the query string, so it never hits server logs),
    // and script.js picks it up and calls a small save-integration
    // endpoint with its own auth header attached.
    // --------------------------------------------------------------
    const payload = Buffer.from(JSON.stringify({
      provider,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      provider_account_id: tokenData.dc || tokenData.metadata?.["hapikey"] || null // Mailchimp returns a "dc" datacenter code needed for API calls
    })).toString("base64url");

    if (mode === "login") {
      // Real "login with Klaviyo/Mailchimp" needs the provider's user
      // info endpoint to get an email, then Supabase's admin API to
      // find-or-create that user and mint a session. That's a second
      // round trip per provider (different shape each) — tell me when
      // you're ready to build "login" mode specifically and I'll write
      // that half; for now "connect" mode (below) gets you sending
      // working end to end, and login can layer on top of it.
      return res.status(501).send("Login mode not wired up yet — use Connect from Settings instead.");
    }

    // connect mode — redirect to a small landing page that finishes
    // the save client-side
    res.redirect(`${process.env.OAUTH_REDIRECT_BASE}/oauth-finish.html#data=${payload}`);
  } catch (error) {
    console.error("OAuth callback failed:", error.message);
    res.status(500).send("Something went wrong connecting your account.");
  }
};
