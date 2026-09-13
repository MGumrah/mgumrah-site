"use client";

import { useCallback, useEffect, useState } from "react";
import { links } from "./site-config";
import type { Locale } from "./locale";

/**
 * Google Play closed-test sign-up for Tekno Portal's Android build.
 *
 * The listing is real but closed, so a visitor who is not on the tester list
 * gets Play's "item not found" rather than a store page — a dead end that looks
 * like a broken link. This form is what stands in front of that link instead:
 * the address is collected here, added to the tester list in Play Console, and
 * only then does Play open for that account.
 *
 * The address has to be the one the device signs into Play with. Anything else
 * — a work address that is not a Google account, a second mailbox — lands on
 * the list without ever unlocking the install, so the copy says so twice.
 */

/** Bumped if the flow changes enough that a remembered sign-up reads wrong. */
const STORAGE_KEY = "mgumrah:teknoportal:android-tester:v1";

/** Matches the Worker's check, so the round trip is not what tells you it is wrong. */
const EMAIL_PATTERN = /^[^\s@,;:<>"'()[\]]+@[^\s@,;:<>"'()[\]]+\.[a-z]{2,}$/i;

const copy = {
  tr: {
    eyebrow: "Android · kapalı test",
    title: "Android sürümü için e-posta bırakın",
    intro:
      "Tekno Portal'ın Android sürümü şu anda Google Play'de kapalı testte. Uygulamanın yüklenebilmesi için hesabınızın test listesinde olması gerekiyor. Adresinizi bırakın, listeye ekleyelim; eklendikten sonra Google Play bağlantısı sizin için açılır.",
    emailLabel: "Google Play e-posta adresiniz",
    emailHint:
      "Telefonunuzda Play Store'da oturum açtığınız Google hesabının adresi olmalı. Başka bir adres listeye eklense de uygulama o cihazda görünmez.",
    emailPlaceholder: "ornek@gmail.com",
    noteLabel: "Adınız / firmanız (isteğe bağlı)",
    notePlaceholder: "Kimin adresi olduğunu bilelim",
    submit: "Test listesine ekle",
    sending: "Gönderiliyor…",
    invalid: "Geçerli bir e-posta adresi yazın.",
    sent: "Adresiniz alındı.",
    sentBody:
      "Hesabınız test listesine eklenecek — genellikle aynı gün içinde. Eklendikten sonra aşağıdaki Google Play bağlantısı sizin için açılır; o ana kadar \"bulunamadı\" görebilirsiniz.",
    again: "Başka bir adres ekle",
    failed: "Gönderilemedi. Adresinizi doğrudan e-posta ile de iletebilirsiniz:",
    alreadyTester: "Zaten test listesindeyim — Google Play'de aç",
    mailSubject: "Tekno Portal Android kapalı test — e-posta adresim"
  },
  en: {
    eyebrow: "Android · closed testing",
    title: "Leave your e-mail for the Android build",
    intro:
      "Tekno Portal's Android build is in closed testing on Google Play. The app can only be installed by accounts on the tester list. Leave your address and we will add it; once it is on the list, the Google Play link opens for you.",
    emailLabel: "Your Google Play e-mail address",
    emailHint:
      "It has to be the Google account your phone is signed into on the Play Store. Any other address can go on the list and the app still will not appear on that device.",
    emailPlaceholder: "you@gmail.com",
    noteLabel: "Your name / company (optional)",
    notePlaceholder: "So we know whose address this is",
    submit: "Add me to the tester list",
    sending: "Sending…",
    invalid: "Please enter a valid e-mail address.",
    sent: "We have your address.",
    sentBody:
      "Your account will be added to the tester list, usually the same day. After that the Google Play link below opens for you; until then it may still say the item was not found.",
    again: "Add another address",
    failed: "That did not go through. You can also send your address by e-mail:",
    alreadyTester: "I'm already on the tester list — open Google Play",
    mailSubject: "Tekno Portal Android closed test — my e-mail address"
  }
} as const;

export function AndroidTesterForm({
  locale,
  playStoreUrl,
  source
}: {
  locale: Locale;
  playStoreUrl: string;
  /** Which page the sign-up came from, so the inbox says where it happened. */
  source: string;
}) {
  const t = copy[locale];
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A visitor who already signed up and came back should see where they stand,
  // not an empty form that invites them to send the same address again.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) setSent(true);
    } catch {
      // Private mode: the form just starts empty, which is not a failure.
    }
  }, []);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const address = email.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(address)) {
        setError(t.invalid);
        return;
      }

      setSending(true);
      setError(null);
      try {
        const response = await fetch("/api/android-tester", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: address, note: note.trim(), locale, source })
        });
        if (!response.ok) throw new Error(String(response.status));
        try {
          localStorage.setItem(STORAGE_KEY, address);
        } catch {
          // Remembering is a convenience; the sign-up itself already landed.
        }
        setSent(true);
        setEmail("");
        setNote("");
      } catch {
        setError(t.failed);
      } finally {
        setSending(false);
      }
    },
    [email, note, locale, source, t]
  );

  return (
    <section className="tester" id="android-test" aria-labelledby="android-test-title">
      <span className="kicker">
        <span className="dot" />
        {t.eyebrow}
      </span>
      <h2 id="android-test-title">{t.title}</h2>

      {sent ? (
        <div className="tester-done" role="status">
          <p className="tester-done-head">{t.sent}</p>
          <p>{t.sentBody}</p>
          <button
            type="button"
            className="tester-again"
            onClick={() => {
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch {
                // Nothing to clear; the state below is what the visitor sees.
              }
              setSent(false);
            }}
          >
            {t.again}
          </button>
        </div>
      ) : (
        <form className="tester-form" onSubmit={submit} noValidate>
          <p className="tester-intro">{t.intro}</p>

          <div className="field">
            <label htmlFor="tester-email">{t.emailLabel}</label>
            <input
              id="tester-email"
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              placeholder={t.emailPlaceholder}
              onChange={(event) => setEmail(event.target.value)}
            />
            <p className="tester-hint">{t.emailHint}</p>
          </div>

          <div className="field">
            <label htmlFor="tester-note">{t.noteLabel}</label>
            <input
              id="tester-note"
              type="text"
              name="note"
              autoComplete="name"
              maxLength={200}
              value={note}
              placeholder={t.notePlaceholder}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="tester-actions">
            <button type="submit" className="btn primary" disabled={sending}>
              {sending ? t.sending : t.submit}
            </button>
          </div>

          {error ? (
            <p className="tester-error" role="alert">
              {error}{" "}
              <a href={`mailto:${links.email}?subject=${encodeURIComponent(t.mailSubject)}`}>{links.email}</a>
            </p>
          ) : null}
        </form>
      )}

      {/* The escape hatch: whoever is already on the list should not have to
          sign up again to reach the store. */}
      <a className="tester-skip" href={playStoreUrl}>
        {t.alreadyTester}
      </a>
    </section>
  );
}
