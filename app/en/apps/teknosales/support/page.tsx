import { TeknoSalesSupport } from "../../../../apps-content";
import { buildMetadata } from "../../../../site-metadata";

export const metadata = buildMetadata({
  locale: "en",
  path: "/apps/teknosales/support",
  title: "Tekno Sales Support",
  description: "Support information for the Tekno Sales app."
});

export default function EnglishTeknoSalesSupportPage() {
  return <TeknoSalesSupport locale="en" />;
}
