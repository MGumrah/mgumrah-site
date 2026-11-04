import PrivacyDocument from "../../../../privacy-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/games/arena2d/privacy",
  title: "ARENA 2D Privacy Policy",
  description:
    "Privacy policy for the ARENA 2D game. No account is required and progress stays on your device; ads are served by Unity LevelPlay and connected ad networks, and purchases are processed by Apple."
});

// The privacy address given to the App Store (the game's PRIVACY POLICY button opens it too: AppLinks.PrivacyPolicyUrl in
// the game repo). This text must match the App Store Connect privacy declaration (App Privacy); those answers follow
// Unity LevelPlay's data table and iOS's App Tracking Transparency (ATT): the device ID (only with the ATT permission) is
// used for tracking; advertising data, product interaction (if partners share it) and performance data are collected;
// none of it is linked to your identity by us. If the ad mediation or its connected networks, ATT, the EEA/UK/Switzerland
// ad-support prompt, in-app purchases (Unity IAP / Apple) or analytics change, update this text, its Turkish twin and
// the App Privacy answers together. Release/privacy-policy.html in the game repo is only the first template; this text
// is the current one.
export default function EnglishArena2dPrivacyPage() {
  return (
    <PrivacyDocument locale="en" app="arena2d">
      <h2>Summary</h2>
      <p>
        ARENA 2D does not ask you to create an account, <strong>we do not collect</strong> your name, email
        address or location, and your game progress stays on your device. The game does, however, show ads:
        they are served by the <strong>Unity LevelPlay</strong> ad mediation service and the ad networks
        connected to it, and to show and measure ads these partners may receive your advertising identifier
        (IDFA), IP address and device, app and usage data from your device. Your advertising identifier is used{" "}
        <strong>only if you allow it</strong> (the iOS “tracking” permission; in the European Economic Area, the
        United Kingdom and Switzerland, also the game’s own ad-support consent). Purchases are processed by
        Apple; your payment details never reach us. Details are below.
      </p>

      <h2>Information stored on your device</h2>
      <p>
        Your game progress (coins, upgrades, unlocked looks, high score and records list, daily missions and
        achievements, your daily-reward streak), your settings (language, music and sound level, vibration),
        your answer to the ad-consent question, ad frequency counters (such as the time of the last ad and the
        number of free-coin videos today) and whether you have bought a permanent item such as “No Ads” are
        stored only on your device and are never sent to us. Deleting the app deletes this data (it may remain
        in your device’s own operating-system backups if you have backups enabled).
      </p>

      <h2>Ads and Unity LevelPlay</h2>
      <p>
        ARENA 2D is free and supported by ads. The game has optional <strong>rewarded videos</strong> (if you
        watch one, you get a reward such as a free continue, doubling the coins you just earned, free coins or a
        doubled daily reward) and full-screen <strong>interstitial ads</strong> shown occasionally between runs;
        no ads are shown during play and there are no banner ads. Ads are served by the{" "}
        <strong>Unity LevelPlay</strong> ad mediation service (LevelPlay SDK) and the ad networks (partners)
        connected to it; the list of connected networks may change over time.
      </p>
      <p>
        When an ad is requested and shown, these partners may receive the following information from within
        ARENA 2D and process it under their own privacy policies:
      </p>
      <ul>
        <li>
          <strong>Device identifiers:</strong> your advertising identifier (IDFA; only if you allow it) and
          app- or developer-specific device identifiers;
        </li>
        <li>
          <strong>Your IP address and approximate location:</strong> the general location derived from your IP
          address (the game does not request location permission, so no precise location is obtained);
        </li>
        <li>
          <strong>Device and app information:</strong> such as device model, operating-system version, language,
          app version and network type;
        </li>
        <li>
          <strong>Advertising data:</strong> which ads were shown and how you interacted with them (for example
          taps, video views or completions);
        </li>
        <li>
          <strong>App interaction:</strong> to the extent ad partners share it, information about how you use
          the app (for example launches, taps);
        </li>
        <li>
          <strong>Performance and diagnostic data:</strong> crash logs and performance data such as launch time.
        </li>
      </ul>
      <p>
        This data is used to show ads (personalized or non-personalized), measure ad performance, prevent fraud,
        run analytics, and diagnose and improve the ad software. We do not have access to this data and we send
        ad partners nothing that identifies you by name or email address; LevelPlay gives us only aggregate
        reports (such as impressions and earnings). These partners may process data outside the country you live
        in, under the safeguards described in their own policies. For how the data is used, see the{" "}
        <a href="https://unity.com/legal/privacy-policy">Unity Privacy Policy</a> and the{" "}
        <a href="https://unity.com/legal/game-player-and-app-user-privacy-policy">
          Unity Game Player and App User Privacy Policy
        </a>
        .
      </p>

      <h2>Your choices: tracking permission and ad consent</h2>
      <p>
        <strong>iOS tracking permission.</strong> To be able to share your advertising identifier (IDFA) with ad
        partners, the game asks for your permission with iOS’s “App Tracking Transparency” prompt (once, at
        first launch). If you allow it, ad partners may link your advertising identifier with data they obtain
        from other apps and websites to show personalized ads, measure advertising and prevent fraud; Apple calls
        this “tracking”. If you do not allow it, your advertising identifier is not included in ad requests; the
        game and rewarded videos work the same way, only the ads are less personalized. You can change your
        choice at any time under <em>Settings › Privacy &amp; Security › Tracking</em>.
      </p>
      <p>
        <strong>Ad-support consent (European Economic Area, United Kingdom and Switzerland).</strong> In these
        regions (and when the game cannot tell which country your device is in, to be on the safe side) the game
        asks for your permission before any ad service starts, with an “AD SUPPORT” prompt: you choose ALLOW or
        NO. If you choose NO, the ad software is never started: no ads are shown, rewarded videos are not
        offered and no data is sent to ad partners; the game remains fully playable. The legal basis for
        processing data for advertising is your consent; you can change your decision or withdraw consent at any
        time with the <em>Settings › Ad support</em> switch in the game (the switch is shown only in these
        regions). Withdrawing consent does not affect the lawfulness of processing carried out before you
        withdrew it.
      </p>

      <h2>Purchases</h2>
      <p>
        The game has optional in-app purchases (coin packs, a starter pack and “No Ads”). Purchases are
        processed by <strong>Apple</strong> (the App Store); your card or payment details never reach us. The
        store tells the game only whether a purchase was completed, so that we can give you the item (and, when
        you restore purchases, which permanent items you own); we keep no payment history on our servers. If you
        buy “No Ads”, forced (full-screen) ads stop; optional rewarded videos remain available if you choose to
        watch them.
      </p>

      <h2>Permissions</h2>
      <p>
        ARENA 2D does not request any permissions such as camera, microphone, location, contacts or photos. The
        only exception is the iOS “tracking” permission described above (for the advertising identifier; you may
        decline). Vibration only runs your device’s haptic motor locally.
      </p>

      <h2>Third parties</h2>
      <p>
        ARENA 2D contains the following third-party software: the <strong>Unity LevelPlay SDK</strong> (ads; it
        may include software components of the connected ad networks) and{" "}
        <strong>Unity In-App Purchasing</strong> (the connection to the App Store for purchases). The game is
        built with the <strong>Unity</strong> game engine. LevelPlay and the connected networks process the ad
        data described above under their own privacy policies; purchases are processed by Apple (see above). We
        have not added any other advertising network, analytics, crash-reporting or tracking software.
      </p>

      <h2>Children’s privacy</h2>
      <p>
        ARENA 2D is not directed to children under 13 (under 16 in the European Economic Area) and does not
        knowingly collect personal data from children. The game contains cartoon-style armed action (shooting
        enemies), ads and optional in-app purchases. If you are younger than that (or under the age of digital
        consent where you live), answer the tracking and consent prompts together with a parent. If you believe a
        child has provided data to us or to ad partners, write to{" "}
        <a href="mailto:support@mgumrah.com">support@mgumrah.com</a> and we will help.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example KVKK in Türkiye, GDPR in the European Economic Area and UK GDPR
        in the United Kingdom), you may have rights to access, correct, delete, object to the processing of your
        data and withdraw consent, and to complain to the data protection authority where you live. You can
        delete the information ARENA 2D keeps on your device by deleting the app; as the developer we keep no
        data about you on our servers. For data that ad partners process for advertising, you can exercise these
        rights with the tools those partners provide (see the links in the Unity Privacy Policy); you can also
        write to us with questions and we will point you to the right place.
      </p>

      <h2>Changes</h2>
      <p>
        If features such as a new advertising network, analytics or other data collection are added, or if our
        use of data changes, this policy will be updated; the updated version is published on this page and the
        “Effective date” is changed.
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
