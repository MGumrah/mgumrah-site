import IlanSayfasi, { ilanMetadata } from "../ilan-sayfasi";
import { ilan } from "./ilan";

export const metadata = ilanMetadata(ilan);

/** mgumrah.com/ilan/note */
export default function NoteIlanPage() {
  return <IlanSayfasi ilan={ilan} />;
}
