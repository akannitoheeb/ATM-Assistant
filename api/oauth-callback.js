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
    "Authorization": `Bearer ${serviceKey}`
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
  return response.json();
}

// Mailchimp's metadata endpoint returns the real account owner's login
// email — this is what makes "Continue with Mailchimp" a genuine login.
async function getMailchimpIdentity(accessToken) {
  const response = await fetch("https://login.mailchimp.com/oauth2/metadata", {
    headers: { Authorization: `OAuth ${accessToken}` }
  });
  if (!response.ok) throw new Error("Could not read Mailchimp account info.");
  const data = await response.json();
  return {
    email: data.login?.email || null,
    dc: data.dc || null
  };
}

// Klaviyo has no per-user "who am I" endpoint tied to OAuth — this reads
// the account's default sender email as a best-effort identity. It is
// NOT guaranteed to be the actual logged-in person, only the account's
// marketing sender, so this is used with a confirmation step client-side.
async function getKlaviyoIdentity(accessToken) {
  const response = await fetch("https://a.klaviyo.com/api/accounts/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      revision: "2024-10-15"
    }
  });
  if (!response.ok) throw new Error("Could not read Klaviyo account info.");
  const data = await response.json();
  const attrs = data?.data?.[0]?.attributes;
  return {
    email: attrs?.contact_information?.default_sender_email || null,
    dc: null
  };
}

module.exports = async function (req, res) {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send("Missing code or state.");

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

    let identity = { email: null, dc: null };
    if (provider === "mailchimp") {
      identity = await getMailchimpIdentity(tokenData.access_token);
    } else if (provider === "klaviyo") {
      identity = await getKlaviyoIdentity(tokenData.access_token);
    }

    if (mode === "login") {
      if (!identity.email) {
        return res.redirect(`${process.env.OAUTH_REDIRECT_BASE}/oauth-finish.html#error=no_email&provider=${provider}`);
      }

      // Find-or-create the Supabase user by email, then generate a
      // magic-link token the browser can redeem to actually log in.
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(identity.email)}`, {
        headers: supabaseHeaders()
      });
      const listData = await listRes.json();
      let userExists = Array.isArray(listData.users) && listData.users.length > 0;

      if (!userExists) {
        const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
          method: "POST",
          headers: supabaseHeaders(),
          body: JSON.stringify({ email: identity.email, email_confirm: true })
        });
        if (!createRes.ok) throw new Error("Could not create account.");
      }

      const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
        method: "POST",
        headers: supabaseHeaders(),
        body: JSON.stringify({ type: "magiclink", email: identity.email })
      });
      const linkData = await linkRes.json();
      if (!linkRes.ok) throw new Error("Could not generate login link.");

      const payload = Buffer.from(JSON.stringify({
        mode: "login",
        provider,
        email: identity.email,
        token_hash: linkData.hashed_token || linkData.properties?.hashed_token,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: expiresAt,
        provider_account_id: identity.dc,
        needs_confirm: provider === "klaviyo" // Klaviyo email is best-effort, ask before trusting it
      })).toString("base64url");

      return res.redirect(`${process.env.OAUTH_REDIRECT_BASE}/oauth-finish.html#data=${payload}`);
    }

    // connect mode — same as before
    const payload = Buffer.from(JSON.stringify({
      mode: "connect",
      provider,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      provider_account_id: identity.dc
    })).toString("base64url");

    res.redirect(`${process.env.OAUTH_REDIRECT_BASE}/oauth-finish.html#data=${payload}`);
  } catch (error) {
    console.error("OAuth callback failed:", error.message);
    res.status(500).send("Something went wrong connecting your account.");
  }
};