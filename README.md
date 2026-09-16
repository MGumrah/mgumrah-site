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
