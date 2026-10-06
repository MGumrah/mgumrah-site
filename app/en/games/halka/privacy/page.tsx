import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/halka/privacy",
  title: "Halka Privacy Policy",
  description:
    "Privacy policy for the Halka game. No account is required and progress stays on your device; ads are served by Google AdMob."
});

// The privacy address given to the App Store. Since version 1.1 the game shows ads through Google AdMob; this text
// must match the App Store Connect privacy declaration (App Privacy): if the ad network, the consent form (UMP), the
// tracking prompt (ATT), real-money purchases or analytics change, update this text, its Turkish twin and the App
// Privacy answers together. Standalone backup: the Oyunlar repo, halka/store/privacy.html.
export default function EnglishHalkaPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="halka">
      <h2>Summary</h2>
      <p>
        Halka does not ask you to create an account, <strong>we do not collect</strong> your name, email address
        or location, and your game progress stays on your device. The game does, however, show ads through{" "}
        <strong>Google AdMob</strong>: to serve and measure those ads, Google may receive your advertising
        identifier (IDFA), IP address and device/usage data from your device. Your advertising identifier is used{" "}
        <strong>only if you allow it</strong> (the iOS “tracking” permission; in regions where the law requires
        it, also Google’s consent form). Details are below.
      </p>

      <h2>Information stored on your device</h2>
      <p>
        Your game progress (best score, in-game gold, unlocked colors/armor/looks, achievements, local
        leaderboard), your settings (language, sound and vibration level) and ad frequency counters (such as the
        time of the last ad and the number of free-gold rewards today) are stored only on your device and are
        never sent to us. Deleting the app deletes this data (it may remain in your device’s own
        operating-system backups if you have backups enabled).
      </p>

      <h2>Ads and Google AdMob</h2>
      <p>
        Halka is free and supported by ads. The game has optional <strong>rewarded ads</strong> (if you watch
        one, you get a reward such as a free continue, doubling the gold you just earned, or free gold) and{" "}
        <strong>interstitial ads</strong> shown occasionally between rounds. Ads are served by{" "}
        <strong>Google AdMob</strong> (Google Mobile Ads SDK).
      </p>
      <p>
        When an ad is requested and shown, Google may receive the following information from within Halka and
        process it under Google’s own privacy policy:
      </p>
      <ul>
        <li>
          <strong>Device identifiers:</strong> your advertising identifier (IDFA; only if you allow it) or app-
          or developer-specific device identifiers;
        </li>
        <li>
          <strong>Your IP address:</strong> may be used to estimate the general location of the device (the game
          does not request location permission, so no precise location is obtained);
        </li>
        <li>
          <strong>Advertising and usage data:</strong> which ads were shown and how you interacted with them (for
          example taps, video views);
        </li>
        <li>
          <strong>Diagnostic data:</strong> crash logs and performance data such as launch time, hang rate and
          energy use.
        </li>
      </ul>
      <p>
        This data is used to show ads (personalized or non-personalized), measure ad performance, run analytics,
        and diagnose and improve the ad software. We do not have access to this data; AdMob gives us only
        aggregate reports (such as impressions and earnings) and nothing that identifies you. For how Google
        uses data, see the <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and{" "}
        <a href="https://policies.google.com/technologies/partner-sites">
          How Google uses information from sites or apps that use our services
        </a>
        .
      </p>

      <h2>Your choices: tracking permission and consent</h2>
      <p>
        <strong>iOS tracking permission.</strong> To be able to use your advertising identifier, the game asks
        for your permission with iOS’s “App Tracking Transparency” prompt (a short explanation from Google may
        appear first). If you allow it, Google may link your advertising identifier with data it obtains from
        other apps and websites to show personalized ads and measure advertising; Apple calls this “tracking”.
        If you do not allow it, your advertising identifier is not included in ad requests; the game and
        rewarded ads work the same way. You can change your choice at any time under{" "}
        <em>Settings › Privacy &amp; Security › Tracking</em>.
      </p>
      <p>
        <strong>
          Consent form (European Economic Area, United Kingdom and other regions where the law requires it).
        </strong>{" "}
        In these regions Google’s consent form (User Messaging Platform) is shown before ads are displayed; you
        can accept, decline or manage your options. If you decline, only non-personalized ads are shown. The
        legal basis for personalized ads is your consent; you can change your decision or withdraw consent at
        any time with the <em>Settings › Privacy settings</em> button in the game (the button is shown only in
        these regions).
      </p>

      <h2>World leaderboard (optional)</h2>
      <p>
        The world leaderboard runs on <strong>Apple Game Center</strong>. If you are signed in to Game Center,
        your best score is submitted to Apple and shown with your player name according to Game Center’s rules.
        Apple processes that data under its own privacy policy; we do not receive any personal data.
      </p>

      <h2>Permissions</h2>
      <p>
        Halka does not request any permissions such as camera, microphone, location, contacts or photos. The only
        exception is the iOS “tracking” permission described above (for the advertising identifier; you may
        decline). Vibration only runs your device’s haptic motor locally.
      </p>

      <h2>Third parties</h2>
      <p>
        Halka contains the following third-party software: the <strong>Google Mobile Ads SDK</strong> (AdMob
        ads) and the <strong>Google User Messaging Platform SDK</strong> (consent form). Both belong to Google
        and process the data above under Google’s own privacy policy. Apple Game Center is used for the
        leaderboard (see above). The game is built with the MIT-licensed Godot game engine, which does not
        collect data. There is no other advertising network, analytics or tracking software.
      </p>

      <h2>Children’s privacy</h2>
      <p>
        Halka is not specifically directed to children under 13 and does not knowingly collect personal data
        from children. The game contains no violence, gambling or adult content, so it is rated 4+ on the App
        Store; this does not mean the game is directed to children. Ad requests ask for ads rated no higher than
        “G” (general audiences) in Google’s content classification. If you are under 13 (or under the age of
        digital consent where you live), answer the tracking and consent prompts together with a parent. If you
        believe a child has provided data to us, write to{" "}
        <a href="mailto:support@mgumrah.com">support@mgumrah.com</a>.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example KVKK in Türkiye, GDPR in the European Economic Area and the
        United Kingdom), you may have rights to access, correct, delete, object to the processing of your data
        and withdraw consent. You can delete the information Halka keeps on your device by deleting the app; as
        the developer we keep no data about you on our servers. For data that Google processes for advertising,
        you can exercise these rights with the tools Google provides (see the links in the Google Privacy
        Policy); you can also write to us with questions.
      </p>

      <h2>Changes</h2>
      <p>
        If features such as a new advertising network, analytics or in-app purchases are added, or if our use of
        data changes, this policy will be updated; the updated version is published on this page and the
        “Effective date” is changed.
      </p>

      <h2>Contact</h2>
      <p>
        <strong>Developer / data controller:</strong> Mehmet Gümrah<br />
        <strong>Email:</strong> <a href="mailto:support@mgumrah.com">support@mgumrah.com</a>
        <br />
        <strong>Website:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
      </p>
    </PrivacyDocument>
  );
}
