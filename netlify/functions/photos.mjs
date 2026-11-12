// TalkBoard photo search — a small proxy in front of the Openverse API.
// Only public-domain (PDM) and CC0 photos, mature content excluded.
// Results are cached at Netlify's CDN, so repeated searches (from any family or school) don't hit Openverse again.
// Optional env vars OPENVERSE_CLIENT_ID / OPENVERSE_CLIENT_SECRET use a registered Openverse app for higher limits.
import { openverseFetch } from "../lib/openverse.mjs";

const MAX_Q = 60;

export default async (req) => {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").replace(/[^\p{L}\p{N}\s'’-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, MAX_Q);
  const page = Math.min(50, Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1));
  const size = Math.min(20, Math.max(1, parseInt(url.searchParams.get("size") || "20", 10) || 20));
  if (!q) return json({ error: "missing q" }, 400, "no-store");

  const api = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&mature=false&page_size=${size}&page=${page}`;
  let r;
  try {
    r = await openverseFetch(api);
  } catch (e) {
    return json({ error: "upstream unavailable" }, 503, "no-store", { "Retry-After": "10" });
  }
  if (r.status === 429) return json({ error: "busy" }, 503, "no-store", { "Retry-After": r.headers.get("retry-after") || "30" });
  if (!r.ok) return json({ error: "upstream " + r.status }, 502, "no-store");

  const j = await r.json();
  const items = (j.results || [])
    .filter((x) => x && x.id && (x.license === "cc0" || x.license === "pdm"))
    .map((x) => ({
      id: x.id,
      title: String(x.title || "").slice(0, 120),
      license: x.license,
      source: x.source || "",
      thumb: `/api/photo-thumb/${x.id}`,
      landing: x.foreign_landing_url || "",
    }));
  // Browser keeps it an hour; Netlify's CDN keeps it a week and shares it with everyone.
  return json({ total: j.result_count || 0, items }, 200, "public, max-age=3600", {
    "Netlify-CDN-Cache-Control": "public, durable, s-maxage=604800, stale-while-revalidate=86400",
  });
};

function json(body, status, cache, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": cache, ...extra },
  });
}

export const config = { path: "/api/photos", method: "GET" };
