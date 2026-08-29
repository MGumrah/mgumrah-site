/**
 * mgumrah.com — the Worker in front of the static site.
 *
 * Everything on this site is a prerendered file and is served straight off
 * Cloudflare's asset storage without this code ever running. The Worker exists
 * for the one thing an asset cannot do: accept the /brief form and keep what it
 * says. Every other request falls through to the assets untouched, so the site
 * behaves exactly as it did before the Worker existed.
 *
 * Types are declared inline rather than pulled from @cloudflare/workers-types:
 * this file sits inside the Next project's tsconfig, and the two type packages
 * disagree about the shape of half the web platform.
 */

type AssetFetcher = { fetch(request: Request): Promise<Response> };

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: { name: string }[] }>;
};

type ExecutionContext = { waitUntil(promise: Promise<unknown>): void };

type Env = {
  ASSETS: AssetFetcher;
  BRIEF: KVNamespace;
  /**
   * `wrangler secret put BRIEF_TOKEN`. The inbox fails closed without it — an
   * unset secret must never mean an open door.
   */
  BRIEF_TOKEN?: string;
  /** Optional. Any URL that should receive a copy of a brief as it lands. */
  BRIEF_WEBHOOK?: string;
};

/** A brief runs ~24 answers; anything past this is not someone filling a form. */
const MAX_TEXT = 25_000;
/** Per IP, per hour. The form is public, so the write path has to be bounded. */
const MAX_PER_HOUR = 8;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Length-independent comparison. The token travels in a URL a person pastes,
 * so it is not a high-value secret, but a compare that returns early leaks it
 * one character at a time and the fix costs three lines.
 */
function tokenMatches(expected: string, given: string) {
  if (expected.length !== given.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

async function withinRateLimit(env: Env, ip: string) {
  const key = `rl:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
  const count = Number((await env.BRIEF.get(key)) ?? "0");
  if (count >= MAX_PER_HOUR) return false;
  // The window is baked into the key, so the TTL only needs to outlive the hour
  // it counts; an eventually-consistent read here costs at most a few extra
  // writes, which is the right trade against blocking a real submission.
  await env.BRIEF.put(key, String(count + 1), { expirationTtl: 7_200 });
  return true;
}

async function receiveBrief(request: Request, env: Env, ctx: ExecutionContext) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (!(await withinRateLimit(env, ip))) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }

  let payload: { text?: unknown; answers?: unknown; answered?: unknown; total?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: "bad_json" }, 400);
  }

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) return json({ ok: false, error: "empty" }, 400);
  if (text.length > MAX_TEXT) return json({ ok: false, error: "too_long" }, 413);

  const receivedAt = new Date().toISOString();
  // ISO timestamp first so a plain KV list comes back in chronological order;
  // the suffix keeps two submissions in the same millisecond apart.
  const key = `brief:${receivedAt}:${crypto.randomUUID().slice(0, 8)}`;

  await env.BRIEF.put(
    key,
    JSON.stringify({
      receivedAt,
      answered: typeof payload.answered === "number" ? payload.answered : null,
      total: typeof payload.total === "number" ? payload.total : null,
      text,
      answers: payload.answers ?? null,
      ip,
      userAgent: request.headers.get("user-agent")
    })
  );

  // Fire-and-forget: a webhook that is down must not fail a submission the
  // visitor has already had confirmed, and KV already has the only copy that
  // matters.
  if (env.BRIEF_WEBHOOK) {
    ctx.waitUntil(
      fetch(env.BRIEF_WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: text, text })
      }).catch(() => undefined)
    );
  }

  return json({ ok: true });
}

async function renderInbox(request: Request, env: Env) {
  const url = new URL(request.url);
  const given = url.searchParams.get("token") ?? "";
  const expected = env.BRIEF_TOKEN ?? "";

  if (!expected || !given || !tokenMatches(expected, given)) {
    return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  }

  const listed = await env.BRIEF.list({ prefix: "brief:", limit: 200 });
  const entries = await Promise.all(
    // Newest first: the list comes back in key order, which is chronological.
    listed.keys
      .map((entry) => entry.name)
      .reverse()
      .map(async (name) => {
        const raw = await env.BRIEF.get(name);
        if (!raw) return null;
        try {
          return JSON.parse(raw) as { receivedAt: string; answered: number | null; total: number | null; text: string };
        } catch {
          return null;
        }
      })
  );

  const body = entries
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .map((entry) => {
      const stamp = new Date(entry.receivedAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
      const count = entry.answered !== null && entry.total !== null ? ` · ${entry.answered}/${entry.total} cevap` : "";
      return `<article><h2>${escapeHtml(stamp)}${escapeHtml(count)}</h2><pre>${escapeHtml(entry.text)}</pre></article>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Brief kutusu</title>
<style>
:root{color-scheme:light dark}
body{margin:0;padding:2rem 1.25rem 4rem;font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;background:#f3f1ec;color:#0e1a2b}
main{max-width:52rem;margin:0 auto}
h1{font-size:1.5rem;letter-spacing:-.02em;margin:0 0 .25rem}
.count{font:12px ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#5a6878;margin:0 0 2rem}
article{border:1px solid rgba(14,26,43,.12);border-left:3px solid #1e6d8c;border-radius:10px;background:#faf8f3;padding:1rem 1.25rem;margin-bottom:1.25rem}
h2{font:12px ui-monospace,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase;color:#5a6878;margin:0 0 .75rem}
pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:14px/1.7 ui-monospace,Menlo,monospace}
@media(prefers-color-scheme:dark){body{background:#07090d;color:#f0f4f8}article{background:#0e131b;border-color:rgba(255,255,255,.09)}h1{color:#f0f4f8}}
</style></head>
<body><main>
<h1>Brief kutusu</h1>
<p class="count">${entries.filter(Boolean).length} gönderim</p>
${body || "<p>Henüz gönderim yok.</p>"}
</main></body></html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/api/brief") {
      if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
      return receiveBrief(request, env, ctx);
    }

    if (path === "/brief/inbox") return renderInbox(request, env);

    // Everything else is the static site. Assets are matched before the Worker
    // runs, so in practice this only catches genuine misses — and it hands them
    // back to the asset layer so the site's own 404 behaviour is unchanged.
    return env.ASSETS.fetch(request);
  }
};
