import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknoportal/privacy",
  title: "Tekno Portal Privacy Policy",
  description: "Privacy policy for the Tekno Portal iOS, Android, and Windows applications."
});

export default function EnglishTeknoPortalPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="teknoportal">
      <p>
        This Privacy Policy explains what information the Tekno Portal application (the &ldquo;App&rdquo;) processes
        about its users, the purposes it is used for, who it may be shared with, and how it is protected. The policy
        applies to the iOS, Android, and Windows versions of the App.
      </p>
      <p>
        Tekno Portal is a B2B self-service application for customers of Tekno İklimlendirme. A customer can review their
        own account, balance, invoice and payment activity, orders, and quotes, pay by card, and place orders from their
        own product catalog. Each account can only reach data belonging to its own set of customer accounts; no other
        customer&apos;s data is visible.
      </p>
      <p>
        Accounts cannot be created in the App. User accounts are set up by Tekno İklimlendirme, and credentials are
        provided through a sales representative.
      </p>

      <h2>1. Summary</h2>
      <ul>
        <li>The App contains no advertising, no advertising identifier, and no third-party tracking or analytics SDK.</li>
        <li>
          Firebase Crashlytics is used for crash diagnostics only; usernames, customer account details, balances, and
          card data are never sent to it.
        </li>
        <li>No location, camera, microphone, contacts, or sensor permission is requested.</li>
        <li>Card details are never saved on the device; payment completes on the bank&apos;s 3D Secure page.</li>
        <li>
          The session runs on a time-limited access token stored encrypted on the device. On the Windows and iOS
          versions, so that your session can continue the next time you open the app, your user name and password are
          also stored encrypted on your device; they are never sent to a server or a third party, and they are deleted
          when you sign out. On the Android version the password is not stored on the device.
        </li>
        <li>The IBANs and addresses you enter under Profile are never sent to the server and stay on your device only.</li>
        <li>The commercial data the App processes is the data of your own customer account.</li>
      </ul>

      <h2>2. Data Processed</h2>

      <h3>Account and Session Data</h3>
      <ul>
        <li>Username and password (transmitted to the server in the sign-in request)</li>
        <li>User ID, full name, and role</li>
        <li>The customer account code linked to the login and its access permissions</li>
        <li>Session token and its expiry</li>
      </ul>
      <p>
        The session is kept locally on your device with a secure access token. On the <strong>Windows and iOS</strong>{" "}
        versions, so that your session can continue the next time you open the app, your user name and password are also
        stored on your device: on Windows they are encrypted with the Windows data protection mechanism (DPAPI) and can
        be decrypted only by the same Windows user; on iOS they are held in the Keychain, marked valid on this device
        only and never synced through iCloud. On both versions this data is never sent to a server or a third party, and
        it is deleted when you sign out. On the <strong>Android</strong> version the password is not stored on the
        device; there, session continuity relies solely on the time-limited session token.
      </p>

      <h3>Account and Financial Data</h3>
      <ul>
        <li>Customer account code, trade name, and display name</li>
        <li>Balance, debit, and credit status</li>
        <li>Account activity (statement) history</li>
        <li>Invoice details, invoice line items, and invoice PDF documents</li>
        <li>Collection receipts and records of past card collections</li>
        <li>Billing details: trade name, address, district, province, tax office, tax number, phone, and email</li>
      </ul>
      <p>
        On the billing details screen, only the <strong>address, district, and phone</strong> fields can be updated by
        the user. Trade name, tax office, tax number, and province cannot be changed from the App.
      </p>

      <h3>Order, Quote, and Product Data</h3>
      <ul>
        <li>Product information from your own catalog and per-product price queries</li>
        <li>Orders you create and their line items</li>
        <li>Pending orders and quote records</li>
        <li>Your own past product (stock) activity</li>
      </ul>
      <p>
        The order request body carries neither the price nor the customer account code — the server derives both. A
        single-use request identifier generated for each basket prevents the same order from being recorded twice.
      </p>

      <h3>Card Payment Data</h3>
      <ul>
        <li>Cardholder name, card number, expiry date, and CVV (only at the moment of payment)</li>
        <li>Payment amount, number of installments, and the account the payment is booked to</li>
        <li>Payment result: transaction number, date, amount, bank authorization code, card type, and the last four digits of the card number</li>
      </ul>

      <h3>Data Kept on the Device Only</h3>
      <ul>
        <li>
          <strong>Your own IBAN and location records.</strong> The bank account and address entries you add under
          Profile are <strong>never sent to the server</strong>; they are kept only in the App&apos;s private storage on
          the device. These records contain no coordinates — the map is searched using the address text you typed.
        </li>
        <li>Downloaded product catalogs (PDF) and the statement, invoice, and receipt documents you view</li>
        <li>Unfinished order drafts and temporary input in the calculation tools</li>
        <li>Simple app preferences, such as whether the &ldquo;What&apos;s new&rdquo; screen has been shown</li>
      </ul>

      <h3>Technical Data</h3>
      <ul>
        <li>App version and application identifier (sent so the server can enforce its minimum version check)</li>
        <li>Network connectivity status (read on the device only, to tell &ldquo;no internet&rdquo; apart from &ldquo;server unreachable&rdquo;)</li>
        <li>
          Technical information captured at the moment of a crash: the error log (stack trace), device model, operating
          system version, app version, and the time of the crash (sent only to the crash reporting service; see Section
          5)
        </li>
      </ul>
      <p>
        The App uses <strong>no</strong>{" "}
        usage analytics, screen tracking, or telemetry service, and collects no advertising identifier. Device model and
        operating system version are transmitted only when a crash occurs, to the crash reporting service for
        diagnostic purposes; they are not sent to the company&apos;s own server.
      </p>

      <h3>Permissions Not Requested</h3>
      <p>
        The App <strong>does not request</strong>{" "}
        access to location, camera, microphone, contacts, calendar, health, or sensor data, and does not collect such
        data. On Android, only the internet and network-state permissions are declared. Map links shown in the App open
        the device&apos;s map application with an address string, without reading the device&apos;s location.
      </p>

      <h2>3. Purposes of Processing</h2>
      <ul>
        <li>Authenticating the user and managing the session</li>
        <li>Showing the user only the data belonging to their own customer accounts</li>
        <li>Presenting statements, balances, invoices, and collection information</li>
        <li>Running order and quote workflows</li>
        <li>Initiating and completing card payments and generating the collection receipt</li>
        <li>Downloading and viewing product catalogs and documents</li>
        <li>Running the term-difference and discount calculation tools</li>
        <li>Checking the minimum app version and showing an update prompt when required</li>
        <li>Enforcing permission-based access control</li>
        <li>Monitoring app stability and reviewing crash reports to diagnose and fix errors</li>
      </ul>
      <p>
        Data is <strong>not</strong> used for advertising, ad targeting, profiling, or third-party marketing.
      </p>

      <h2>4. Card Payment and 3D Secure</h2>
      <p>Card payments complete through the 3D Secure flow operated by the bank. The process works as follows:</p>
      <ul>
        <li>
          Card details are entered in the payment form and sent over HTTPS to the company server (
          <strong>api.teknoiklimlendirme.com</strong>), which opens the 3D session with the bank&apos;s virtual POS
          infrastructure.
        </li>
        <li>
          The verification step completes <strong>on the bank&apos;s own page</strong>, inside a secure browser
          component within the App. SMS verification codes and similar information belong to the bank; the App does not
          read them.
        </li>
        <li>
          The card number, expiry date, and CVV are <strong>never stored on the device</strong>: they are not written to
          disk, not backed up, not written to logs, and not held in any persistent store while moving between screens.
          They exist in memory only for the duration of the payment request and are cleared once it is sent.
        </li>
        <li>
          After payment, the server retains only the transaction record and the <strong>last four digits</strong> of the
          card number. The full card number and the CVV are not retained.
        </li>
        <li>
          Screenshot and screen-recording protection on the screens where card details are entered and shown{" "}
          <strong>differs by platform</strong>: on Android, screenshots are blocked; on iOS, sensitive areas are masked
          when screen recording or mirroring is detected (iOS offers no interface for blocking screenshots, so the
          protection there covers recording and mirroring only).{" "}
          <strong>The Windows version has no screenshot or screen-recording protection on these screens.</strong>
        </li>
        <li>The App offers no card-on-file feature for reusing a card in later payments.</li>
      </ul>
      <p>
        The entries listed on the &ldquo;My cards&rdquo; screen are past collection receipts booked to your account.
        They contain no card credentials — only date, amount, installments, bank, and, where available, the last four
        digits of the card.
      </p>

      <h2>5. Advertising, Analytics, and Tracking</h2>
      <p>
        Tekno Portal shows no advertising and uses <strong>no</strong> ad network or social media tracking SDK.
      </p>
      <p>
        The App uses the Google Firebase Crashlytics service to monitor its stability. This service collects the error
        log (stack trace) recorded at the moment of a crash, the device model, the operating system version, the app
        version, and the time of the crash. The information collected is used solely to diagnose and resolve errors;
        usernames, customer account details, balances, and card data are not collected in this scope and are never
        transmitted to Crashlytics.
      </p>
      <p>
        The App does not use Firebase Analytics or Firebase Cloud Messaging, and no advertising identifier (Advertising
        ID) is collected. The App contains no push notification infrastructure and processes no device notification
        token.
      </p>
      <p>
        On iOS, the Apple Advertising Identifier (IDFA) is not collected and App Tracking Transparency permission is not
        requested. The App&apos;s <strong>PrivacyInfo.xcprivacy</strong> manifest declares that no tracking takes place;
        the only declared data type is the user ID, processed for authentication and app functionality. On Android, the
        Google Play Services advertising ID is not used.
      </p>

      <h2>6. Data Transfer and Sharing</h2>
      <p>
        The App transmits account, customer, financial, and order data only to the company&apos;s own server at{" "}
        <strong>api.teknoiklimlendirme.com</strong>, over HTTPS. The sole exception is the technical error data sent to
        the crash reporting service listed below. Data is not sold or transferred to third parties for marketing
        purposes.
      </p>
      <ul>
        <li>
          <strong>Banks and virtual POS providers:</strong>{" "}
          card payments run through the relevant bank&apos;s 3D Secure infrastructure. Card and transaction data is
          transmitted to the bank, which acts as a separate data controller under its own privacy policy.
        </li>
        <li>
          <strong>App stores:</strong>{" "}
          distribution and updates are handled by the App Store, Google Play, and the Microsoft Store. Data related to
          downloads and updates is subject to the respective store provider&apos;s policies.
        </li>
        <li>
          <strong>Map application:</strong>{" "}
          tapping a link on the location screen opens the device&apos;s map application with an address string. From
          that point the map provider&apos;s privacy policy applies; the App neither reads nor transmits the
          device&apos;s location.
        </li>
        <li>
          <strong>Crash reporting:</strong> Google Firebase Crashlytics (technical error data only; see Section 5).
        </li>
      </ul>

      <h2>7. Data Security</h2>
      <ul>
        <li>All server communication uses HTTPS (TLS); cleartext HTTP connections are not permitted.</li>
        <li>
          Requests are authorized with a server-validated API key (<strong>x-api-key</strong>) and, for signed-in users,
          a time-limited session token (<strong>Authorization: Bearer</strong>).
        </li>
        <li>
          Session data is held in platform-specific secure storage: an encrypted preference store on Android, the
          Keychain on iOS (this-device-only, with iCloud sync disabled), and the operating system&apos;s data protection
          (DPAPI) mechanism on Windows.
        </li>
        <li>
          The user name and password kept for silent sign-in are held in a record <strong>separate</strong> from the
          session token and are separately encrypted: on Windows in a separate file, again with the Windows data
          protection mechanism (DPAPI) and decryptable only by the same Windows user; on iOS in a separate Keychain
          entry, marked valid on this device only. This record is deleted when the user signs out. On Android the
          password is never stored; there, session continuity relies solely on the time-limited session token.
        </li>
        <li>
          On Android, session data is excluded from cloud backup and device transfer; on iOS, the session token is not
          synced through iCloud.
        </li>
        <li>
          File sharing is narrow and controlled: only the downloaded catalog and document folders are exposed for
          sharing, and areas holding session data cannot be shared.
        </li>
        <li>
          On the server, every request is validated against the set of accounts the user may reach; a request for an
          account outside that set is rejected.
        </li>
      </ul>

      <h2>8. Data Retention</h2>
      <p>
        Session data stored on the device becomes invalid when the user signs out or when the session token expires;
        removing the App deletes all local data from the device. On the Windows and iOS versions, the user name and
        password kept for silent sign-in are not deleted when the token expires — continuing the session in exactly that
        situation is the purpose of silent sign-in; that record is deleted when the user signs out.
      </p>
      <p>
        Downloaded catalogs are kept persistently on the device, while statement, invoice, and receipt documents are
        kept in a temporary cache that the operating system may clear.
      </p>
      <p>
        Because the IBAN and address records you enter under Profile are held on the device only, they are lost when the
        App is removed or the device is replaced; they are not synced between devices.
      </p>
      <p>
        Commercial, financial, and operational data on the server is retained in line with the company&apos;s internal
        retention policies and applicable legal obligations (for example, legislation on the retention of commercial
        books and records).
      </p>

      <h2>9. Account Creation and Closure</h2>
      <p>
        New accounts cannot be created in the App; accounts are set up by Tekno İklimlendirme. To request closure of
        your account or suspension of your access, contact your sales representative or use the contact addresses below.
        Closing an account does not prevent commercial and financial records from being retained in company systems for
        their statutory retention periods.
      </p>

      <h2>10. User Rights</h2>
      <p>Users can:</p>
      <ul>
        <li>Sign out of the App to delete the session data stored on the device.</li>
        <li>Remove the App to clear all local data from the device.</li>
        <li>Delete the IBAN and address records they entered under Profile at any time.</li>
        <li>
          Submit requests to access, correct, or delete their personal data, or to object to its processing, to the data
          controller. Requests are handled in accordance with applicable legislation.
        </li>
      </ul>

      <h2>11. Children&apos;s Privacy</h2>
      <p>
        This App is intended solely for authorized users of corporate customers. Data is not knowingly collected from
        individuals under the age of 18.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        This Privacy Policy may be updated as new modules are added to the App. The updated version is published on this
        page and the &ldquo;Effective date&rdquo; is revised. Significant changes may be announced in the App or through
        the company&apos;s official communication channels.
      </p>

      <h2>13. Contact</h2>
      <p>
        <strong>Company / Data Controller:</strong> Tekno İklimlendirme<br />
        <strong>Email:</strong> <a href="mailto:info@teknoiklimlendirme.com">info@teknoiklimlendirme.com</a><br />
        <strong>Web:</strong> <a href="https://teknoiklimlendirme.com">teknoiklimlendirme.com</a>
      </p>
      <p>
        <strong>Technical Developer:</strong> Mehmet Gümrah<br />
        <strong>Email:</strong> <a href="mailto:support@mgumrah.com">support@mgumrah.com</a><br />
        <strong>Web:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
      </p>
    </PrivacyDocument>
  );
}
