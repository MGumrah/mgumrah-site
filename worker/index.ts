/**
 * mgumrah.com — the Worker in front of the static site.
 *
 * Everything on this site is a prerendered file and is served straight off
 * Cloudflare's asset storage without this code ever running. The Worker exists
 * for the things an asset cannot do: accept the /brief form, accept an Android
 * tester's e-mail address, and serve the shared data behind /balim (see
 * ./balim.ts). Every other request falls through to the assets untouched, so
 * the site behaves exactly as it did before the Worker existed.
 *
 * Types are declared inline rather than pulled from @cloudflare/workers-types:
 * this file sits inside the Next project's tsconfig, and the two type packages
 * disagree about the shape of half the web platform.
 */

import { balimApi, balimYonlendirmesi, type BalimEnv } from "./balim";

type AssetFetcher = { fetch(request: Request): Promise<Response> };

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: { name: string }[] }>;
};

type ExecutionContext = { waitUntil(promise: Promise<unknown>): void };

type Env = BalimEnv & {
  ASSETS: AssetFetcher;
  /** One namespace, two prefixes: `brief:` scoping answers, `tester:` sign-ups. */
  BRIEF: KVNamespace;
  /**
   * `wrangler secret put BRIEF_TOKEN`. Both inboxes fail closed without it — an
   * unset secret must never mean an open door.
   */
  BRIEF_TOKEN?: string;
  /** Optional. Any URL that should receive a copy of a brief as it lands. */
  BRIEF_WEBHOOK?: string;
  /**
   * Optional. Any URL that should receive a tester sign-up the moment it
   * arrives — the seam for a machine that keeps Play Console open and adds the
   * address to the closed-test list without waiting for someone to read KV.
   */
  TESTER_WEBHOOK?: string;
};

/** A brief runs ~24 answers; anything past this is not someone filling a form. */
const MAX_TEXT = 25_000;
/** Per IP, per hour. The form is public, so the write path has to be bounded. */
const MAX_PER_HOUR = 8;
/** RFC 5321's ceiling for a whole address; anything longer is not one. */
const MAX_EMAIL = 254;
/** The note beside a tester's address — a name or a company, not a paragraph. */
const MAX_NOTE = 200;

/**
 * Deliberately loose. The address is going to be pasted into Play Console and
 * matched against a real Google account, so the only useful job here is to
 * reject what is obviously not an address — a stricter pattern would only ever
 * turn away a valid one.
 */
const EMAIL_PATTERN = /^[^\s@,;:<>"'()[\]]+@[^\s@,;:<>"'()[\]]+\.[a-z]{2,}$/i;

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

/**
 * Both inboxes are private pages on a public domain, so they are answered the
 * same way: 404 to everyone without the token, and never indexed.
 */
function authorizeInbox(request: Request, env: Env) {
  const given = new URL(request.url).searchParams.get("token") ?? "";
  const expected = env.BRIEF_TOKEN ?? "";
  return Boolean(expected) && Boolean(given) && tokenMatches(expected, given);
}

const notFound = () =>
  new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

/** The shared chrome for the two inboxes, so they only differ in content. */
function inboxPage(title: string, body: string) {
  const html = `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>${escapeHtml(title)}</title>
<style>
:root{color-scheme:light dark}
body{margin:0;padding:2rem 1.25rem 4rem;font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;background:#f3f1ec;color:#0e1a2b}
main{max-width:52rem;margin:0 auto}
h1{font-size:1.5rem;letter-spacing:-.02em;margin:0 0 .25rem}
.count{font:12px ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#5a6878;margin:0 0 2rem}
article{border:1px solid rgba(14,26,43,.12);border-left:3px solid #1e6d8c;border-radius:10px;background:#faf8f3;padding:1rem 1.25rem;margin-bottom:1.25rem}
h2{font:12px ui-monospace,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase;color:#5a6878;margin:0 0 .75rem}
pre{margin:0;white-space:pre-wrap;word-wrap:break-word;font:14px/1.7 ui-monospace,Menlo,monospace}
textarea{width:100%;box-sizing:border-box;min-height:7rem;padding:.75rem;border:1px solid rgba(14,26,43,.18);border-radius:10px;background:#faf8f3;color:inherit;font:14px/1.7 ui-monospace,Menlo,monospace;resize:vertical}
button{font:inherit;font-size:.9rem;padding:.5rem 1rem;border-radius:999px;border:1px solid rgba(14,26,43,.2);background:#0e1a2b;color:#f3f1ec;cursor:pointer;margin-top:.75rem}
.addr{font:14px ui-monospace,Menlo,monospace;word-break:break-all}
.sub{color:#5a6878;font-size:.85rem;margin:.35rem 0 0}
@media(prefers-color-scheme:dark){body{background:#07090d;color:#f0f4f8}article,textarea{background:#0e131b;border-color:rgba(255,255,255,.09)}h1{color:#f0f4f8}button{background:#f0f4f8;color:#07090d}}
</style></head>
<body><main>
${body}
</main></body></html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow"
    }
  });
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

type TesterEntry = {
  email: string;
  note: string;
  locale: string;
  source: string;
  firstSeenAt: string;
  updatedAt: string;
};

/**
 * A Google Play closed-test sign-up.
 *
 * Portal's Play listing is in closed testing, so an address only becomes able
 * to install once it is on the tester list in Play Console. This is where the
 * visitor hands that address over instead of tapping a store link that would
 * only show them "not found".
 *
 * Keyed by the address itself, not by arrival time: the same person tapping
 * twice is one tester, and a list meant to be pasted into Play Console must not
 * carry the same address twice. The first sign-up's timestamp is carried
 * forward through the overwrite, so re-submitting never moves someone down the
 * queue.
 */
async function receiveTester(request: Request, env: Env, ctx: ExecutionContext) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (!(await withinRateLimit(env, ip))) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }

  let payload: { email?: unknown; note?: unknown; locale?: unknown; source?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: "bad_json" }, 400);
  }

  // Lowercased because Play Console matches an account, not a string, and a
  // list with both Ali@ and ali@ in it is a list with a duplicate in it. The
  // local part is left otherwise untouched — stripping Gmail's dots or +tags
  // would risk rewriting an address that someone actually signs in with.
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) return json({ ok: false, error: "empty" }, 400);
  if (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email)) {
    return json({ ok: false, error: "bad_email" }, 400);
  }

  const note = typeof payload.note === "string" ? payload.note.trim().slice(0, MAX_NOTE) : "";
  const locale = payload.locale === "en" ? "en" : "tr";
  const source = typeof payload.source === "string" ? payload.source.slice(0, 60) : "";

  const key = `tester:${email}`;
  const now = new Date().toISOString();

  let firstSeenAt = now;
  try {
    const existing = await env.BRIEF.get(key);
    if (existing) firstSeenAt = (JSON.parse(existing) as TesterEntry).firstSeenAt ?? now;
  } catch {
    // A single unreadable record must not cost us the sign-up in front of us.
  }

  const entry: TesterEntry = { email, note, locale, source, firstSeenAt, updatedAt: now };

  await env.BRIEF.put(
    key,
    JSON.stringify({ ...entry, ip, userAgent: request.headers.get("user-agent") })
  );

  if (env.TESTER_WEBHOOK) {
    ctx.waitUntil(
      fetch(env.TESTER_WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(entry)
      }).catch(() => undefined)
    );
  }

  return json({ ok: true });
}

async function renderInbox(request: Request, env: Env) {
  if (!authorizeInbox(request, env)) return notFound();

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

  return inboxPage(
    "Brief kutusu",
    `<h1>Brief kutusu</h1>
<p class="count">${entries.filter(Boolean).length} gönderim</p>
${body || "<p>Henüz gönderim yok.</p>"}`
  );
}

/**
 * The tester list, in the shape it is actually used in: one box holding every
 * address, ready to paste into Play Console's tester field in a single go. The
 * per-address cards below it are for deciding who someone is, not for copying
 * one at a time.
 *
 * `?format=txt` returns the same addresses as plain text, which is what a
 * script on the office machine should read rather than scraping this page.
 */
async function renderTesterInbox(request: Request, env: Env) {
  if (!authorizeInbox(request, env)) return notFound();

  const listed = await env.BRIEF.list({ prefix: "tester:", limit: 1000 });
  const loaded = await Promise.all(
    listed.keys.map(async ({ name }) => {
      const raw = await env.BRIEF.get(name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as TesterEntry;
      } catch {
        return null;
      }
    })
  );

  // Sign-up order, oldest first: the list keys are addresses, so KV's own order
  // is alphabetical and says nothing about who is still waiting.
  const entries = loaded
    .filter((entry): entry is TesterEntry => entry !== null)
    .sort((a, b) => (a.firstSeenAt < b.firstSeenAt ? -1 : 1));

  const addresses = entries.map((entry) => entry.email);

  if (new URL(request.url).searchParams.get("format") === "txt") {
    return new Response(addresses.join("\n"), {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow"
      }
    });
  }

  const cards = entries
    .map((entry) => {
      const stamp = new Date(entry.firstSeenAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
      const who = entry.note ? ` · ${entry.note}` : "";
      const where = entry.source ? ` · ${entry.source}` : "";
      return `<article><h2>${escapeHtml(stamp)}${escapeHtml(who)}${escapeHtml(where)}</h2><p class="addr">${escapeHtml(entry.email)}</p></article>`;
    })
    .join("");

  return inboxPage(
    "Android tester listesi",
    `<h1>Android tester listesi</h1>
<p class="count">${entries.length} adres</p>
<textarea id="all" readonly>${escapeHtml(addresses.join(", "))}</textarea>
<button type="button" id="copy">Hepsini kopyala</button>
<p class="sub">Play Console → Test → Kapalı test → Testçiler → e-posta listesi. Virgülle ayrılmış hâli olduğu gibi yapıştırılır.</p>
${cards || "<p>Henüz kayıt yok.</p>"}
<script>
document.getElementById("copy").addEventListener("click", function(){
  var box = document.getElementById("all");
  box.select();
  try { navigator.clipboard.writeText(box.value); } catch (e) { document.execCommand("copy"); }
  this.textContent = "Kopyalandı";
});
</script>`
  );
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/api/brief") {
      if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
      return receiveBrief(request, env, ctx);
    }

    if (path === "/api/android-tester") {
      if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
      return receiveTester(request, env, ctx);
    }

    if (path === "/brief/inbox") return renderInbox(request, env);
    if (path === "/testers/inbox") return renderTesterInbox(request, env);

    if (path === "/api/balim" || path.startsWith("/api/balim/")) return balimApi(request, env, path);
    const balim = balimYonlendirmesi(url);
    if (balim) return balim;

    // Everything else is the static site. Assets are matched before the Worker
    // runs, so in practice this only catches genuine misses — and it hands them
    // back to the asset layer so the site's own 404 behaviour is unchanged.
    return env.ASSETS.fetch(request);
  }
};
