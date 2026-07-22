import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknosales/privacy",
  title: "Tekno Sales Privacy Policy",
  description: "Privacy policy for the TeknoSales iOS and Android mobile applications."
});

export default function EnglishPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="teknosales">
        <p>
          This Privacy Policy explains what information the Tekno Satış mobile application (the &ldquo;App&rdquo;) collects
          from its users, the purposes for which this information is used, with whom it may be shared, and how it is
          protected.
        </p>
        <p>
          The App enables authorized sales representatives, managers, and related company users to manage B2B sales
          processes such as customer accounts, invoice tracking, stock information, quotation tracking, order and shipment
          reports, collection reports, in-app messaging, and product catalogs.
        </p>

        <h2>1. Data Collected</h2>
        <p>Depending on the user&apos;s permissions and the screen being used, the App may process the following data:</p>

        <h3>User Credentials</h3>
        <ul>
          <li>Username</li>
          <li>Password</li>
          <li>User ID</li>
          <li>User role and permission information</li>
          <li>Sales representative code</li>
        </ul>

        <h3>Customer and Commercial Data</h3>
        <ul>
          <li>Account code</li>
          <li>Commercial title</li>
          <li>Tax number and tax office</li>
          <li>Contact information</li>
          <li>Email and phone information</li>
          <li>Balance, debt, and receivable status</li>
          <li>Account transaction history</li>
        </ul>

        <h3>Financial and Transaction Data</h3>
        <ul>
          <li>Invoice information</li>
          <li>Invoice series, number, date, and amount information</li>
          <li>VAT, discount, and total amounts</li>
          <li>Payment and transaction history</li>
          <li>Collection reports</li>
          <li>Cash, credit card, check, and promissory note information</li>
          <li>Responsibility center balance information</li>
        </ul>

        <h3>Stock, Order, Quotation, and Shipment Data</h3>
        <ul>
          <li>Stock code, stock name, and unit information</li>
          <li>Warehouse-based stock quantities</li>
          <li>Stock movements</li>
          <li>Quotation information and quotation line items</li>
          <li>Pending orders</li>
          <li>Pending waybills</li>
          <li>Vehicle shipment report information</li>
          <li>Report data such as license plate, shipment amount, shipment quantity, and number of waybills</li>
        </ul>

        <h3>Messaging, Communication, and Status Data</h3>
        <ul>
          <li>The contents of messages sent and received within the app</li>
          <li>Conversation, sender, and recipient identifiers</li>
          <li>Any image or PDF files attached to messages</li>
          <li>Online / last-active (presence) status</li>
          <li>Feedback and support request contents</li>
        </ul>

        <h3>Data Stored on the Device</h3>
        <ul>
          <li>
            Username and password are stored securely: on iOS using Apple Keychain, and on Android using Android&apos;s
            secure storage mechanisms.
          </li>
          <li>Session and permission information may be kept securely on the device.</li>
          <li>
            Downloaded product catalogs and PDF documents (invoices, waybills, receipts, etc.) may be kept in the
            device&apos;s local storage.
          </li>
          <li>
            The Firebase Cloud Messaging device token used for push notifications may be stored on the device, linked to
            the user&apos;s session.
          </li>
          <li>
            Certain filter, sorting, and screen preferences may be stored on the device to improve the user experience.
          </li>
        </ul>

        <h3>Technical and Usage Data</h3>
        <ul>
          <li>App version</li>
          <li>Device model and operating system information</li>
          <li>Crash and error logs</li>
          <li>App performance information</li>
          <li>Screen view and basic usage statistics</li>
          <li>Online / last-active (presence) status</li>
          <li>Firebase Cloud Messaging notification token</li>
          <li>On Android, the Google Play Services advertising ID within the scope of Firebase Analytics</li>
        </ul>

        <p>
          The App does not request access to or collect location, camera, microphone, contacts, or personal sensor data.
          The map screen in the App only displays fixed company showroom locations and does not access the device&apos;s
          location data.
        </p>

        <h2>2. Purposes of Data Use</h2>
        <p>The collected data is used for the following purposes:</p>
        <ul>
          <li>Authenticating the user</li>
          <li>Managing the session</li>
          <li>
            Displaying customer, invoice, stock, quotation, order, shipment, and collection information that the user is
            authorized to access
          </li>
          <li>Providing sales and collection performance reports</li>
          <li>Downloading and viewing product catalogs</li>
          <li>Enabling in-app messaging between authorized users</li>
          <li>Showing online (presence) status to relevant users</li>
          <li>Receiving and responding to feedback and support requests</li>
          <li>Sending in-app notifications and important announcements</li>
          <li>Detecting application errors and improving technical stability</li>
          <li>Improving app performance and user experience</li>
          <li>Enforcing permission-based access controls</li>
        </ul>
        <p>
          Data is not used for advertising display, ad targeting, or unauthorized third-party marketing purposes.
        </p>

        <h2>3. Use of Advertising Identifier</h2>
        <p>
          On Android, the Google Play Services advertising ID may be used within the scope of Firebase Analytics. This use
          is limited to:
        </p>
        <ul>
          <li>Usage analysis</li>
          <li>App performance measurement</li>
          <li>Technical improvement</li>
          <li>Error and stability monitoring</li>
        </ul>
        <p>only.</p>
        <p>
          On iOS, the Apple Advertising Identifier (IDFA) is not collected and App Tracking Transparency permission is not
          requested. The App declares no tracking in its <strong>PrivacyInfo.xcprivacy</strong> file.
        </p>
        <p>
          No advertising is displayed in the App. The advertising identifier is not used for ad targeting, user profiling,
          or marketing purposes.
        </p>

        <h2>4. Notifications, In-App Messaging, and Presence</h2>
        <p>
          The App may use Firebase Cloud Messaging for important announcements, app updates, and informational messages.
          Within this scope:
        </p>
        <ul>
          <li>A notification token for the device may be obtained (on iOS, the APNs token is bridged to the FCM token via Firebase).</li>
          <li>The notification token may be linked to the signed-in user&apos;s account.</li>
          <li>
            The token information is transmitted to the company server (<strong>api.teknoiklimlendirme.com</strong>) via
            the <code>/device-tokens</code> endpoint.
          </li>
          <li>When the user logs out or changes devices, the token is removed from the server.</li>
          <li>Users can disable app notifications from the operating system settings.</li>
        </ul>
        <p>The notification token is used only to send and manage app notifications.</p>

        <h3>In-App Messaging</h3>
        <p>
          The App provides in-app messaging between authorized users. The contents of sent messages, along with
          conversation, sender, and recipient identifiers (and any attached image/PDF files), are processed and stored on
          the company server (<strong>api.teknoiklimlendirme.com</strong>). New message alerts are delivered via Firebase
          Cloud Messaging. Messages are used only for in-app business communication.
        </p>

        <h3>Presence (Online Status)</h3>
        <p>
          While the App is in the foreground, a periodic signal indicating that the user is online (on average every 20–45
          seconds) is sent to the company server. This information may be shown to relevant authorized users as online /
          last-seen status. When the App is backgrounded or closed, the user is considered offline shortly afterwards. This
          feature does not involve any location data.
        </p>

        <h3>Feedback and Support Requests</h3>
        <p>
          Users can submit feedback or support requests through the App. The request content and related messages are
          processed on the company server; updates about the request may be delivered via Firebase Cloud Messaging
          notifications.
        </p>

        <h2>5. Data Transfer and Sharing</h2>
        <p>
          The App transmits data to the company&apos;s own servers at <strong>api.teknoiklimlendirme.com</strong> over the
          HTTPS protocol.
        </p>
        <p>
          Within this scope, basic usage events such as screen openings, button interactions, searches, and session
          start/end are also sent in batches to the company&apos;s own server (first-party analytics) to improve the App.
          These events are associated with a randomly generated session identifier and are not shared with third parties.
        </p>

        <p>The following third-party services are used in the App:</p>

        <h3>Firebase Cloud Messaging</h3>
        <p>
          Used to send notifications. Within this scope, the device notification token may be processed. Used on both iOS
          and Android.
        </p>

        <h3>Firebase Analytics</h3>
        <p>
          Enabled on the <strong>Android</strong> version only. Used to analyze app usage statistics, screen views, basic
          interactions, and technical performance information. On Android, within the scope of Firebase Analytics, in-app
          analytics fields such as user ID, user type, and sales representative information may be processed.
        </p>
        <p>
          On the <strong>iOS</strong> version, Firebase Analytics is disabled; instead, the anonymous first-party usage
          analytics described above (not linked to a user identity) is used.
        </p>

        <h3>Firebase Crashlytics</h3>
        <p>
          Used to collect technical information such as app crashes, error logs, device model, operating system, and app
          version. This data is used to detect errors and improve app stability.
        </p>

        <h3>App Updates</h3>
        <ul>
          <li>
            <strong>iOS:</strong>{" "}
            Apple&apos;s iTunes Lookup API is used to check the current version on the App Store.
            If a new version is detected, the user is notified and the App Store page is opened. This request is
            anonymous and contains no personal data.
          </li>
          <li>
            <strong>Android:</strong> App updates are checked and offered to the user through Google Play In-App Updates.
          </li>
        </ul>

        <p>No advertising network, social media tracking SDK, or third-party advertising platform is used.</p>

        <h2>6. Data Security</h2>
        <p>The following technical measures are applied to protect the data:</p>
        <ul>
          <li>
            User credentials are protected using Apple Keychain on iOS and Android&apos;s secure storage mechanisms on
            Android.
          </li>
          <li>Sensitive local data is protected using platform-specific secure storage mechanisms.</li>
          <li>Server communication is performed over HTTPS.</li>
          <li>
            API requests are authorized using the secure <strong>x-api-key</strong> header and validated on the server
            side.
          </li>
          <li>
            For signed-in users, requests also carry a time-limited session token (<strong>Authorization: Bearer</strong>),
            which is validated on the server side.
          </li>
          <li>
            In-app file sharing is controlled through the system share sheet (ShareLink / UIActivityViewController) on
            iOS and through the Android FileProvider mechanism on Android.
          </li>
          <li>Clear-text HTTP connections are not permitted; all traffic is encrypted with TLS.</li>
        </ul>

        <h2>7. Data Retention</h2>
        <p>
          Credentials and session information stored on the device may be deleted when the user logs out of the App or
          uninstalls it.
        </p>
        <p>
          Downloaded catalogs, PDF files, and local preferences may remain on the device. Users can clear local data on
          the device by uninstalling the App.
        </p>
        <p>
          Commercial, financial, and operational data on the server side is retained in accordance with the company&apos;s
          internal data retention policies and applicable legal obligations.
        </p>
        <p>
          Technical data processed within the scope of Firebase Analytics, Crashlytics, and Cloud Messaging may be
          subject to the data retention policies of the relevant service providers.
        </p>

        <h2>8. User Rights</h2>
        <p>Users may:</p>
        <ul>
          <li>Delete credentials stored on the device by logging out from the App.</li>
          <li>Remove local data from the device by uninstalling the App.</li>
          <li>Contact the company administrator or data controller for data requests related to their accounts.</li>
          <li>Manage notification permissions from the device settings.</li>
        </ul>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          This App is intended only for corporate and authorized users. Data is not knowingly collected from individuals
          under the age of 18.
        </p>

        <h2>10. Policy Changes</h2>
        <p>
          This Privacy Policy may be updated when necessary. Significant changes may be announced within the App, through
          the website, or through the company&apos;s official communication channels.
        </p>

        <h2>11. Contact</h2>
        <p>
          <strong>Company / Data Controller:</strong> Tekno İklimlendirme<br />
          <strong>Email:</strong> <a href="mailto:info@teknoiklimlendirme.com">info@teknoiklimlendirme.com</a><br />
          <strong>Website:</strong> <a href="https://teknoiklimlendirme.com">teknoiklimlendirme.com</a>
        </p>
        <p>
          <strong>Technical Developer:</strong> Mehmet Gümrah<br />
          <strong>Website:</strong> <a href="https://mgumrah.com">mgumrah.com</a>
        </p>
    </PrivacyDocument>
  );
}
