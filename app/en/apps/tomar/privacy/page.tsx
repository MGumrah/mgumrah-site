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
          <strong>App settings</strong> (e.g. default save folder, view preferences). These are kept
          locally in the Windows registry, only under your own user account
          (<code>HKEY_CURRENT_USER</code>).
        </li>
      </ul>

      <h2>Local system changes (not data collection)</h2>
      <p>
        To work properly, Tomar writes to the local Windows registry. These are{" "}
        <strong>settings on your device, not personal-data collection</strong>, and are never sent
        anywhere:
      </p>
      <ul>
        <li>
          <strong>.pdf file association:</strong> to add Tomar to the apps that can open PDFs.
        </li>
        <li>
          <strong>Fast launch / start at login:</strong> optionally, so that Tomar waits ready in the
          background at startup (you can turn this off from the menu).
        </li>
      </ul>
      <p>
        Note: in the version installed from the Microsoft Store, these settings are managed through the
        app package&apos;s own isolated area.
      </p>

      <h2>Update check (direct-download version only)</h2>
      <p>
        The version downloaded directly from the website may connect to the update server
        (<code>dl.tomar.app</code>) to check whether a newer version is available. During this request,
        as with any internet request, your <strong>IP address</strong> and{" "}
        <strong>current app version</strong> are transmitted. This information is used to serve a version
        file; it is <strong>not stored, not profiled, and not shared with third parties.</strong> In the
        Microsoft Store version, updates are handled by the Store and this check is not performed.
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
