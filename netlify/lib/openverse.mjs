// Shared Openverse access for the TalkBoard functions.
// If OPENVERSE_CLIENT_ID and OPENVERSE_CLIENT_SECRET are set (a registered, email-verified Openverse app),
// requests use a bearer token for higher rate limits; otherwise they are anonymous.
// Helper module (not a function itself); imported by netlify/functions/*.

let token = null; // { value, expires }

async function getToken() {
  const id = globalThis.Netlify?.env.get("OPENVERSE_CLIENT_ID");
  const secret = globalThis.Netlify?.env.get("OPENVERSE_CLIENT_SECRET");
  if (!id || !secret) return null;
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const r = await fetch("https://api.openverse.org/v1/auth_tokens/token/", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  if (!r.ok) return null; // fall back to anonymous requests
  const j = await r.json();
  token = { value: j.access_token, expires: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
  return token.value;
}

export async function openverseFetch(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    const t = await getToken().catch(() => null);
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 12000);
    try {
      const r = await fetch(url, {
        signal: ac.signal,
        headers: { "user-agent": "TalkBoardAAC/1.0 (+https://talkboard-aac-qxh1.netlify.app)", ...(t ? { authorization: `Bearer ${t}` } : {}) },
      });
      if (r.status === 401 && t) { token = null; continue; } // token expired: get a new one
      if (r.ok || r.status === 404 || r.status === 400) return r;
      last = r;
    } catch (e) {
      last = e;
    } finally {
      clearTimeout(timer);
    }
    await new Promise((ok) => setTimeout(ok, 600 * (i + 1)));
  }
  if (last instanceof Response) return last;
  throw last || new Error("openverse unavailable");
}
