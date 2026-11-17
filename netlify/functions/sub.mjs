// GET /sub/<token>.txt  -> VPN abunalyk (Happ / v2rayN / Streisand we ş.m.)
import { inflateRawSync } from "node:zlib";

const unb64u = (t) => Buffer.from(t.replace(/-/g, "+").replace(/_/g, "/"), "base64");

function decode(tok) {
  const raw = unb64u(tok.slice(1));
  const buf = tok[0] === "z" ? inflateRawSync(raw) : raw;
  return JSON.parse(buf.toString("utf8")); // { n, e, s }
}

const text = (body, status = 200, extra = {}) =>
  new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", ...extra },
  });

export default async (req) => {
  try {
    const tok = decodeURIComponent(new URL(req.url).pathname.split("/").pop()).replace(/\.txt$/i, "");
    if (!tok) return text("token yok", 400);

    const o = decode(tok);
    const servers = (o.s || []).filter((s) => /^[a-z0-9]+:\/\//i.test(s));

    if (Date.now() > o.e) return text("Möhleti gutardy", 403);
    if (!servers.length) return text("Serwer ýok", 404);

    const title = "base64:" + Buffer.from("DOVRANPANEL - " + o.n).toString("base64");
    return text(Buffer.from(servers.join("\n")).toString("base64"), 200, {
      "profile-title": title,
      "profile-update-interval": "12",
      "subscription-userinfo": `upload=0; download=0; total=0; expire=${Math.floor(o.e / 1000)}`,
      "content-disposition": `attachment; filename="${encodeURIComponent(o.n)}.txt"`,
    });
  } catch {
    return text("Token nädogry", 400);
  }
};

export const config = { path: "/sub/*" };
