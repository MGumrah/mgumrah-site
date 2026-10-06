import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/prismfit/privacy",
  title: "Prism Fit Privacy Policy",
  description:
    "Privacy policy for the Prism Fit game. No account is required and progress stays on your device; ads are served by Google AdMob."
});

// The privacy address given to the App Store. This text must match the App Store Connect privacy declaration (App
// Privacy): if the ad network, the consent form (UMP), the tracking prompt (ATT), real-money purchases or analytics
// change, update this text, its Turkish twin and the App Privacy answers together. Standalone backup: the Oyunlar
// repo, blok/store/privacy.html.
export default function EnglishPrismFitPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="prismfit">
      <h2>Summary</h2>
      <p>
        Prism Fit <strong>does not require an account</strong> and we do not collect personal data from you
        directly; we have no servers of our own. The game is free and <strong>contains ads</strong>: ads are
        served by Google AdMob, and while they are served Google may collect the limited data described below.
        One optional purchase (<strong>“Remove ads”</strong>) is offered; Apple processes the payment. We do not
        use analytics software that tracks you.
      </p>

      <h2>Information stored on your device</h2>
      <p>
        The following is stored only on your device and is <strong>never sent</strong> to us:
      </p>
      <ul>
        <li>
          <strong>Your game progress:</strong> best score, in-game gold, unlocked colors/boards/styles and
          abilities, achievements, the local leaderboard, an unfinished game and ad counters.
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
        Prism Fit shows two kinds of ads: (1) optional <em>rewarded ads</em> — they open only if you tap a
        button, and in return give in-game gold or a “continue” chance; and (2) occasional{" "}
        <em>full-screen ads</em> between rounds. No ads are shown during play. Ads are served with Google’s
        Mobile Ads SDK.
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
          <strong>crash logs</strong> and <strong>performance data</strong> such as launch time.
        </li>
      </ul>
      <p>
        This data is used for serving and measuring ads, analytics, and diagnosing problems in the SDK. We do
        not see or receive this data; it is processed by Google under Google’s privacy policy. For details, see
        the <a href="https://policies.google.com/privacy">Google Privacy Policy</a> and{" "}
        <a href="https://policies.google.com/technologies/partner-sites">
          How Google uses information from sites or apps that use our services
        </a>
        .
      </p>

      <h2>Purchase (optional)</h2>
      <p>
        The game has one optional, one-time in-app purchase: <strong>“Remove ads”</strong> (turns off the
        full-screen ads between rounds; optional rewarded ads stay). Payment is processed by Apple’s App Store;
        we do not receive your card or payment details, name or email. The fact that the purchase was made is stored on
        your device and can be restored through your Apple account with <em>Settings › Restore purchases</em>.
        Purchases made with in-game gold are in-game points only, not real money.
      </p>

      <h2>Consent and tracking permission</h2>
      <p>
        In the European Economic Area, the United Kingdom and similar regions, Google’s{" "}
        <strong>consent form</strong> (User Messaging Platform) is shown at first launch; you can change your
        choice later with the <em>Settings › Privacy settings</em> button (it appears only in regions where
        consent is required).
      </p>
      <p>
        On iOS you may also see the <strong>App Tracking Transparency</strong> prompt: if you allow tracking,
        Google may use the device’s advertising identifier for personalized ads; if you decline, non-personalized
        ads are shown. You can change this at any time in iOS{" "}
        <em>Settings › Privacy &amp; Security › Tracking</em>.
      </p>

      <h2>World leaderboard (optional)</h2>
      <p>
        The world leaderboard runs on <strong>Apple Game Center</strong>. If you are signed in to Game Center,
        your best score is submitted to Apple and shown with your player name according to Game Center’s
        rules. For the “Friends” list, iOS may ask for permission to access your Game Center friends list; it is
        obtained from Apple only to show your friends’ ranking and is not sent to us. Apple processes that data
        under its own privacy policy; we do not receive any personal data.
      </p>

      <h2>Permissions</h2>
      <p>
        Prism Fit does not request any permissions such as camera, microphone, location, contacts or photos
        (apart from the optional tracking permission and the Game Center friends list permission described above). Vibration only runs your device’s
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
        Prism Fit is not specifically directed to children under 13 and does not knowingly collect data from
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
        If features such as a new kind of purchase, a new ad network or analytics are added to the game, this
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
