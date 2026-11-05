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

## /balim

`/balim` is the family's planning panel for Balım, the café being opened:
shopping list with prices and product links, to-dos, monthly costs (rent)
with a paid/unpaid ledger, a shared photo board and a family chat. Four people
use it; each logs in once per device and stays logged in.

- The page (`app/balim/`) is a static shell. Everything shared goes through
  `/api/balim/*` in `worker/balim.ts`: rows in D1 (`BALIM_DB`, database
  `balim`), photos in R2 (`BALIM_GORSELLER`, bucket `balim-gorseller`).
- Photos are resized in the browser before upload (2000 px + a 560 px
  thumbnail), so the Worker never decodes an image.
- Every product link on a shopping item records who added it: `ekleyen` is a
  person's id, or `"claude"` for links Claude added straight into D1. The
  Worker sets it and ignores what the client sends, so a link whose URL was
  already on the item keeps its adder, and a new URL goes to whoever saved it.
- A shopping item with no price counts at the average of the prices written at
  the end of its link notes (`Beko Keyf, ikili · 10.470 TL`), shown as `~8.690 TL`
  with "N linkin ort." under it. The estimate is derived in `toplamlar.ts`, never
  stored, so it follows the links; an entered price replaces it. An item already
  marked bought gets no estimate, so the spent total only ever holds real prices.
  A note that does not end in `TL`/`₺` (`5.400 TL'den`, `851,82 TL+KDV`) is ignored.
- Every write also inserts a row into `etkinlikler`; its highest id is the data
  version. Open pages poll `/api/balim/surum` every 15 s (every 3 s while the
  chat is open) and refetch only when it moved, which is how one person's
  change shows up on another's screen.
- `mgumrah.com/balım` (with ı, any case) redirects to `/balim/`.
- The panel is **host-independent**: every path is origin-relative and lives in one file, `app/balim/adres.ts`
  (`PANEL_YOLU`, `API_YOLU`, …); the cookie is host-only and the write-origin check compares against the host the request
  arrived on. So serving the same Worker under another hostname needs no panel code change (only a Worker route/custom
  domain and a host gate). `public/balim/manifest.webmanifest` and `sw.js` cannot import it and repeat the values;
  `node scripts/balim-adres-test.mjs` fails if they drift apart or a bare `/balim` string sneaks back into the code.
  Each hostname is its own origin: its own login, its own installed PWA and its own push subscription.

### panel.balim.cafe (the panel on its own hostname)

The panel is also served under `panel.balim.cafe`: `wrangler.jsonc` binds it as a Custom Domain (`routes`) and turns on
`assets.run_worker_first`, which the host gate below needs. mgumrah.com behaves as before apart from the one difference
noted below. The link on the balim.cafe site (`MGumrah/balim-cafe-site`) is changed separately, after checking the
hostname live.

- **Host gate** (`worker/panel-host.ts`, hostnames listed once in `app/balim/adres.ts` → `PANEL_ALAN_ADLARI`). On a panel
  hostname only `/balim/*`, `/api/balim/*` and `/_next/*` are served; `/` redirects to `/balim/`; `robots.txt` is
  "Disallow: /"; everything else — the personal `/borc` and `/api/borc`, the ilan pages, `/brief/inbox` — is a 404. Other
  hostnames get `null` from the gate and behave exactly as before (checked against the old Worker, status by status).
- **It only works if the Worker runs first.** Without `assets.run_worker_first`, Cloudflare serves static files before
  the Worker, so `panel.balim.cafe/borc/` and `/tr/` would be public pages (only the Worker's own routes, e.g.
  `/api/borc`, would be closed). With `run_worker_first: true` (checked in `wrangler dev` with a fake `Host` header):
  the gate closes every non-panel path, `_headers` and `_redirects` still apply to what the Worker hands to
  `ASSETS.fetch` (same HSTS/no-store/noindex/cache headers, `/` → `/tr/`, `/apps/` → `/tr/apps/`… on mgumrah.com). One
  visible difference on mgumrah.com: `/balim` answers with the Worker's 301 instead of the asset layer's 307.
  Cost: every request, static included, counts against the Workers request quota.
- `node scripts/balim-host-test.mjs` runs the real Worker with fake hosts (matrix of allowed/closed paths, look-alike
  hostnames, `../` and `%2e%2e`, login and cookie on the panel host, the Borçlar permission, the write-origin check) and
  fails if a domain is bound in `wrangler.jsonc` without being listed in `PANEL_ALAN_ADLARI` or without `run_worker_first`.

**How it went live, in this order — each step was the owner's call:**

1. The gate code was merged to `main` first, with the domain still unbound (mgumrah.com unaffected).
2. One commit enabled **both** the `routes` entry and `run_worker_first: true` in `wrangler.jsonc`. Pushing it makes
   Workers Builds attach the Custom Domain — Cloudflare creates the DNS record and certificate (needs the `balim.cafe`
   zone in the same Cloudflare account and no existing `panel` DNS record). If a deploy ever fails on the domain, the
   same Custom Domain can be added in the dashboard under *Workers & Pages › mgumrah-site › Settings › Domains & Routes*.
3. Checked live: `/` → 302 `/balim/`, `/borc/` and `/tr/` → 404, `/robots.txt` → Disallow, `/api/borc/veri` → 404,
   `/balim/` → 200.
4. Only after that, change the link on the balim.cafe site (`MGumrah/balim-cafe-site`). People sign in again on the new
   hostname, re-add it to the home screen and re-enable notifications (a new origin; the data is the same D1).
   mgumrah.com/balim keeps working in parallel.

To add another panel hostname: list it in `PANEL_ALAN_ADLARI` first, then add its `routes` entry.

**Gotcha — every domain the Worker serves must be in `routes`.** Once `routes` exists, `wrangler deploy` makes the Worker's
Custom Domains match that list: a domain that was added by hand in the dashboard and is missing from it is **deleted** on
the next deploy. That is what happened to `mgumrah.com` on the first panel.balim.cafe deploy (the site went dark until
`mgumrah.com` was listed too). `balim-host-test.mjs` now fails if `mgumrah.com` leaves the list. If the Worker is also
served on another hostname (for example `www.mgumrah.com`), list it as well.

### Notifications

Web push, implemented with Web Crypto in `worker/web-push.ts` (a port of
sevcanhome-site's `src/lib/push.ts`). Each device subscribes separately from
the bell in the header; `public/balim/sw.js` only shows notifications and
caches nothing. What gets sent: chat messages, list/task/expense/photo changes
(collapsed per kind, so a burst of ten items is one notification), a personal
one when a task is assigned to you, and a 09:00 digest from the cron in
`wrangler.jsonc` (rent due in 3 days or today, unpaid 3/7 days late, tasks due
today or yesterday). Subscriptions the push service reports gone (404/410) are
deleted as they are found.

The VAPID pair is generated **once** — a new pair silently breaks every
existing subscription:

```bash
node scripts/balim-vapid.mjs                 # prints both values
npx wrangler secret put BALIM_VAPID_ACIK
npx wrangler secret put BALIM_VAPID_OZEL
```

Without both secrets the bell says notifications are not ready and nothing is
sent; the rest of the panel is unaffected. For `wrangler dev`, put the two
lines in `.dev.vars`; `/__scheduled?cron=0+6+*+*+*` runs the digest (the
`workers-preview` launch config passes `--test-scheduled`).

Schema changes are D1 migrations in `migrations/balim/`:

```bash
npx wrangler d1 migrations apply balim --remote
```

People are **not** in a migration — the repo is public and a short password's
hash would sit in it. Add a person, or reset a forgotten password, with:

```bash
node scripts/balim-kullanici.mjs ayse --ad Ayşe   # adds a person, prints a generated password
node scripts/balim-kullanici.mjs ayse              # new password for an existing person
```

Without `--ad` the script only resets an existing person and fails on an
unknown username, so a typo never puts a stranger's button on the login screen.
Add `--sifre "..."` to choose the password, `--local` to target `wrangler dev`'s
database, `--oturumlari-kapat` to also log that person out everywhere.

### Borçlar (debt tab, permission-gated)

A seventh tab, **Borçlar**, tracks the business's card / overdraft (KMH) / credit / supplier debt with the same screens as
the personal `/borc` tracker (dashboard, monthly table, month detail, debt history, income, cash flow, payment scenario,
instalment plan, settings). Only people who were **explicitly granted access** see it; everyone else's panel is unchanged.

- **Permission model.** `kullanicilar.borc_yetkisi` (0/1, default **0**, `CHECK`-constrained) is flipped only from the
  owner's machine — there is no UI and no API to grant it, so a hijacked session cannot grant itself access:

  ```bash
  node scripts/balim-kullanici.mjs --liste                 # who has access (no passwords)
  node scripts/balim-kullanici.mjs ayse --borc              # grant; does not touch her password
  node scripts/balim-kullanici.mjs ayse --borc-kapat        # revoke
  node scripts/balim-kullanici.mjs ali --ad Ali --borc      # new person, created with access (generated password)
  ```

  Add `--local` for `wrangler dev`'s database and `--oturumlari-kapat` to also log that person out everywhere.
- **Enforced on the API**, not just hidden in the UI: every `/api/balim/borc/*` route reads the flag from D1 **on each
  request** (never from the cookie or session row), so revoking takes effect immediately and a tab left open gets a 403.
  No permission → 403 with no data; no session → 401. A missing column (Worker deployed before the migration) counts as "no
  permission", so the panel keeps working. `/veri` only carries a boolean `borcYetkisi` for drawing the tab.
- **Separate from the shared panel data.** Debt rows live in their own `borc_*` tables, are held only in the Borçlar
  component's state (never in the shared `veri`, never in localStorage), and **do not write `etkinlikler` or send push
  notifications** — otherwise a notification text or the data version would leak that something changed to people without
  access. Open pages poll `borc/surum` (a counter in `borc_ayarlar`) every 20 s while the tab is open.
- **One implementation.** The calculation and API core is `worker/borc-cekirdek.ts` (table names are injected: `/borc` uses
  plain names, Balım uses the `borc_` prefix); the UI is `app/borc/panel.tsx` (`BorcPaneli`), used by both `/borc` and Balım
  › Borçlar. The panel owns no URL: `/borc` keeps `#pano`, `#aylar/2026-11`…, Balım uses `#borclar/aylar/2026-11`.
  Business wording (supplier, "düzenli gelir") comes from `ISLETME_METINLER` in `app/borc/baglam.tsx`. The USD/TRY rate
  starts as "not entered" in Balım, so no number is invented.
- **Empty on purpose.** No figure — and none of the personal `/borc` data — is in the repo or copied here; the business
  enters its own accounts in the tab.
- **Going live, in this order** (each step is the owner's call): `npx wrangler d1 migrations apply balim --remote`
  (`0003_borclar.sql` — before the Worker that reads it is deployed) → merge to `main` (Workers Builds deploys) →
  `node scripts/balim-kullanici.mjs <username> --borc` for each person who should see it.

Tests: `node scripts/borc-test.mjs` (pure calculation), `node scripts/balim-borc-test.mjs` (the Worker against a real SQLite
with the migrations: 401/403 on every route, revocation, validation, CSRF, no `etkinlikler` rows, missing-column fallback).

## /borc

`/borc` is a private, phone-first tracker for credit-card, overdraft (KMH) and
workplace debt: dashboard (totals, per-account limit usage, payment scenario with
an interest estimate), monthly table and month detail, debt history, statement/due-date
calendar, cash flow, instalment plan, income calendar (overdue income shows as a
receivable) and a quick "add" sheet. Turkish UI. The same panel component is reused
by Balım › Borçlar (see above); nothing in `app/borc/` knows which of the two hosts it.

**The repo is public, so no real figure may ever live in it.** The page
(`app/borc/`) is a static shell that contains no data at all; every number comes
from `/api/borc/*` (`worker/borc.ts`) after a login, out of its own D1 database
(`BORC_DB`, database `borc`). Real accounts reach D1 only through
`scripts/borc-ice-aktar.mjs`, run on the owner's machine; its output goes to
`veri-yerel/` (gitignored) and `*.xlsx` is gitignored too.

How it is protected:

- Every `/api/borc/*` route needs a session except `POST /giris`; no session → 401 and zero bytes of data.
- One user, password hashed with PBKDF2-SHA256 (100k rounds, the Workers ceiling) so the password has to be long:
  `scripts/borc-kullanici.mjs` generates a 16-character one (~80 bits) and stores only the hash.
- Cookie `borc_oturum`: `HttpOnly; Secure; SameSite=Strict; Path=/api/borc`, 30-day sliding life, 90-day hard cap,
  only the SHA-256 of the token is stored. Writes also check `Origin`.
- Login throttling: 5 failures per IP and 25 failures in total per 15 minutes (so a distributed guess is stopped
  too; the price is that an attacker can lock you out for 15 minutes, not in).
- Every response is `no-store` + `noindex`; the shell is `noindex`, has no OpenGraph card, and is not in the sitemap.
- Without the D1 binding the API answers 503 and the rest of the site is unaffected.
- Optional second layer without code: put Cloudflare Access (Zero Trust, free tier) in front of `/borc*` and
  `/api/borc*` with a one-time e-mail PIN; the Worker's own login stays as the inner layer.

Income: one-off rows live in `gelirler`; things that repeat every month (salary, a rent paid in USD, ...) are
`duzenli_gelirler` (name, amount, `TRY`/`USD`, day of month, sure/unsure, first month). The calendar derives the coming
months' rows from them, skips a month that already has a real row for that item, and counts a planned row whose day has
passed as an overdue receivable until "Alındı" is pressed (which creates the real row). A USD amount is stored in cents and
shown in TL at the `usdTry` setting (`PUT /api/borc/kur`, editable under **Daha fazla › Ayarlar**): **an estimate, not the official
rate**, labelled as such on screen. Monthly income = the active recurring items in TL; the dashboard's "borç / aylık gelir"
(work debt excluded) is derived from it. No real amount is in the repo: items are entered in the app.
Migration `0003_duzenli_gelir.sql` adds them; it must be applied to a live database **before** the Worker that reads it is
deployed (`npx wrangler d1 migrations apply borc --remote`).

Amounts are integer kuruş everywhere. A purchase after the card's statement day lands on the next month's
statement (`ekstreAyi`); an instalment purchase is split over the following statements with the kuruş remainder on the
first one; interest = carried-over amount × monthly rate × 1.3 (KKDF+BSMV), KMH = debt × 4.25% × 1.3. All of it lives in
`app/borc/hesap.ts`, shared by page and Worker and covered by the tests. Rates are rows in `ayarlar`, not constants.

Local development (fake data only):

```bash
npx wrangler d1 migrations apply borc --local
node scripts/borc-ornek-veri.mjs                              # invented accounts, shifted to today
node scripts/borc-kullanici.mjs deneme --local --sifre deneme-sifresi-123
npm run build                                                 # the Worker serves out/
npx wrangler dev --port 8788                                  # → http://localhost:8788/borc/
node --test scripts/borc-test.mjs scripts/borc-ice-aktar-test.mjs
```

Importing the owner's Excel (`Borç-Takip.xlsx`) — on the owner's machine only:

```bash
node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>"                   # counts + warnings, writes nothing to any DB
node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" --goster          # also prints the per-account figures to compare with Özet
node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" --uygula --local  # try it on the local DB first
node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" --uygula --remote # LIVE; asks for a typed "evet"
# a card that is not in the workbook yet:  --hesap "Örnek KK|kart|50000|12|22"
```

Columns are found by header name, not position, and a missing header is an error, not a silent skip. The import is an
upsert (accounts by name, readings by account+date, transactions by a key derived from the row), deletes nothing and never
touches what was typed on the phone, so it can be re-run while the workbook is still being kept. Income is not in the
workbook; add it from **Takvim › Gelirler** and **Daha fazla › Ayarlar**.

### /borc canlıya alma (going live)

Steps 1–2 are done (database `borc` exists and has its schema; its id is in `wrangler.jsonc`). It holds no user and no
data yet, so nobody can log in. Steps 3–5 are the owner's, on their own machine. In this order:

```bash
npx wrangler d1 create borc                       # done — prints a database_id
#   → put it into wrangler.jsonc ("database_id" of the BORC_DB entry), commit   (done)
npx wrangler d1 migrations apply borc --remote    # done
node scripts/borc-kullanici.mjs sahip --remote    # prints the generated password ONCE → save it in the password manager
node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" --goster          # check the figures against the workbook
node scripts/borc-ice-aktar.mjs "<Borç-Takip.xlsx>" --uygula --remote
```

Apply any newer migration the same way (`0003` is pending until then), then merge to `main` (Workers Builds deploys it) and open `mgumrah.com/borc/`. Turn on 2FA for the Cloudflare account:
D1 is encrypted at rest by Cloudflare but is not end-to-end encrypted, so that account is the one door that matters.
D1 Time Travel gives 30 days of point-in-time restore; `npx wrangler d1 export borc --remote --output <file outside the repo>`
takes a copy.

## /merve/ingilizce

A private English study page (`noindex`): a 42-question placement test (grammar 25, vocabulary 11,
reading 6, A1 → C1), then lessons ordered by the mistakes the test and the exercises show. It is static
(`public/merve/ingilizce/`, no backend); answers live only in the browser's `localStorage`, and the
Rapor tab produces a plain-text summary to send to whoever shapes the lessons. `/merve` redirects to it.

- `sorular.js` is the test bank, `dersler.js` the lessons and exercises, `motor.js` the pure logic
  (scoring, level, study order, report), `uygulama.js` the screens.
- In both banks the **first option is the correct one**; the screen shuffles them per person and attempt,
  and answers are stored as the option's position in the bank. So once a question has been answered by
  someone, do not reorder its options: change the `id` (test) or the question text (exercise) instead.
- Level rule: a level counts as passed with at least 60% of its own questions and 70% of everything up to it.
- `node scripts/merve-ingilizce-test.mjs` checks the banks (counts, unique ids, topic ↔ lesson links,
  markup) and the logic. Icons come from `app/merve/ingilizce/` (same drawing as `/ingilizce`, teal).

## Android closed testing

Tekno Portal's Play listing is in closed testing, so the store only opens for
accounts already on the tester list. `/portal` jumps an Android visitor straight
to the closed test's opt-in page (`play.google.com/apps/testing/com.tekno.portal`),
the way an iPhone jumps to the App Store. That works for anyone already on the
tester list. A **new** visitor is not on it, and the opt-in page tells them "not
eligible" without pointing at the group — so newcomers are sent the download
page's `#android-test` section instead
(`mgumrah.com/tr/apps/teknoportal/download/#android-test`), which is where the
tester list gets fed.

There are two ways to feed it, and `portalAndroidTest.mode`
(`app/site-config.ts`) picks which one the page shows. **The value mirrors Play
Console's own setting; it is not a preference.** Play Console → Test → Closed
testing → Testers offers "e-mail lists" or "Google Groups", and showing the
wrong one here sends the visitor to Play without being a tester — the exact
"item not found" dead end this section exists to prevent.

- `"form"` (today) — `AndroidTesterForm` collects the address and someone adds
  it to the **e-mail list** in Play Console by hand. This step cannot be
  automated: the Play Developer API does not manage e-mail lists, its
  `edits.testers` resource only takes `googleGroups[]`.
- `"grup"` — `AndroidTesterJoin` shows two buttons instead: join
  `teknoportal-test@googlegroups.com`, then opt in at
  `play.google.com/apps/testing/com.tekno.portal`. The visitor puts themselves
  on the tester list, so nobody waits and no address is collected. Group
  membership alone does **not** unlock the install: Google's 12-testers/14-days
  counter counts opt-ins, which is why the second button exists.

Switching to `"grup"` is one line here plus the matching change in Play
Console, in this order: put the current addresses into the group first, then
change the track to Google Groups, save **and send for review**. Doing it the
other way round drops every tester off the list and restarts the 14-day clock.

- `POST /api/android-tester` — `{ email, note?, locale?, source? }`. Keyed by
  the address, so the same person signing up twice stays one entry.
- `/testers/inbox?token=…` — the list, with every address in one paste-ready
  box. `&format=txt` returns the addresses alone, one per line, for a script.
- `TESTER_WEBHOOK` (optional secret) — POSTed each sign-up as it lands, for a
  machine that adds the address to the tester list without waiting for someone
  to open the inbox.

Play Console → Test → Closed testing → Testers → e-mail list is where the
addresses go (form route only). Once the track opens to everyone, point
`PORTAL_STORE_URLS.android` (`app/portal-redirect.tsx`) at the Play listing
instead of the opt-in page — the opt-in page is only the right door while the
track is closed.
