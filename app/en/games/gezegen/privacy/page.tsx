import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/gezegen/privacy",
  title: "Gezegen Privacy Policy",
  description:
    "Privacy policy for the Gezegen: Planet Merge game. No account is required and progress stays on your device; ads are served by Google AdMob."
});

// The privacy address given to the App Store. This text must match the App Store Connect privacy declaration (App
// Privacy): if the ad network, the consent form (UMP), the tracking prompt (ATT), real-money purchases or analytics
// change, update this text, its Turkish twin and the App Privacy answers together. Standalone backup: the Oyunlar
// repo, gezegen/store/privacy.html.
export default function EnglishGezegenPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="gezegen">
      <h2>Summary</h2>
      <p>
        Gezegen <strong>does not require an account</strong> and we do not collect personal data from you
        directly; we have no servers of our own. The game is free and <strong>contains ads</strong>: ads are
        served by Google AdMob, and while they are served Google may collect the limited data described below.
        We do not use analytics software that tracks you.
      </p>

      <h2>Information stored on your device</h2>
      <p>
        The following is stored only on your device and is <strong>never sent</strong> to us:
      </p>
      <ul>
        <li>
          <strong>Your game progress:</strong> best score, in-game gold, unlocked jars, skies, planet styles and
          perks, achievements, the local leaderboard, an unfinished game and ad counters.
        </li>
        <li>
          <strong>Your settings:</strong> language, sound and vibration level.
        </li>
      </ul>
      <p>
        Deleting the app deletes this data. It may remain in your device’s own operating-system backups if
        you have backups enabled.
      </p>

      <h2>Ads (Google AdMob)</h2>
      <p>
        Gezegen shows two kinds of ads: (1) optional <em>rewarded ads</em> — they open only if you tap a
        button, and in return give a chance to continue a game, double a round’s gold, or earn free gold in the
        shop; and (2) occasional <em>full-screen ads</em> between rounds, shown when you tap “Play again”. No
        ads are shown during play. Ads are served with Google’s Mobile Ads SDK.
      </p>
      <p>To serve ads, Google’s SDK may collect, according to Google’s documentation:</p>
      <ul>
        <li>
          an <strong>approximate location</strong> estimated from your IP address;
        </li>
        <li>
          a <strong>device identifier</strong> (the device’s advertising identifier if you allow it,
          otherwise app- or developer-specific device identifiers);
        </li>
        <li>
          the <strong>ads</strong> you have seen;
        </li>
        <li>
          your <strong>interactions</strong> with ads (for example video views); and
        </li>
        <li>
          <strong>crash logs</strong>, <strong>performance data</strong> such as launch time, and other diagnostic
          data.
        </li>
      </ul>
      <p>
        This data is used for serving and measuring ads, analytics, and diagnosing problems in the SDK, and may
        be shared with other parties involved in serving ads. We do not see or receive this data; it is processed
        by Google under Google’s privacy policy. For details, see
        the <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and{" "}
        <a href="https://policies.google.com/technologies/partner-sites">
          How Google uses information from sites or apps that use our services
        </a>
        .
      </p>

      <h2>Consent and tracking permission</h2>
      <p>
        In the European Economic Area, the United Kingdom and similar regions, Google’s{" "}
        <strong>consent form</strong> (User Messaging Platform) is shown at first launch; you can change your
        choice later with the <em>Settings › Privacy settings</em> button (it appears only in regions where
        consent is required). If you do not consent, only limited (non-personalized) ads are shown.
      </p>
      <p>
        On iOS you may also see the <strong>App Tracking Transparency</strong> prompt: if you allow tracking,
        Google may use the device’s advertising identifier for personalized ads; if you decline, the advertising
        identifier is not sent and ads are still shown. You can change this at any time in iOS{" "}
        <em>Settings › Privacy &amp; Security › Tracking</em>.
      </p>

      <h2>World leaderboard (optional)</h2>
      <p>
        The world leaderboard runs on <strong>Apple Game Center</strong>. If you are signed in to Game Center,
        your best score is submitted to Apple and shown with your player name according to Game Center’s
        rules. Apple processes that data under its own privacy policy; we do not receive any personal data.
      </p>

      <h2>Permissions</h2>
      <p>
        Gezegen does not request any permissions such as camera, microphone, location, contacts or photos
        (apart from the optional tracking permission described above). Vibration only runs your device’s
        haptic motor locally.
      </p>

      <h2>Third parties</h2>
      <p>
        The only third party in this version is <strong>Google AdMob</strong> (Google Mobile Ads SDK and User
        Messaging Platform SDK); there is no other advertising network or analytics software. The game is built
        with the MIT-licensed Godot game engine, which does not collect data.
      </p>

      <h2>Children’s privacy</h2>
      <p>
        Gezegen is not specifically directed to children under 13 and does not knowingly collect data from
        children. The content rating of the ads shown is limited to the most suitable level (general
        audiences).
      </p>

      <h2>Your rights</h2>
      <p>
        We hold no data associated with you, so there is no record for us to delete or correct. For requests
        about data Google collects for advertising (access, deletion, turning off personalization) you can use
        Google’s privacy tools (<a href="https://myaccount.google.com/">My Google Account</a> and the links
        above) and the tracking/advertising settings on your device.
      </p>

      <h2>Changes</h2>
      <p>
        If features such as real-money purchases, a new ad network or analytics are added to the game, this
        policy will be updated; the updated version is published on this page and the “Effective date” is
        changed.
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
