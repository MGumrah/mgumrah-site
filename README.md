# mgumrah-site

Personal website and application documentation hub for mgumrah.com. Built with Next.js static export and deployed to Cloudflare.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Cloudflare should build the Next.js static export before deployment. Use this deployment flow:

```bash
npm run build && npx wrangler deploy
```

## /brief

`/brief` is a private scoping form. The site is a static export, so the answers
are taken by a small Worker (`worker/index.ts`) that stores them in KV; every
other request is served from `out/` without the Worker running.

- `POST /api/brief` — what the form submits to.
- `/brief/inbox?token=…` — read what came in. The token is the `BRIEF_TOKEN`
  secret; without it the route 404s.

```bash
npx wrangler secret put BRIEF_TOKEN     # set once, survives deploys
npx wrangler kv key list --binding BRIEF --remote --prefix brief:
```
