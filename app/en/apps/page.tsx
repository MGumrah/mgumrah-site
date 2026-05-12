import { AppsIndex } from "../../apps-content";

export const metadata = {
  title: "Apps",
  description: "Mobile apps maintained by Mehmet Gümrah."
};

export default function EnglishAppsPage() {
  return <AppsIndex locale="en" />;
}
