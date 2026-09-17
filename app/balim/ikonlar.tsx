const YOLLAR = {
  ozet: "M3 10.5 12 3l9 7.5M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9",
  alinacaklar: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0",
  yapilacaklar: "m3 7 2 2 4-4M3 17l2 2 4-4M13 6h8M13 12h8M13 18h8",
  giderler:
    "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",
  gorseller:
    "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM21 15l-3.1-3.1a2 2 0 0 0-2.8 0L6 21",
  arti: "M12 5v14M5 12h14",
  eksi: "M5 12h14",
  kalem: "M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z",
  cop: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  kapat: "M18 6 6 18M6 6l12 12",
  sol: "m15 18-6-6 6-6",
  sag: "m9 18 6-6-6-6",
  asagi: "m6 9 6 6 6-6",
  onay: "M20 6 9 17l-5-5",
  takvim: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  cikis: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  yukle: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  indir: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  uyari: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01",
  saat: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  goz: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  gozKapali:
    "M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.2 3.2M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6M14.1 14.1a3 3 0 1 1-4.2-4.2M2 2l20 20",
  ara: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  paylas: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  menu: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  anahtar: "M15.5 7.5 19 4M21 2l-2 2 3 3-3.5 3.5-3-3M11.4 11.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8Z",
  kahve: "M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM6 2v2M10 2v2M14 2v2",
  yenile: "M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5",
  telefon: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM12 18h.01",
  sohbet: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
  gonder: "M22 2 11 13M22 2l-7 20-4-9-9-4Z",
  zil: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
  zilKapali: "M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7M10.3 21a1.94 1.94 0 0 0 3.4 0M2 2l20 20",
  ekranaEkle: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM12 8v8M8 12h8"
} as const;

export type IkonAdi = keyof typeof YOLLAR;

export function Ikon({ ad, className }: { ad: IkonAdi; className?: string }) {
  return (
    <svg
      className={className ? `b-ikon ${className}` : "b-ikon"}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={YOLLAR[ad]} />
    </svg>
  );
}

/** Bal peteğinin bir gözü ve içinde bir damla. ikon.tsx aynı çizimi PNG'ye basar. */
export function BalimLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path d={LOGO_PETEK} fill="var(--b-bal)" stroke="var(--b-bal)" strokeWidth="3" strokeLinejoin="round" />
      <path d={LOGO_DAMLA} fill="var(--b-logo-damla)" />
    </svg>
  );
}

export const LOGO_PETEK = "M16 3.6 26.7 9.8v12.4L16 28.4 5.3 22.2V9.8Z";
export const LOGO_DAMLA = "M16 9.6c-2.7 3.4-4.1 5.8-4.1 7.6a4.1 4.1 0 0 0 8.2 0c0-1.8-1.4-4.2-4.1-7.6Z";
