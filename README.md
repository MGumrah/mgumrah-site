# mgumrah-site

Personal website and application documentation hub for mgumrah.com.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Cloudflare should build the Astro site before deployment. Use this deployment flow:

```bash
npm run build && npx wrangler deploy
```
