// ============================================================
// This function is how logged-in users' data gets saved and
// loaded from the SERVER, instead of just their own browser.
//
// GET  request  -> returns this user's saved sessions + settings
// POST request  -> saves this user's sessions + settings
//
// "This user" is determined by their login token (JWT), which
// Netlify Identity automatically attaches to the request when
// the browser is logged in — see the identity check below.
// ============================================================

const { getStore } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  // Netlify Identity puts the logged-in user's info here automatically,
  // IF the browser sent a valid login token with the request.
  const user = context.clientContext && context.clientContext.user;

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Not logged in." })
    };
  }

  // Each user gets their own storage "key", based on their unique
  // account ID — so User A can never see or overwrite User B's data.
  const store = getStore("atm-user-data");
  const key = `user-${user.sub}`;

  if (event.httpMethod === "GET") {
    try {
      const existing = await store.get(key, { type: "json" });
      return {
        statusCode: 200,
        body: JSON.stringify(existing || { sessions: [], settings: null })
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to load data: " + error.message })
      };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);
      await store.setJSON(key, {
        sessions: body.sessions || [],
        settings: body.settings || null
      });
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to save data: " + error.message })
      };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
