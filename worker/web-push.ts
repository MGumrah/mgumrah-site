/**
 * Web Push: RFC 8291 (aes128gcm içerik şifreleme) ve RFC 8292 (VAPID).
 *
 * sevcanhome-site/src/lib/push.ts'in bu Worker'a taşınmış hâli; orada canlıda
 * gerçek telefonlara bildirim gönderiyor. `web-push` paketi Node'un
 * createECDH'ine dayandığı için Workers'ta güvenilir değil: her adım burada
 * Web Crypto ile.
 *
 * Tek bir bildirimin yolu: tarayıcının açık anahtarıyla (p256dh) tek
 * kullanımlık bir ECDH çifti üzerinden ortak sır türetilir, `auth` sırrıyla
 * HKDF'ten geçip AES-128-GCM anahtarı ve nonce olur, gövde şifrelenir, VAPID
 * JWT'si ES256 ile imzalanır ve şifreli gövde push servisinin adresine gider.
 * Servis (Google, Apple, Mozilla) içeriği göremez, yalnızca cihaza taşır.
 */

const kodla = new TextEncoder();

export function b64urlCoz(deger: string): Uint8Array<ArrayBuffer> {
  const b64 = deger.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (deger.length % 4)) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export function b64url(bayt: Uint8Array): string {
  let ikili = "";
  for (const b of bayt) ikili += String.fromCharCode(b);
  return btoa(ikili).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function birlestir(...parcalar: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const sonuc = new Uint8Array(parcalar.reduce((n, p) => n + p.length, 0));
  let konum = 0;
  for (const p of parcalar) {
    sonuc.set(p, konum);
    konum += p.length;
  }
  return sonuc;
}

async function hmac(anahtar: BufferSource, veri: BufferSource): Promise<Uint8Array<ArrayBuffer>> {
  const k = await crypto.subtle.importKey("raw", anahtar, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, veri));
}

/** HKDF (RFC 5869), tek blok: bu protokolde türetilen en uzun anahtar 32 bayt. */
async function hkdf(tuz: BufferSource, ikm: BufferSource, bilgi: Uint8Array, uzunluk: number) {
  const prk = await hmac(tuz, ikm);
  return (await hmac(prk, birlestir(bilgi, new Uint8Array([1])))).slice(0, uzunluk);
}

/** Tek kayıt gönderiliyor; servislerin ortak üst sınırı 4096 bayt. */
const KAYIT_BOYUTU = 4096;
/** 16 bayt GCM etiketi + 1 bayt kayıt sonu ayırıcısı. */
const EN_BUYUK_GOVDE = KAYIT_BOYUTU - 17;

export async function sifrele(govde: Uint8Array, p256dh: string, authSirri: string): Promise<Uint8Array<ArrayBuffer>> {
  const tarayiciAnahtari = b64urlCoz(p256dh);
  const auth = b64urlCoz(authSirri);

  // Her gönderimde yeni çift: sabit çift aynı aboneye giden iki mesajda aynı
  // anahtar+nonce ikilisini üretir, AES-GCM'in tek yasağı da budur.
  const sunucu = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits"
  ])) as CryptoKeyPair;
  const sunucuAnahtari = new Uint8Array(await crypto.subtle.exportKey("raw", sunucu.publicKey));

  const karsiAnahtar = await crypto.subtle.importKey("raw", tarayiciAnahtari, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ortakSir = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: karsiAnahtar }, sunucu.privateKey, 256)
  );

  // RFC 8291 §3.4: NUL ayırıcı ve anahtar sırası (önce tarayıcı, sonra
  // sunucu) protokolün parçası. Yer değişirse servis yine 201 döner ama
  // tarayıcı çözemez ve bildirim hiçbir hata vermeden düşer.
  const ikm = await hkdf(auth, ortakSir, birlestir(kodla.encode("WebPush: info\0"), tarayiciAnahtari, sunucuAnahtari), 32);

  const tuz = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(tuz, ikm, kodla.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(tuz, ikm, kodla.encode("Content-Encoding: nonce\0"), 12);

  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  // 0x02: "son kayıt" (RFC 8188 §2). 0x01 yazılsa tarayıcı devamını beklerdi.
  const sifreli = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, birlestir(govde, new Uint8Array([2])))
  );

  // Başlık: tuz(16) | kayıt boyutu(4, big-endian) | idlen(1) | sunucu açık anahtarı
  const baslik = new Uint8Array(16 + 4 + 1 + sunucuAnahtari.length);
  baslik.set(tuz, 0);
  new DataView(baslik.buffer).setUint32(16, KAYIT_BOYUTU);
  baslik[20] = sunucuAnahtari.length;
  baslik.set(sunucuAnahtari, 21);

  return birlestir(baslik, sifreli);
}

export type VapidAnahtarlari = {
  /** Ham açık anahtar (0x04 | x | y), base64url. Tarayıcı abone olurken bunu ister. */
  acik: string;
  /** Özel anahtarın `d` değeri, base64url. */
  ozel: string;
  /** RFC 8292: servisin sorun olduğunda yazacağı adres. */
  konu: string;
};

/** JWT servise (origin'e) bağlı ve 12 saat geçerli; isolate yaşadıkça yeniden imzalanmaz. */
const jwtOnbellegi = new Map<string, { jeton: string; bitis: number }>();
const JWT_OMRU_SN = 12 * 60 * 60;

async function vapidBasligi(endpoint: string, anahtarlar: VapidAnahtarlari) {
  const aud = new URL(endpoint).origin;
  const simdi = Math.floor(Date.now() / 1000);
  const onbellek = jwtOnbellegi.get(aud);
  if (onbellek && onbellek.bitis - simdi > 30 * 60) return `vapid t=${onbellek.jeton}, k=${anahtarlar.acik}`;

  const bitis = simdi + JWT_OMRU_SN;
  const imzalanacak =
    b64url(kodla.encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))) +
    "." +
    b64url(kodla.encode(JSON.stringify({ aud, exp: bitis, sub: anahtarlar.konu })));

  // Web Crypto özel anahtarı ancak x/y'siyle birlikte JWK olarak alıyor; ikisi
  // de açık anahtarın içinde: 0x04 | x(32) | y(32).
  const acik = b64urlCoz(anahtarlar.acik);
  const anahtar = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x: b64url(acik.slice(1, 33)), y: b64url(acik.slice(33, 65)), d: anahtarlar.ozel, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  // Web Crypto imzayı ham r||s olarak verir; ES256'nın istediği tam bu. DER'e
  // çevrilirse servis 401 döner.
  const imza = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, anahtar, kodla.encode(imzalanacak)));

  const jeton = `${imzalanacak}.${b64url(imza)}`;
  jwtOnbellegi.set(aud, { jeton, bitis });
  return `vapid t=${jeton}, k=${anahtarlar.acik}`;
}

export type PushHedefi = { endpoint: string; p256dh: string; auth: string };

export type PushSonucu = { ok: true } | { ok: false; kalici: boolean; durum: number; hata: string };

/** Cihaz kapalıysa servis mesajı bu kadar saklar; bir günlük bildirim bayattır. */
const TTL_SN = 24 * 60 * 60;

/**
 * Tek bir aboneliğe gönderir. HİÇ THROW ETMEZ: toplu gönderimde bir cihazın
 * bozuk aboneliği ötekileri durdurmamalı. `kalici` (404/410) ise abonelik
 * tarayıcıda iptal edilmiştir; satır silinmeli.
 */
export async function pushGonder(
  hedef: PushHedefi,
  yuk: unknown,
  anahtarlar: VapidAnahtarlari,
  aciliyet: "normal" | "high" = "normal"
): Promise<PushSonucu> {
  try {
    const govde = kodla.encode(JSON.stringify(yuk));
    if (govde.length > EN_BUYUK_GOVDE) return { ok: false, kalici: false, durum: 0, hata: "gövde çok büyük" };

    const yanit = await fetch(hedef.endpoint, {
      method: "POST",
      headers: {
        Authorization: await vapidBasligi(hedef.endpoint, anahtarlar),
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: String(TTL_SN),
        Urgency: aciliyet
      },
      body: await sifrele(govde, hedef.p256dh, hedef.auth)
    });
    if (yanit.ok) return { ok: true };
    return {
      ok: false,
      kalici: yanit.status === 404 || yanit.status === 410,
      durum: yanit.status,
      hata: (await yanit.text().catch(() => "")).slice(0, 200)
    };
  } catch (e) {
    return { ok: false, kalici: false, durum: 0, hata: e instanceof Error ? e.message : "bilinmeyen hata" };
  }
}
