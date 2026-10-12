import { BalimDetail } from "../../../sites-content";
import { buildMetadata } from "../../../site-metadata";

export const metadata = buildMetadata({
  locale: "tr",
  path: "/sites/balim",
  title: "Balım Kafe",
  description: "Balım Kafe — Denizli'deki bir kafe için geliştirdiğim tanıtım sitesi ve QR menü."
});

export default function TurkishBalimPage() {
  return <BalimDetail locale="tr" />;
}
