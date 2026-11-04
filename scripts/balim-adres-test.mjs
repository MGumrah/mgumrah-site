// Balım adreslerinin tek yerde (app/balim/adres.ts) durduğunu ve içe aktarılamayan statik dosyaların
// (manifest, service worker) onunla aynı kaldığını denetler. Panel başka bir alan adına/yola taşınırken
// "bir yerde eski yol kaldı" hatasını burada yakalarız.
//   node scripts/balim-adres-test.mjs
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const kok = join(dirname(fileURLToPath(import.meta.url)), "..");
const oku = (yol) => readFileSync(join(kok, yol), "utf8");

const adres = oku("app/balim/adres.ts");
const sabit = (ad) => {
  const e = adres.match(new RegExp(`export const ${ad} = "([^"]+)";`));
  assert.ok(e, `${ad} adres.ts içinde düz metin olarak tanımlı olmalı`);
  return e[1];
};
const PANEL_YOLU = sabit("PANEL_YOLU");
const API_YOLU = sabit("API_YOLU");

test("yol sabitlerinin biçimi", () => {
  assert.match(PANEL_YOLU, /^\/[a-z0-9-]+\/$/, "panel yolu /ad/ biçiminde (sonda eğik çizgi)");
  assert.match(API_YOLU, /^\/api\/[a-z0-9-]+$/, "api yolu /api/ad biçiminde (sonda eğik çizgi yok)");
});

test("manifest panel yoluyla aynı", () => {
  const m = JSON.parse(oku("public/balim/manifest.webmanifest"));
  for (const alan of ["id", "start_url", "scope"]) assert.equal(m[alan], PANEL_YOLU, `manifest.${alan}`);
  for (const ikon of m.icons) assert.ok(ikon.src.startsWith(PANEL_YOLU), `ikon ${ikon.src}`);
});

test("service worker panel ve api yoluyla aynı", () => {
  const sw = oku("public/balim/sw.js");
  assert.ok(sw.includes(`startsWith("${PANEL_YOLU}")`), "bildirim adresi öneki");
  assert.ok(sw.includes(`ham : "${PANEL_YOLU}"`), "varsayılan bildirim adresi");
  assert.ok(sw.includes(`"${API_YOLU}/bildirim"`), "abonelik yenileme ucu");
  for (const m of sw.matchAll(/"(\/[^"]*\.png)"/g)) assert.ok(m[1].startsWith(PANEL_YOLU), `sw ikonu ${m[1]}`);
  assert.ok(!sw.includes("/api/") || [...sw.matchAll(/"(\/api\/[^"]*)"/g)].every((m) => m[1].startsWith(API_YOLU)), "sw yalnız kendi api yoluna gider");
});

test("kodda çıplak /balim ya da /api/balim metni kalmadı (adres.ts hariç)", () => {
  const dosyalar = [
    ...readdirSync(join(kok, "app/balim")).filter((d) => /\.(ts|tsx)$/.test(d)).map((d) => `app/balim/${d}`),
    "worker/balim.ts"
  ].filter((d) => d !== "app/balim/adres.ts");
  const kacaklar = [];
  for (const d of dosyalar) {
    oku(d)
      .split("\n")
      .forEach((satir, i) => {
        // Yorum satırları ve sonradaki // yorumları serbest; yalnızca tırnaklı metinlere bakılır.
        if (/^\s*(\*|\/\/|\/\*)/.test(satir)) return;
        const kod = satir.replace(/\s\/\/.*$/, "");
        if (/["'`]\/(api\/)?balim[/"'`#]/.test(kod)) kacaklar.push(`${d}:${i + 1}: ${satir.trim()}`);
      });
  }
  assert.deepEqual(kacaklar, [], "bu satırlar adres.ts sabitlerini kullanmalı");
});
