import { DurableObject } from "cloudflare:workers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { buildPrompt, quotaDecision } from "./policy.js";

const keys = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const MAX_BODY = 2048;

async function verifyUser(request, projectId) {
  const token = request.headers.get("Authorization")?.match(/^Bearer ([^ ]+)$/)?.[1];
  if (!token || token.length > 8192) throw new Error("unauthorized");
  const { payload } = await jwtVerify(token, keys, {
    issuer: "https://securetoken.google.com/" + projectId,
    audience: projectId,
    algorithms: ["RS256"],
    requiredClaims: ["exp", "iat", "sub", "auth_time"],
  });
  const now = Math.floor(Date.now() / 1000);
  if (!payload.sub || payload.sub.length > 128 ||
    typeof payload.auth_time !== "number" || payload.auth_time > now ||
    typeof payload.iat !== "number" || payload.iat > now) throw new Error("unauthorized");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload.sub));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,"0")).join("");
}

export class ImageQuota extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS counts(day TEXT NOT NULL, user TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY(day,user))");
  }
  async fetch(request) {
    const { user } = await request.json();
    if (typeof user !== "string" || !/^[a-f0-9]{64}$/.test(user)) return new Response(null,{status:400});
    const day = new Date().toISOString().slice(0,10);
    const allowed = this.ctx.storage.transactionSync(() => {
      this.sql.exec("DELETE FROM counts WHERE day <> ?", day);
      const total = this.sql.exec("SELECT COALESCE(SUM(n),0) AS n FROM counts WHERE day=?", day).one().n;
      const own = this.sql.exec("SELECT COALESCE(SUM(n),0) AS n FROM counts WHERE day=? AND user=?", day,user).one().n;
      if (!quotaDecision(total,own)) return false;
      this.sql.exec("INSERT INTO counts(day,user,n) VALUES(?,?,1) ON CONFLICT(day,user) DO UPDATE SET n=n+1",day,user);
      return true;
    });
    return new Response(null,{status:allowed?204:429});
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (!origin || !env.ALLOWED_ORIGINS.split(",").includes(origin)) return new Response(null,{status:403});
    const headers = {
      "Access-Control-Allow-Origin":origin, "Vary":"Origin",
      "Access-Control-Allow-Methods":"POST, OPTIONS",
      "Access-Control-Allow-Headers":"Authorization, Content-Type",
      "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff"
    };
    const reply = (value, status=200) => Response.json(value,{status,headers});
    if (new URL(request.url).pathname !== "/generate") return reply({error:"not-found"},404);
    if (request.method === "OPTIONS") return new Response(null,{status:204,headers});
    if (request.method !== "POST") return reply({error:"method"},405);
    if (!request.headers.get("Content-Type")?.startsWith("application/json")) return reply({error:"invalid"},415);
    let user;
    try { user = await verifyUser(request,env.FIREBASE_PROJECT_ID); }
    catch { return reply({error:"unauthorized"},401); }
    let prompt;
    try {
      // Read a bounded body, including requests without Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return reply({error:"invalid"},400);
      const decoder = new TextDecoder("utf-8",{fatal:true});
      let bytes=0, raw="";
      while (true) {
        const {done,value}=await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BODY) { await reader.cancel(); return reply({error:"invalid"},413); }
        raw += decoder.decode(value,{stream:true});
      }
      raw += decoder.decode();
      prompt = buildPrompt(JSON.parse(raw));
    } catch { return reply({error:"invalid"},400); }
    if (!prompt) return reply({error:"safety"},422);
    try {
      const gate = env.QUOTA.get(env.QUOTA.idFromName("global"));
      const reserved = await gate.fetch("https://quota.internal/reserve", {method:"POST",body:JSON.stringify({user})});
      if (reserved.status === 429) return reply({error:"quota"},429);
      if (reserved.status !== 204) return reply({error:"unavailable"},503);
      // Count every attempted generation, including failures. Never call a paid fallback.
      const result = await env.AI.run(MODEL,{prompt,steps:4});
      if (typeof result?.image !== "string" || !result.image.startsWith("/9j/") || result.image.length > 8_000_000) {
        return reply({error:"unavailable"},502);
      }
      return reply({dataUrl:"data:image/jpeg;base64,"+result.image});
    } catch { return reply({error:"unavailable"},503); }
  }
};
