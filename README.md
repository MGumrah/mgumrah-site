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
- Every write also inserts a row into `etkinlikler`; its highest id is the data
  version. Open pages poll `/api/balim/surum` every 15 s (every 3 s while the
  chat is open) and refetch only when it moved, which is how one person's
  change shows up on another's screen.
- `mgumrah.com/balım` (with ı, any case) redirects to `/balim/`.

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
