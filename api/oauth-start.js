const PROVIDERS = {
  klaviyo: {
    authUrl: "https://www.klaviyo.com/oauth/authorize",
    clientId: process.env.KLAVIYO_CLIENT_ID,
    scope: "campaigns:write lists:read lists:write"
  },
  mailchimp: {
    authUrl: "https://login.mailchimp.com/oauth2/authorize",
    clientId: process.env.MAILCHIMP_CLIENT_ID,
    scope: ""  // Mailchimp OAuth doesn't use scopes, access is all-or-nothing per account
  }
};

module.exports = async function (req, res) {
  const { provider, mode } = req.query; // mode: "login" or "connect"

  const cfg = PROVIDERS[provider];
  if (!cfg) return res.status(400).json({ error: "Unknown provider" });

  const redirectUri = `${process.env.OAUTH_REDIRECT_BASE}/api/oauth-callback`;
  // "state" carries the provider + mode through the round trip so the
  // callback knows what it's handling and whether to also log the user in.
  const state = Buffer.from(JSON.stringify({ provider, mode })).toString("base64url");

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state
  });
  if (cfg.scope) params.set("scope", cfg.scope);

  res.redirect(`${cfg.authUrl}?${params.toString()}`);
};
