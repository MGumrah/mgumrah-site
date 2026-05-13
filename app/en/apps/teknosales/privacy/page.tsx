import Link from "next/link";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknosales/privacy",
  title: "Tekno Sales Privacy Policy",
  description: "Privacy policy for the TeknoSales iOS and Android mobile applications."
});

export default function EnglishPrivacyPage() {
  return (
    <main className="document">
      <header className="document-header">
        <p className="eyebrow">Tekno Sales</p>
        <h1>Privacy Policy</h1>
        <p className="meta">
          Applies to the Tekno Satış B2B mobile application. The iOS and Android versions follow the same data processing principles.
          <br />
          Last updated: May 2026
        </p>
        <div className="language-links" aria-label="Language options">
          <Link className="button" href="/tr/apps/teknosales/privacy/">Türkçe</Link>
          <Link className="button primary" href="/en/apps/teknosales/privacy/">English</Link>
        </div>
      </header>

      <article className="content">
        <h2>1. General Information</h2>
        <p>
          This Privacy Policy explains what information the Tekno Satış mobile application (the "App") collects from users,
          how that information is used, and how it is protected. By using the App, you are deemed to have accepted this policy.
        </p>
        <p>
          The App enables authorized sales representatives and managers to manage B2B sales processes such as customer accounts,
          invoice tracking, collection reports, and product catalogs.
        </p>

        <h2>2. Data Collected</h2>
        <h3>User Credentials</h3>
        <ul>
          <li>Username and password are used only for login authentication.</li>
        </ul>

        <h3>Customer and Commercial Data</h3>
        <ul>
          <li>Account code, commercial title, tax number, and tax office</li>
          <li>Contact information, including email address and mobile phone number</li>
          <li>Balance, debt, and receivable status</li>
        </ul>

        <h3>Financial and Transaction Data</h3>
        <ul>
          <li>Invoice information, including series, number, date, amount, VAT, and discount</li>
          <li>Payment and transaction history</li>
          <li>Collection reports, including cash, credit card, check, and promissory note records</li>
          <li>Responsibility center balance information</li>
        </ul>

        <h3>Sales Representative Data</h3>
        <ul>
          <li>Sales representative code, name, sales amounts, and collection amounts</li>
          <li>Target and quota information</li>
        </ul>

        <h3>Data Stored on the Device</h3>
        <ul>
          <li>Username and password are stored on the device using AES-256 encryption.</li>
          <li>Downloaded product catalogs are stored locally on the device as PDF files.</li>
          <li>The App does not request access to or collect location, camera, microphone, contacts, or personal sensor data.</li>
        </ul>

        <h2>3. Purpose of Data Use</h2>
        <ul>
          <li>Authenticating the user and managing the session</li>
          <li>Displaying customer, invoice, and collection information for authorized users</li>
          <li>Providing sales performance reports</li>
          <li>Downloading and displaying current product catalogs</li>
        </ul>
        <p>
          Data is used only for the business processes listed above. It is not processed for marketing, advertising, or
          unauthorized third-party sharing purposes.
        </p>

        <h2>4. Data Transfer and Sharing</h2>
        <p>
          The App transfers data only to the company's own server at <strong>api.teknoiklimlendirme.com</strong> over HTTPS.
        </p>
        <p>
          Firebase Crashlytics and Firebase Analytics are used for crash reporting, technical stability monitoring, and usage analysis.
          These services may collect technical data such as app crashes, error logs, device and version information, app interactions,
          and usage statistics.
        </p>
        <p>
          Firebase Analytics data is used to improve the app experience and monitor technical performance. Advertising networks and
          social media platforms are not used in this context. All network traffic is encrypted with HTTPS; clear-text HTTP connections
          are not permitted.
        </p>

        <h2>5. Data Security</h2>
        <ul>
          <li>Passwords are stored on the device using AES-256-GCM encryption.</li>
          <li>The API key is transmitted in each request through the secure <strong>x-api-key</strong> header.</li>
          <li>In-app file sharing is controlled through the Android FileProvider mechanism.</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>
          Credentials stored on the device are deleted when the user logs out or uninstalls the App. Server-side data is subject
          to the company's internal data retention policy.
        </p>

        <h2>7. User Rights</h2>
        <ul>
          <li>Users can delete credentials stored on the device through the App.</li>
          <li>Users can remove local data from the device by uninstalling the App.</li>
          <li>Users can contact the company administrator for account-related data requests.</li>
        </ul>

        <h2>8. Children's Privacy</h2>
        <p>This App is intended only for corporate users and does not knowingly collect data from individuals under the age of 18.</p>

        <h2>9. Policy Changes</h2>
        <p>
          This Privacy Policy may be updated when necessary. Significant changes will be announced through the App or the
          company's official channels.
        </p>

        <h2>10. Contact</h2>
        <p>
          <strong>Company / Data Controller:</strong> Tekno İklimlendirme<br />
          <strong>Email:</strong> <a href="mailto:info@teknoiklimlendirme.com">info@teknoiklimlendirme.com</a><br />
          <strong>Website:</strong> <a href="https://teknoiklimlendirme.com">teknoiklimlendirme.com</a>
        </p>
        <p>
          <strong>Technical Developer:</strong> Mehmet Gümrah<br />
          <strong>Website:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
        </p>
      </article>
    </main>
  );
}
