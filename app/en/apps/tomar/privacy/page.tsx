import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/tomar/privacy",
  title: "Tomar Privacy Policy",
  description: "Privacy policy for the Tomar desktop PDF application. Tomar collects no personal data."
});

export default function EnglishTomarPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="tomar">
      <h2>Summary</h2>
      <p>
        Tomar <strong>collects no personal data and never stores it or sends it to any server.</strong>{" "}
        Your PDF files are processed <strong>only on your own device, locally</strong>; they are never
        uploaded to the internet. The app contains <strong>no</strong> advertising, tracking, analytics,
        or telemetry.
      </p>

      <h2>Data that stays on your device</h2>
      <p>Tomar does all of its work locally. The following <strong>never leaves</strong> your device:</p>
      <ul>
        <li>
          <strong>The PDF / image files you open and edit.</strong> They are used only for the actions
          you start (save, export, print), at the location you choose.
        </li>
        <li>
          <strong>App settings</strong> (e.g. default save folder, view preferences). These are stored
          locally, under your own user account only.
        </li>
      </ul>

      <h2>Local system changes (not data collection)</h2>
      <p>
        In the Microsoft Store edition, Tomar makes <strong>no</strong> system-wide registry changes:
      </p>
      <ul>
        <li>
          <strong>The .pdf file association</strong> is declared in the application package manifest;
          Windows manages installing and removing it.
        </li>
        <li>
          <strong>Start-up on sign-in</strong> does not exist in the Store edition; the corresponding
          option in Settings is disabled and points you to Windows Startup settings.
        </li>
      </ul>

      <h2>Network access and updates</h2>
      <p>
        Tomar <strong>makes no internet connections at all.</strong> The application contains no update
        check, no version query, no analytics endpoint and no HTTP client of any kind — so nothing,
        including your IP address, ever leaves your device.
      </p>
      <p>
        Tomar is distributed exclusively through the Microsoft Store; version upgrades are delivered by
        the Store&apos;s own update mechanism.
      </p>

      <h2>Third parties</h2>
      <p>
        Tomar contains no third-party analytics, advertising, or tracking service. We do not share your
        personal data with anyone — because we do not collect it.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>Tomar is not directed at children and does not knowingly collect personal data from anyone.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the updated version is published on this page and the
        &ldquo;Effective date&rdquo; is updated.
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
