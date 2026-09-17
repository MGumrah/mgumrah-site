#!/usr/bin/env node
/**
 * Balım bildirimleri için VAPID anahtar çifti üretir ve Worker'a nasıl
 * girileceğini yazar. Anahtarlar hiçbir dosyaya kaydedilmez.
 *
 *   node scripts/balim-vapid.mjs
 *
 * BİR KEZ çalıştırılır. Çift değişirse telefonların mevcut abonelikleri eski
 * açık anahtara bağlı kaldığı için bütün bildirimler sessizce durur; herkesin
 * bildirimleri kapatıp yeniden açması gerekir.
 */

import { generateKeyPairSync } from "node:crypto";

const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const jwk = privateKey.export({ format: "jwk" });

const b64url = (buf) => Buffer.from(buf).toString("base64url");
// Tarayıcının istediği ham açık anahtar: 0x04 | x | y
const acik = b64url(Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, "base64url"), Buffer.from(jwk.y, "base64url")]));

console.log(`BALIM_VAPID_ACIK=${acik}`);
console.log(`BALIM_VAPID_OZEL=${jwk.d}`);
console.log(`
Canlıya girmek için (değeri sorulunca yukarıdakini yapıştırın):
  npx wrangler secret put BALIM_VAPID_ACIK
  npx wrangler secret put BALIM_VAPID_OZEL

Yerelde denemek için iki satırı .dev.vars dosyasına ekleyin.`);
