# CORS Configuration Guide

The API uses Fastify with `@fastify/cors`. By default (current state in `apps/api/src/index.ts`), **all origins are allowed**:

```ts
app.register(cors, {
  origin: (_origin, cb) => cb(null, true), // allow all origins
  credentials: true
});
```

If you see CORS errors from the browser but this code is in place, it usually means the request never reaches the API (e.g., redirected/blocked by Cloudflare/proxy). Always test both through the public domain and directly to the origin to confirm.

## Common Checks
- Hit the API directly to confirm headers:
  ```bash
  curl -I -H "Origin: https://your-web-domain.com" https://api.your-domain.com/health
  ```
  You should see `Access-Control-Allow-Origin: *`.
- If you’re behind Cloudflare or another proxy and only see proxy headers (e.g., `server: cloudflare`, 3xx loop), fix the proxy config so the request reaches the API.
- Traefik or other ingress does not add CORS; it must be returned by the API.

## Restricting CORS to Specific Origins
Replace the `origin` callback with an allowlist:
```ts
const allowedOrigins = [
  "https://idareyou.ainanosolutions.com",
  "https://apiidareyou.ainanosolutions.com",
  // add more as needed
];

app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow server-to-server/no Origin
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Origin not allowed"), false);
  },
  credentials: true
});
```

## Restricting by IP (in addition to CORS)
CORS alone does not block IPs; it’s a browser control. To hard-block IPs:
- At the reverse proxy/load balancer (Cloudflare firewall rules, Traefik middleware, Nginx, etc.).
- Or add a simple Fastify preHandler:
  ```ts
  const allowedIPs = ["1.2.3.4", "5.6.7.8"];
  app.addHook("onRequest", (req, reply, done) => {
    const ip = req.ip;
    if (allowedIPs.includes(ip)) return done();
    reply.code(403).send({ error: "Forbidden" });
  });
  ```
Note: `req.ip` may be the proxy IP unless you trust proxy headers; configure `app.setTrustProxy(true)` if needed.

## Testing from the Browser
- Open DevTools → Network → request → Response Headers. You should see:
  - `Access-Control-Allow-Origin: <origin>` (or `*` if credentials are false).
  - `Access-Control-Allow-Credentials: true` (if you set `credentials: true`).
  - Preflight responses (OPTIONS) should include `Access-Control-Allow-Methods`/`-Headers`.

## Preflight Handling
Fastify CORS plugin handles OPTIONS automatically. If you add custom routes/middleware, don’t block OPTIONS.

## Troubleshooting Checklist
1) Confirm the API code has the desired `origin` config.
2) Confirm requests reach the API (no proxy loops); use `curl -v` and check the `Server` header.
3) Check preflight response headers in DevTools (OPTIONS).
4) For Cloudflare/Tunnels: remove redirect/worker rules that loop; ensure SSL mode is “Full” and the origin is reachable.
5) If still failing, hit the origin IP with `--resolve` to confirm the API’s response and headers.

## Quick Allowlist Template
Replace the CORS block in `apps/api/src/index.ts` with:
```ts
const allowed = ["https://idareyou.ainanosolutions.com"];
app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    cb(new Error("Origin not allowed"), false);
  },
  credentials: true
});
```

This will return CORS headers only for the allowed domains; others will fail the preflight. Remember to also secure at the proxy/firewall if you need hard blocking.
