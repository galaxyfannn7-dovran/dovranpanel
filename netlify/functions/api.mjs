// GET /api/info/<token>  -> JSON: ady, galan gün, serwerler
// GET /api/ping          -> sag-lyk barlagy
import { inflateRawSync } from "node:zlib";

const unb64u = (t) => Buffer.from(t.replace(/-/g, "+").replace(/_/g, "/"), "base64");
const decode = (tok) => {
  const raw = unb64u(tok.slice(1));
  return JSON.parse((tok[0] === "z" ? inflateRawSync(raw) : raw).toString("utf8"));
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });

export default async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" } });

  const parts = new URL(req.url).pathname.split("/").filter(Boolean); // ["api", "info", "<token>"]
  const action = parts[1];

  if (action === "ping") return json({ ok: true, time: Date.now() });

  if (action === "info" && parts[2]) {
    try {
      const o = decode(decodeURIComponent(parts[2]).replace(/\.txt$/i, ""));
      const left = Math.ceil((o.e - Date.now()) / 864e5);
      return json({
        name: o.n,
        expire: o.e,
        daysLeft: Math.max(left, 0),
        active: left > 0,
        servers: left > 0 ? o.s : [],
      });
    } catch {
      return json({ error: "Token nädogry" }, 400);
    }
  }
  return json({ error: "Tapylmady" }, 404);
};

export const config = { path: "/api/*" };
