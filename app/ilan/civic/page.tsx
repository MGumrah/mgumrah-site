import IlanSayfasi, { ilanMetadata } from "../ilan-sayfasi";
import { ilan } from "./ilan";

export const metadata = ilanMetadata(ilan);

/** mgumrah.com/ilan/civic */
export default function CivicIlanPage() {
  return <IlanSayfasi ilan={ilan} />;
}
