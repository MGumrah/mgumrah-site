import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/gumrahsaha/privacy",
  title: "Gümrah Saha Privacy Policy",
  description:
    "Privacy policy for the Gümrah Saha field sales application. The app bundles no third-party SDK, advertising, or tracking, and your data goes to your own company's server."
});

export default function EnglishGumrahSahaPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="gumrahsaha">
      <p>
        This Privacy Policy explains what information the Gümrah Saha application (the &ldquo;App&rdquo;)
        processes, where that information goes, what it is used for, and how it is protected. The policy applies
        to the <strong>iOS</strong> version of the App.
      </p>
      <p>
        Gümrah Saha is a <strong>multi-tenant</strong> application for field sales teams, and not a service in its
        own right. Every business runs its own server installation; the App connects to that installation using
        the firm code you enter (or a server address you type in by hand). All the commercial data you see on
        screen — customer accounts, balances, statements, and stock —{" "}
        <strong>comes from that business&apos;s own systems</strong> and stays there.
      </p>
      <p>
        Accounts cannot be created in the App. Your username, password, firm code, and connection key are defined
        by the business you use the App with, and are given to you by that business.
      </p>

      <h2>1. Summary</h2>
      <ul>
        <li>
          The App contains <strong>no</strong> advertising, advertising identifier, third-party tracking,
          analytics, or crash reporting. It bundles no third-party SDK; networking, decoding, and secure storage
          are all handled by the operating system&apos;s own frameworks (URLSession, Codable, Keychain).
        </li>
        <li>
          <strong>There is no central server.</strong> The App talks only to the server of the business you
          connect to; the developer is not a party to that traffic and cannot see your data.
        </li>
        <li>No location, camera, microphone, contacts, photo, calendar, health, or sensor permission is requested.</li>
        <li>
          Your username, password, session token, and firm connection key are held only in the device Keychain;
          they are not synced to iCloud and are excluded from device backups.
        </li>
        <li>The App has no push notification infrastructure and processes no device notification token.</li>
        <li>
          The commercial data the App displays is already your own company&apos;s data, made available to you
          within your permissions.
        </li>
      </ul>

      <h2>2. Who the Data Controller Is</h2>
      <p>
        The data controller for commercial and personal data is <strong>the business you use the App with</strong>.
        That business opens your account, its server decides which customer accounts you may see, and the data is
        stored on its own server.
      </p>
      <p>
        <strong>Mehmet Gümrah</strong> is the developer and App Store publisher of the App. In that capacity he
        operates no central server and does not collect, store, or have any way to view your username, password,
        account data, or usage records. The only thing that reaches the developer is a support request you choose
        to send by email.
      </p>

      <h2>3. Data Processed</h2>

      <h3>Account and Session Information</h3>
      <ul>
        <li>Username and password (sent to the business&apos;s server with the sign-in request)</li>
        <li>User ID, full name, role, and representative code where applicable</li>
        <li>The list of operations disabled for your role (which screens are hidden)</li>
        <li>Session token and its expiry</li>
      </ul>

      <h3>Firm Connection Information</h3>
      <ul>
        <li>Firm code and firm name</li>
        <li>Server address</li>
        <li>Connection key (the installation&apos;s API key, entered by the user)</li>
        <li>The firm&apos;s appearance settings: brand color and logo address</li>
        <li>The modules enabled for the firm and its screen visibility settings</li>
      </ul>

      <h3>Commercial Data</h3>
      <p>
        The data below is fetched from the business&apos;s server and displayed on screen; the App does not
        produce it, modify it, or send it anywhere else. What arrives depends on the modules enabled for the firm
        and on the user&apos;s permissions:
      </p>
      <ul>
        <li>Customer account code, title, and balance</li>
        <li>Account activity (statement): date, document details, debit / credit amount, and running balance</li>
        <li>Stock records: product code, name, quantity, and price</li>
      </ul>
      <p>
        Which customer accounts a user may see is derived <strong>on the server</strong>, from the identity in the
        session token. The App sends no scope information; a request for a record outside that scope is rejected by
        the server.
      </p>

      <h3>Technical Data</h3>
      <ul>
        <li>
          Application identifier and application version. Sent with every request{" "}
          <strong>to the business&apos;s own server only</strong>, for the server&apos;s minimum-version check.
        </li>
        <li>
          Network connection status. Read on the device only, to tell &ldquo;no internet&rdquo; apart from
          &ldquo;server unreachable&rdquo;; it is never transmitted.
        </li>
      </ul>
      <p>
        The App uses <strong>no</strong> usage analytics, screen tracking, telemetry, or crash reporting service.
        Device model, operating system version, advertising identifier (IDFA), and similar identifiers are not
        collected.
      </p>

      <h3>Permissions Not Requested</h3>
      <p>
        The App <strong>does not request</strong> access to location, camera, microphone, contacts, calendar,
        photos, health, or sensor data, and does not collect such data. App Tracking Transparency permission is not
        requested; the App does not track.
      </p>

      <h2>4. Data Stored on the Device</h2>
      <p>
        The only data the App stores persistently is what is needed to keep your session and firm connection alive.
        It is held in two separate vaults in the device <strong>Keychain</strong>:
      </p>
      <ul>
        <li>
          <strong>Session vault:</strong> username, password, user details, and session token. The password is
          stored so that your session can resume by itself the next time the App launches; it is never sent to the
          server or to any third party, and it is deleted when you sign out.
        </li>
        <li>
          <strong>Firm vault:</strong> firm code, firm name, server address, connection key, and the firm&apos;s
          appearance settings. It is kept separate so that switching firms does not clear your session, and signing
          out does not clear the firm connection.
        </li>
      </ul>
      <p>
        Both vaults are marked as accessible after the device&apos;s first unlock and valid{" "}
        <strong>on this device only</strong>: the entries are not synced through iCloud Keychain, are excluded from
        device backups, and are not migrated to a new device. On a new device the user connects the firm again and
        signs in again.
      </p>
      <p>
        The customer and stock lists shown on screen are cached <strong>in memory only</strong> and are lost when
        the App closes. That data is never written to disk, exported, or shared with other apps. Uninstalling the
        App removes all local data, including the Keychain entries.
      </p>

      <h2>5. Purposes of Processing</h2>
      <ul>
        <li>Connecting to the firm installation and applying its configuration (modules, screens, branding)</li>
        <li>Authenticating the user and managing the session</li>
        <li>Showing the user only the customer accounts they are authorised for, and the related data</li>
        <li>Presenting account statements, balances, and stock information</li>
        <li>Enforcing role-based access control and hiding screens the user is not permitted to see</li>
        <li>Performing the minimum application version check</li>
      </ul>
      <p>
        Data is <strong>not</strong> used for advertising, ad targeting, profiling, or third-party marketing.
      </p>

      <h2>6. Network Communication and Security</h2>
      <ul>
        <li>
          All server communication uses <strong>HTTPS (TLS)</strong>. Even if you type the server address with{" "}
          <code>http://</code>, it is rewritten to https; unencrypted connections are not allowed.
        </li>
        <li>
          Requests are authorised with the installation&apos;s connection key and, for a signed-in user, a session
          token with an expiry.
        </li>
        <li>
          Server responses are not written to the system network cache; every request fetches fresh data, so no
          leftover copy of a response accumulates on the device.
        </li>
        <li>Session and firm information is stored in the operating system&apos;s Keychain (see Section 4).</li>
        <li>
          On the server, every request is validated against the set of records the user may access; a request for a
          record outside that scope is rejected.
        </li>
      </ul>

      <h2>7. Advertising, Analytics, and Tracking</h2>
      <p>
        Gümrah Saha shows no advertising and <strong>uses no</strong> ad network, social media tracking SDK, usage
        analytics, or crash reporting service. Because the App bundles no third-party library, no data flows from
        your device to any third party.
      </p>
      <p>
        The Apple Advertising Identifier (IDFA) is not collected and App Tracking Transparency permission is not
        requested. The only identifier the App processes is the user ID, used for authentication and app
        functionality.
      </p>

      <h2>8. Third Parties</h2>
      <p>There is no third party the App shares data with. The parties involved are:</p>
      <ul>
        <li>
          <strong>The business you work for:</strong> the owner of the server installation the App connects to and
          the data controller for the data. Its own policies govern how that data is stored and processed.
        </li>
        <li>
          <strong>Apple:</strong> distribution and updates go through the App Store. Data related to downloads and
          updates is subject to Apple&apos;s own policies.
        </li>
      </ul>
      <p>Data is never sold or transferred to third parties for marketing purposes.</p>

      <h2>9. Data Retention</h2>
      <p>
        Session information stored on the device is deleted when you sign out. The firm connection stays on the
        device until you switch firms or uninstall the App. Uninstalling removes all local data, including the
        Keychain entries.
      </p>
      <p>
        How long commercial, financial, and operational data is retained on the server is governed by the data
        retention policies of the business you use the App with, and by applicable legal obligations (for example,
        legislation on the retention of commercial books and records).
      </p>

      <h2>10. Account Creation and Closure</h2>
      <p>
        New accounts cannot be created in the App. Accounts are defined by the business you use the App with. To
        request that your account be closed or your access revoked, contact that business; the developer has
        neither authority over nor access to those accounts.
      </p>

      <h2>11. User Rights</h2>
      <p>Users can:</p>
      <ul>
        <li>Sign out to delete the session information stored on the device.</li>
        <li>Switch the firm connection or uninstall the App to clear all local data from the device.</li>
        <li>
          Submit requests to access, correct, or delete their personal data, or to object to its processing, to the
          data controller — that is, the business they use the App with. Such requests are handled under the
          applicable legislation.
        </li>
      </ul>

      <h2>12. Children&apos;s Privacy</h2>
      <p>
        This application is intended solely for corporate users — employees authorised by a business. No data is
        knowingly collected from anyone under 18.
      </p>

      <h2>13. Changes to This Policy</h2>
      <p>
        This Privacy Policy may be updated as new modules are added to the App. The updated version is published on
        this page and the &ldquo;Effective date&rdquo; is changed.
      </p>

      <h2>14. Contact</h2>
      <p>
        <strong>Data controller:</strong> the business you use the App with. Contact the person who opened your
        account, or your company&apos;s system administrator.
      </p>
      <p>
        <strong>Developer / App publisher:</strong> Mehmet Gümrah<br />
        <strong>Email:</strong> <a href="mailto:support@mgumrah.com">support@mgumrah.com</a>
        <br />
        <strong>Web:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
      </p>
    </PrivacyDocument>
  );
}
