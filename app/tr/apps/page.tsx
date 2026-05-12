import { AppsIndex } from "../../apps-content";

export const metadata = {
  title: "Uygulamalar",
  description: "Mehmet Gümrah tarafından geliştirilen uygulamalar."
};

export default function TurkishAppsPage() {
  return <AppsIndex locale="tr" />;
}
