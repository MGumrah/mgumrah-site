import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata, TEKNO_PORTAL_CARD } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknoportal/privacy-microsoft-store",
  title: "Tekno Portal — Microsoft Store Edition Privacy Policy",
  description:
    "Privacy policy for the Windows version of Tekno Portal installed from the Microsoft Store. That version has no card payment and no IBAN entry.",
  image: TEKNO_PORTAL_CARD
});

export default function EnglishTeknoPortalMicrosoftStorePrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="teknoportal-microsoft-store">
      <p>
        This policy applies <strong>only to the Windows version of Tekno Portal installed from the Microsoft Store</strong>.
        The <a href="/en/apps/teknoportal/privacy/">general privacy policy</a> applies to the iOS and Android versions
        and to the Windows version distributed directly by the company.
      </p>
      <p>
        Tekno Portal is a business-to-business (B2B) self-service application for customers of Tekno İklimlendirme. It is
        not intended for general consumers. Accounts cannot be created in the app; they are issued by Tekno
        İklimlendirme and the credentials are delivered through your sales representative.
      </p>

      <h2>1. Not present in this version</h2>
      <p>The following are <strong>not present</strong> in this version, and the app never asks for them:</p>
      <ul>
        <li>
          <strong>There is no card payment.</strong> The app does not ask for a cardholder name, card number, expiry
          date or security code (CVV); it does not process, transmit or store card data.
        </li>
        <li>
          <strong>There is no IBAN entry and no IBAN display.</strong> The app never asks you for a bank account number.
        </li>
        <li>
          <strong>No financial transaction is initiated or processed.</strong>
        </li>
        <li>No advertising, advertising identifier, third-party tracking or analytics software.</li>
        <li>No crash-reporting service is used.</li>
        <li>No access to location, camera, microphone, contacts, calendar, health or sensor data is requested.</li>
      </ul>

      <h2>2. Data processed</h2>

      <h3>Account and session data</h3>
      <p>
        Username and password (transmitted to the company&apos;s server only with the sign-in request), user id, name
        and role, the account code and access rights bound to the account, session token and its validity period.
      </p>
      <p>
        So that your session can continue on the next launch,{" "}
        <strong>your username and password are stored on your device</strong>: they are encrypted with the Windows data
        protection mechanism (DPAPI), can be decrypted only by the same Windows user, are kept in a record separate from
        the session token, are never sent to the server or to any third party, and are{" "}
        <strong>deleted when you sign out</strong>.
      </p>

      <h3>Business data (display only)</h3>
      <p>
        Account code, legal title and display name; balance, debit and credit position; account statement history;
        invoice details, invoice lines and invoice PDF documents; receipt documents; orders, pending orders and quotes;
        past product (stock) movements; product catalogues.
      </p>
      <p>
        This data already belongs to <strong>your own account</strong> and is retrieved from the company&apos;s own
        server (ERP). The app displays it; no payment or collection operation is performed on it.
      </p>

      <h3>Invoice details</h3>
      <p>
        Legal title, address, district, province, tax office, tax number, phone and e-mail are displayed. Of these,{" "}
        <strong>only the address, district and phone</strong> fields can be updated in the app, and when updated they
        are sent to the company&apos;s server. Legal title, tax office, tax number and province cannot be changed in the
        app.
      </p>

      <h3>Order and quote data</h3>
      <p>
        Product information and product-specific price queries from your own catalogue, the orders and order lines you
        create, pending orders and quote records. Price and account code are not sent from the client in an order
        request; both are derived on the server. A single-use transaction id generated for each basket prevents the same
        order being recorded twice.
      </p>

      <h3>Data kept on the device only</h3>
      <p>
        The <strong>location (address) records</strong> you enter yourself in the Profile section are never sent to the
        server; they are kept only in the app&apos;s area on your device. These records contain no coordinates; the map
        is searched using the address text you typed. Downloaded product catalogues (PDF), viewed
        statement/invoice/receipt documents, incomplete order drafts, temporary inputs in the calculators, and simple
        app preferences such as whether the release-notes window has been shown, also remain on the device.
      </p>

      <h3>Technical data</h3>
      <p>
        The application version and application id (sent so the server can check the minimum supported version) and the
        state of the network connection (read on the device only, to tell &ldquo;no internet&rdquo; apart from
        &ldquo;server unreachable&rdquo;).
      </p>

      <h3>Crash records stay on the device</h3>
      <p>
        If the app closes unexpectedly, technical error information is written to{" "}
        <code>%LocalAppData%\TeknoPortal\cokme.log</code> <strong>on your device only</strong>. This file is never
        transmitted anywhere automatically; it is reviewed only if you send it with a support request.
      </p>

      <h2>3. Purposes of processing</h2>
      <ul>
        <li>Authenticating the user and managing the session</li>
        <li>Showing the user only the data belonging to their own accounts</li>
        <li>Providing account statement, balance and invoice information</li>
        <li>Running order and quote processes</li>
        <li>Updating the address, district and phone fields of the invoice details</li>
        <li>Downloading and displaying product catalogues and documents</li>
        <li>Running the value-date and discount calculators</li>
        <li>Checking the minimum application version and showing an update prompt when needed</li>
        <li>Applying permission-based access controls</li>
      </ul>
      <p>Data is not used for advertising, ad targeting, profiling or third-party marketing.</p>

      <h2>4. Data transfer and sharing</h2>
      <ul>
        <li>
          <strong>The company&apos;s own server.</strong> Account, business and order data is transmitted only to{" "}
          <strong>api.teknoiklimlendirme.com</strong> over HTTPS.
        </li>
        <li>
          <strong>Microsoft Store.</strong> Distribution and updates of the app are handled through the Microsoft Store;
          this covers only the download of application files.
        </li>
        <li>
          <strong>Map application.</strong> Tapping a link on the locations screen opens a map search in the default
          browser <strong>using the address text you typed</strong>. The app does not read or transmit the
          device&apos;s location.
        </li>
        <li>
          No data is transmitted to any other third party. Data is not sold or transferred to third parties for
          marketing purposes.
        </li>
      </ul>

      <h2>5. Data security</h2>
      <ul>
        <li>All server communication uses HTTPS (TLS); unencrypted connections are not allowed.</li>
        <li>
          Requests are authorised with a server-validated API key and, for the signed-in user, a time-limited session
          token.
        </li>
        <li>Session information is stored encrypted with the Windows data protection mechanism (DPAPI).</li>
        <li>
          The username and password stored for silent sign-in are kept in a record separate from the session token and
          are likewise encrypted with DPAPI; they are deleted when you sign out.
        </li>
        <li>
          On the server, every request is validated against the set of accounts the user may access; a request for an
          account outside that scope is rejected.
        </li>
      </ul>

      <h2>6. Retention</h2>
      <p>
        Session information stored on the device becomes invalid when you sign out or when the session token expires;
        the silent sign-in record is deleted when you sign out. All local data is removed when the app is uninstalled.
        Because the location records you enter are kept on the device only, they are lost when the app is uninstalled or
        the device is changed; they are not synchronised across devices. Business and financial data on the server is
        retained according to the company&apos;s data retention policies and applicable legal obligations.
      </p>

      <h2>7. Account creation and closure</h2>
      <p>
        New accounts cannot be created in the app; accounts are issued by Tekno İklimlendirme. To request closure of
        your account or suspension of your access, contact your sales representative or the addresses below.
      </p>

      <h2>8. Your rights</h2>
      <p>
        You have the right to learn whether your personal data is processed, to request information about it, and to
        request its correction or deletion. Because this account is created by the business you work with, that business
        is the primary data controller.
      </p>

      <h2>9. Children&apos;s privacy</h2>
      <p>
        The app is intended only for authorised users of corporate customers; data is not knowingly collected from
        individuals under 18.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        This policy may be updated; the current version is always published at this address and the effective date is
        changed.
      </p>

      <h2>11. Contact</h2>
      <p>
        <strong>Company / Data Controller:</strong> Tekno İklimlendirme<br />
        <strong>E-mail:</strong> <a href="mailto:info@teknoiklimlendirme.com">info@teknoiklimlendirme.com</a><br />
        <strong>Web:</strong> <a href="https://teknoiklimlendirme.com">teknoiklimlendirme.com</a>
      </p>
      <p>
        <strong>Technical Developer:</strong> Mehmet Gümrah<br />
        <strong>E-mail:</strong> <a href="mailto:support@mgumrah.com">support@mgumrah.com</a><br />
        <strong>Web:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
      </p>
    </PrivacyDocument>
  );
}
