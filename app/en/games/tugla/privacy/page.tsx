import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/tugla/privacy",
  title: "Brick Ricochet Privacy Policy",
  description:
    "Privacy policy for the Brick Ricochet game. No account is required and progress stays on your device; ads are served by Google AdMob."
});

// The privacy address given to the App Store. This text must match the App Store Connect privacy declaration (App
// Privacy): if the ad network, the consent form (UMP), the tracking prompt (ATT), real-money purchases or analytics
// change, update this text, its Turkish twin and the App Privacy answers together. Standalone backup: the Oyunlar
// repo, tugla/store/privacy.html.
export default function EnglishTuglaPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="tugla">
      <h2>Summary</h2>
      <p>
        Brick Ricochet does not ask you to create an account and does <strong>not collect</strong> your personal data on
        our own servers. The game is free and contains <strong>Google AdMob</strong> advertising (optional
        rewarded ads and an occasional ad between games). While ads are shown, Google processes some data as
        described below. We use no analytics or crash-reporting software.
      </p>

      <h2>Information stored on your device</h2>
      <p>
        Your game progress (best score, in-game gold, unlocked balls/brick colors/themes/abilities,
        achievements, local leaderboard, a game in progress, ad-frequency and free-gold cooldown counters) and
        your settings (language, sound and vibration level) are stored only on your device and are never sent to
        us. Deleting the app deletes this data (it may remain in your device’s own operating-system backups if
        you have backups enabled).
      </p>

      <h2>Advertising (Google AdMob)</h2>
      <p>
        The game shows ads through Google AdMob (Google Mobile Ads SDK). According to Google’s App Store data
        disclosure, while ads are shown Google’s advertising software may collect and process:
      </p>
      <ul>
        <li>
          your <strong>IP address</strong> (to estimate the device’s general location);
        </li>
        <li>
          a <strong>device identifier</strong> (your advertising identifier or app/developer-scoped device
          identifiers);
        </li>
        <li>
          the <strong>ads</strong> you have seen;
        </li>
        <li>
          your <strong>interactions</strong> with ads (such as app launches and video views);
        </li>
        <li>
          <strong>performance data</strong> (app launch time, hang rate, energy usage) and{" "}
          <strong>crash logs</strong>.
        </li>
      </ul>
      <p>
        This data is used to serve ads, improve ad performance, for analytics and to diagnose the software, and
        it may be shared with other entities that display ads.
      </p>
      <p>
        We do not have access to this personal data; in AdMob we only see aggregate ad statistics (impressions,
        revenue). Google processes this data under its own privacy policy. For details, see the{" "}
        <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and{" "}
        <a href="https://policies.google.com/technologies/partner-sites">
          How Google uses information from sites or apps that use our services
        </a>
        .
      </p>
      <p>
        <strong>Rewarded ads are optional:</strong> if you do not watch them the game works in full. The ads
        shown occasionally between games never appear during play. The content level of the ads shown is limited
        to General Audiences (G).
      </p>

      <h2>Tracking permission and your consent choices</h2>
      <p>
        <strong>iOS tracking permission (App Tracking Transparency):</strong> iOS asks you for “Tracking”
        permission so that your advertising identifier can be used to show personalized ads. If you decline, you
        can play exactly the same; the advertising identifier is not used and ads are not personalized. You can
        change your choice at any time in iOS <em>Settings › Privacy &amp; Security › Tracking</em>.
      </p>
      <p>
        <strong>Consent form (EU, UK and other regions where the law requires it):</strong> In these regions
        Google’s User Messaging Platform (UMP) consent form is shown. You can change your choice at any time with
        the <em>Privacy settings</em> button on the game’s Settings screen (visible only in these regions).
      </p>

      <h2>World leaderboard (optional)</h2>
      <p>
        The world leaderboard runs on <strong>Apple Game Center</strong>. If you are signed in to Game Center,
        your best score is submitted to Apple and shown with your player name according to Game Center’s rules.
        Apple processes that data under its own privacy policy; we do not receive any personal data.
      </p>

      <h2>Permissions</h2>
      <p>
        Brick Ricochet does not request permissions such as camera, microphone, location, contacts or photos; the only
        exception is the iOS tracking-permission request described above, which is for advertising only.
        Vibration only runs your device’s haptic motor locally.
      </p>

      <h2>Third parties</h2>
      <p>
        In this version the only third parties are <strong>Google AdMob</strong> (advertising; Google Mobile Ads
        SDK and User Messaging Platform) and, optionally, <strong>Apple Game Center</strong>. The game is built
        with the MIT-licensed Godot game engine and an MIT-licensed AdMob plugin; the engine does not collect
        data. There is no analytics, crash-reporting or other advertising network.
      </p>

      <h2>Children’s privacy</h2>
      <p>
        Brick Ricochet is not specifically directed to children under 13 and does not knowingly collect personal data
        from children. The ads shown are limited to General Audiences (G) content.
      </p>

      <h2>Your rights regarding your data</h2>
      <p>
        Because we do not store your personal data on our servers there is no account or profile to delete; you
        can remove the on-device game data by deleting the app. For the data Google processes for advertising
        (including your legal rights in the EU/UK: access, erasure, objection) you can use Google’s privacy
        tools and policy.
      </p>

      <h2>Changes</h2>
      <p>
        If features such as analytics or real-money in-app purchases are added, or our use of advertising
        changes, this policy will be updated; the updated version is published on this page and the “Effective
        date” is changed.
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
