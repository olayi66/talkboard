// TalkBoard photo thumbnail — fetches an Openverse thumbnail once and lets Netlify's CDN keep it for a year.
import { openverseFetch } from "../lib/openverse.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async (req, context) => {
  const id = (context && context.params && context.params.id) || new URL(req.url).pathname.split("/").filter(Boolean).pop();
  if (!UUID.test(id || "")) return new Response("bad id", { status: 400, headers: { "cache-control": "no-store" } });

  let r;
  try {
    r = await openverseFetch(`https://api.openverse.org/v1/images/${id}/thumb/`);
  } catch (e) {
    return new Response("unavailable", { status: 503, headers: { "cache-control": "no-store", "Retry-After": "10" } });
  }
  if (!r.ok) return new Response("unavailable", { status: r.status === 404 ? 404 : 503, headers: { "cache-control": "no-store" } });

  const type = r.headers.get("content-type") || "image/jpeg";
  if (!type.startsWith("image/")) return new Response("not an image", { status: 502, headers: { "cache-control": "no-store" } });
  return new Response(await r.arrayBuffer(), {
    status: 200,
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=2592000, immutable",
      "Netlify-CDN-Cache-Control": "public, durable, s-maxage=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
};

export const config = { path: "/api/photo-thumb/:id", method: "GET" };
