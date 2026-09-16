import { balimIkonu } from "../ikon";

export const dynamic = "force-static";

/** iPhone'un ana ekran simgesi (apple-touch-icon). */
export function GET() {
  return balimIkonu(180);
}
