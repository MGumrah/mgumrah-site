/**
 * Balım'ın takvimi İstanbul'un takvimi: "bugün", "bu ay", "kaç gün kaldı"
 * hepsi telefonun saat dilimine değil Europe/Istanbul'a göre hesaplanır —
 * yurt dışındayken açılan sayfa da kiranın gününü aynı gösterir.
 */

const GUN_BICIMI = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

/** Bir anın İstanbul'daki takvim günü: "2026-09-16". */
export function istanbulGunu(an: Date | string = new Date()) {
  const parca = Object.fromEntries(
    GUN_BICIMI.formatToParts(typeof an === "string" ? new Date(an) : an).map((p) => [p.type, p.value])
  );
  return `${parca.year}-${parca.month}-${parca.day}`;
}

export const bugun = () => istanbulGunu();

/** ("2026-11", 2) → "2027-01" */
export function ayEkle(ay: string, adet: number) {
  const [yil, no] = ay.split("-").map(Number);
  const toplam = yil * 12 + (no - 1) + adet;
  return `${Math.floor(toplam / 12)}-${String((toplam % 12) + 1).padStart(2, "0")}`;
}

/** ("2026-09-16", 45) → "2026-10-31" */
export function gunEkle(gun: string, adet: number) {
  const [y, a, g] = gun.split("-").map(Number);
  return new Date(Date.UTC(y, a - 1, g + adet)).toISOString().slice(0, 10);
}

/** Ayın gün sayısına sığdırılmış ödeme günü: ("2027-02", 31) → "2027-02-28". */
export function odemeTarihi(ay: string, gun: number) {
  const [yil, no] = ay.split("-").map(Number);
  const sonGun = new Date(Date.UTC(yil, no, 0)).getUTCDate();
  return `${ay}-${String(Math.min(gun, sonGun)).padStart(2, "0")}`;
}

/** `a` gününden `b` gününe kaç gün var; `b` geçmişteyse eksi. */
export function gunFarki(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export function kalanGunYazisi(fark: number) {
  if (fark === 0) return "bugün";
  if (fark === 1) return "yarın";
  if (fark === -1) return "dün";
  return fark > 0 ? `${fark} gün kaldı` : `${-fark} gün geçti`;
}

const KISA_AYLAR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

/** "az önce", "12 dk önce", "dün", "3 gün önce", "12 Eyl" */
export function goreceZaman(iso: string) {
  const saniye = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (saniye < 60) return "az önce";
  if (saniye < 3600) return `${Math.floor(saniye / 60)} dk önce`;

  const gun = istanbulGunu(iso);
  const fark = gunFarki(gun, bugun());
  if (fark === 0) return `${Math.floor(saniye / 3600)} sa önce`;
  if (fark === 1) return "dün";
  if (fark < 7) return `${fark} gün önce`;
  const [, ay, g] = gun.split("-").map(Number);
  return `${g} ${KISA_AYLAR[ay - 1]}`;
}
