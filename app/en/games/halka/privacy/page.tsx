import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/halka/privacy",
  title: "Halka Privacy Policy",
  description:
    "Privacy policy for the Halka game. Halka collects no personal data and uses no advertising, tracking or analytics."
});

// The privacy address given to the App Store. If advertising, analytics or real-money purchases are added to the
// game, update this text, its Turkish twin and the App Store privacy declaration (App Privacy) together.
export default function EnglishHalkaPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="halka">
      <h2>Summary</h2>
      <p>
        Halka <strong>does not collect personal data.</strong> No account is required, and the game uses{" "}
        <strong>no</strong> advertising, tracking or analytics. Your progress and settings are stored only
        on <strong>your own device</strong> and are never sent to us.
      </p>

      <h2>Information stored on your device</h2>
      <p>The following is kept only on your device and <strong>never leaves</strong> it:</p>
      <ul>
        <li>
          <strong>Your game progress:</strong> best score, in-game gold, the colors/armor/looks you have
          unlocked, achievements and the local leaderboard.
        </li>
        <li>
          <strong>Your settings:</strong> language, sound and vibration level.
        </li>
      </ul>
      <p>
        Deleting the app deletes this data. It may remain in your device&apos;s own operating-system
        backups if you have backups enabled.
      </p>

      <h2>World leaderboard (optional)</h2>
      <p>
        The world leaderboard runs on <strong>Apple Game Center</strong>. If you are signed in to Game
        Center, your best score is submitted to Apple and shown with your player name according to Game
        Center&apos;s rules. Apple processes that data under its own privacy policy; we do not receive any
        personal data.
      </p>

      <h2>Permissions</h2>
      <p>
        Halka does not request any permissions such as camera, microphone, location, contacts or photos.
        Vibration only runs your device&apos;s haptic motor locally.
      </p>

      <h2>Third parties</h2>
      <p>
        This version contains no third-party advertising, analytics or tracking software. The game is
        built with the MIT-licensed Godot game engine, which does not collect data. We do not share your
        personal data with anyone — because we do not collect it.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        Halka is not specifically directed at children under 13 and does not knowingly collect data from
        children.
      </p>

      <h2>Changes</h2>
      <p>
        If features such as advertising or real-money purchases are added to the game, this policy will be
        updated; the updated version is published on this page and the &ldquo;Effective date&rdquo; is
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
