/**
 * mgumrah.com/borc — kişisel borç takibinin API'si.
 *
 * Sayfanın kendisi (app/borc) statik bir kabuk ve İÇİNDE HİÇBİR VERİ YOK; kart,
 * KMH ve işyeri borcunun her rakamı buradan, oturum çerezi doğrulandıktan sonra
 * gelir. Depo herkese açık olduğu için bu dosyada ve migrations/borc'ta yalnızca
 * yapı var; gerçek hesaplar sahibin makinesinde scripts/borc-ice-aktar.mjs ile
 * D1'e girer.
 *
 * Güvenlik duruşu (ayrıntı README'de):
 *  - Her uç oturum ister; tek istisna POST /giris. Kimlik doğrulaması olmadan
 *    tek bayt veri dönmez, yanlış/eksik çerez 401'dir.
 *  - Şifre PBKDF2-SHA256 hash'i olarak D1'de; oturum jetonunun yalnızca SHA-256'sı.
 *  - Çerez: HttpOnly, Secure, SameSite=Strict, Path=/api/borc. 30 gün kayan
 *    ömür, en çok 90 gün mutlak ömür.
 *  - Giriş denemesi: IP başına ve TOPLAM sınır (dağıtık deneme için).
 *  - Yazma isteklerinde Origin denetimi (CSRF'e ikinci kat).
 *  - Her yanıt no-store ve noindex.
 *  - Binding yoksa (D1 henüz kurulmadıysa) 503 döner; site diğer her şeyiyle çalışır.
 *
 * Bu dosya YALNIZCA kimlik doğrulamayı (giriş, oturum, throttle, CSRF) yapar. Verinin
 * okunması ve yazılması worker/borc-cekirdek.ts'te: Balım › Borçlar (worker/balim.ts) aynı
 * çekirdeği kendi oturumu ve yetki denetimiyle kullanır.
 *
 * Tipler index.ts'teki gerekçeyle satır içinde (workers-types ile DOM tipleri çakışır).
 * Oturum/şifre kalıbı worker/balim.ts'ten; canlı çalışan Balım'a dokunmamak için
 * ortak bir modüle çıkarılmadı, kopyalandı.
 */

import { SINIR, VARSAYILAN_AYARLAR } from "../app/borc/ortak";
import { BORC_TABLOLARI, GecersizGirdi, borcUcu, govdeOku, veriOku, type CekirdekAyari, type D1Veritabani } from "./borc-cekirdek";

export type BorcEnv = {
  /** Yoksa /api/borc 503 döner; wrangler.jsonc'taki d1_databases kaydı. */
  BORC_DB?: D1Veritabani;
};

/** /borc'un kendi D1'i: tablolar öneksiz, kur için tahmini bir başlangıç değeri var. */
const CEKIRDEK: CekirdekAyari = { tablolar: BORC_TABLOLARI, varsayilanKur: VARSAYILAN_AYARLAR.usdTry };

const CEREZ = "borc_oturum";
const CEREZ_YOLU = "/api/borc";
/** Kayan ömür: kullanıldıkça uzar. Parasal veri için Balım'ın 400 gününden çok daha kısa. */
const OTURUM_OMRU_SN = 30 * 24 * 60 * 60;
/** Ne kadar kullanılırsa kullanılsın bir oturum bundan uzun yaşamaz. */
const OTURUM_MUTLAK_SN = 90 * 24 * 60 * 60;
const TAZELEME_MS = 24 * 60 * 60 * 1000;
/** Workers'ın Web Crypto'su PBKDF2'de 100.000 turun üstüne çıkmıyor. */
const PBKDF2_TUR = 100_000;
const GIRIS_PENCERESI_MS = 15 * 60 * 1000;
const GIRIS_IP_SINIRI = 5;
/** Bütün IP'lerden gelen toplam hatalı deneme; dağıtık tahmini durdurur. */
const GIRIS_TOPLAM_SINIRI = 25;

const simdi = () => new Date().toISOString();

function json(govde: unknown, durum = 200, basliklar: Record<string, string> = {}) {
  return new Response(JSON.stringify(govde), {
    status: durum,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      ...basliklar
    }
  });
}

const hata = (durum: number, mesaj: string, basliklar?: Record<string, string>) =>
  json({ ok: false, hata: mesaj }, durum, basliklar);

/* ── Şifre ve oturum ───────────────────────────────────────────────────── */

function base64(bayt: Uint8Array) {
  let ikili = "";
  for (const b of bayt) ikili += String.fromCharCode(b);
  return btoa(ikili);
}

const base64Coz = (metin: string) => Uint8Array.from(atob(metin), (c) => c.charCodeAt(0));

async function sha256Hex(metin: string) {
  const ozet = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(metin));
  return [...new Uint8Array(ozet)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function pbkdf2(sifre: string, tuz: Uint8Array<ArrayBuffer>, tur: number) {
  const anahtar = await crypto.subtle.importKey("raw", new TextEncoder().encode(sifre), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: tuz, iterations: tur, hash: "SHA-256" }, anahtar, 256));
}

/** Uzunluktan bağımsız süren karşılaştırma. */
function esit(a: string, b: string) {
  if (a.length !== b.length) return false;
  let fark = 0;
  for (let i = 0; i < a.length; i += 1) fark |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return fark === 0;
}

/** Biçim scripts/borc-kullanici.mjs ile aynı: "pbkdf2-sha256$tur$tuz$hash". */
async function sifreDogrula(sifre: string, kayitli: string) {
  const [yontem, turMetni, tuz, hash] = kayitli.split("$");
  const tur = Number(turMetni);
  if (yontem !== "pbkdf2-sha256" || !Number.isInteger(tur) || tur < 1 || tur > PBKDF2_TUR || !tuz || !hash) return false;
  return esit(base64(await pbkdf2(sifre, base64Coz(tuz), tur)), hash);
}

/**
 * Kullanıcı yokken de aynı işi yapmak için sahte kayıt: "bu kullanıcı adı yok"
 * ile "şifre yanlış" arasındaki süre farkı kullanıcı adını ele vermesin.
 */
const SAHTE_KAYIT = `pbkdf2-sha256$${PBKDF2_TUR}$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`;

function cerezOku(request: Request) {
  for (const parca of (request.headers.get("cookie") ?? "").split(";")) {
    const [ad, ...deger] = parca.trim().split("=");
    if (ad === CEREZ) return deger.join("=");
  }
  return null;
}

/** `wrangler dev` http://localhost'ta çalışır; Secure çerez orada (Safari'de) saklanmaz. Canlıda hep https. */
const yerelMi = (url: URL) => url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");

const oturumCerezi = (jeton: string, url: URL) =>
  `${CEREZ}=${jeton}; Path=${CEREZ_YOLU}; Max-Age=${OTURUM_OMRU_SN}; HttpOnly;${yerelMi(url) ? "" : " Secure;"} SameSite=Strict`;

const cerezSil = (url: URL) =>
  `${CEREZ}=; Path=${CEREZ_YOLU}; Max-Age=0; HttpOnly;${yerelMi(url) ? "" : " Secure;"} SameSite=Strict`;

type Oturum = { kullaniciAdi: string; anahtar: string; jeton: string; tazele: boolean };

async function oturumBul(request: Request, db: D1Veritabani): Promise<Oturum | null> {
  const jeton = cerezOku(request);
  if (!jeton || jeton.length > 128) return null;

  const anahtar = await sha256Hex(jeton);
  const satir = await db
    .prepare(
      `SELECT k.kullanici_adi, o.olusturuldu, o.son_gorulme
         FROM oturumlar o JOIN kullanicilar k ON k.id = o.kullanici_id
        WHERE o.anahtar = ?`
    )
    .bind(anahtar)
    .first<{ kullanici_adi: string; olusturuldu: string; son_gorulme: string }>();
  if (!satir) return null;

  const simdiMs = Date.now();
  const bos = simdiMs - Date.parse(satir.son_gorulme);
  const yas = simdiMs - Date.parse(satir.olusturuldu);
  if (bos > OTURUM_OMRU_SN * 1000 || yas > OTURUM_MUTLAK_SN * 1000) {
    await db.prepare("DELETE FROM oturumlar WHERE anahtar = ?").bind(anahtar).run();
    return null;
  }

  const tazele = bos > TAZELEME_MS;
  if (tazele) await db.prepare("UPDATE oturumlar SET son_gorulme = ? WHERE anahtar = ?").bind(simdi(), anahtar).run();
  return { kullaniciAdi: satir.kullanici_adi, anahtar, jeton, tazele };
}

async function girisYap(request: Request, db: D1Veritabani, url: URL) {
  const ip = request.headers.get("cf-connecting-ip") ?? "yerel";
  const pencere = new Date(Date.now() - GIRIS_PENCERESI_MS).toISOString();

  const sayac = await db
    .prepare("SELECT COUNT(*) AS toplam, SUM(CASE WHEN ip = ? THEN 1 ELSE 0 END) AS bu_ip FROM giris_denemeleri WHERE zaman > ?")
    .bind(ip, pencere)
    .first<{ toplam: number; bu_ip: number | null }>();
  if ((sayac?.bu_ip ?? 0) >= GIRIS_IP_SINIRI || (sayac?.toplam ?? 0) >= GIRIS_TOPLAM_SINIRI) {
    return hata(429, "Çok fazla hatalı deneme oldu. 15 dakika sonra tekrar deneyin.");
  }

  const govde = await govdeOku(request);
  const kullaniciAdi = typeof govde.kullaniciAdi === "string" ? govde.kullaniciAdi.trim().toLowerCase().slice(0, 64) : "";
  const sifre = typeof govde.sifre === "string" ? govde.sifre : "";
  if (!kullaniciAdi || !sifre) return hata(400, "Kullanıcı adı ve şifreyi yazın.");

  const kisi = await db
    .prepare("SELECT id, sifre FROM kullanicilar WHERE kullanici_adi = ?")
    .bind(kullaniciAdi)
    .first<{ id: number; sifre: string }>();

  const dogru = sifre.length <= SINIR.sifreEnFazla && (await sifreDogrula(sifre, kisi?.sifre ?? SAHTE_KAYIT));
  if (!kisi || !dogru) {
    await db.prepare("INSERT INTO giris_denemeleri (ip, zaman) VALUES (?, ?)").bind(ip, simdi()).run();
    return hata(401, "Kullanıcı adı ya da şifre yanlış.");
  }

  const jeton = base64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const zaman = simdi();
  await db.batch([
    db
      .prepare("INSERT INTO oturumlar (anahtar, kullanici_id, olusturuldu, son_gorulme, cihaz) VALUES (?, ?, ?, ?, ?)")
      .bind(await sha256Hex(jeton), kisi.id, zaman, zaman, (request.headers.get("user-agent") ?? "").slice(0, 200)),
    db.prepare("DELETE FROM giris_denemeleri WHERE ip = ? OR zaman < ?").bind(ip, pencere),
    db.prepare("DELETE FROM oturumlar WHERE olusturuldu < ?").bind(new Date(Date.now() - OTURUM_MUTLAK_SN * 1000).toISOString())
  ]);

  return json({ ok: true }, 200, { "set-cookie": oturumCerezi(jeton, url) });
}

/* ── Giriş noktası ─────────────────────────────────────────────────────── */

/**
 * /api/borc/<kaynak>[/<id>]. `path` index.ts'te sondaki eğik çizgisi atılmış hâliyle gelir.
 */
export async function borcApi(request: Request, env: BorcEnv, path: string): Promise<Response> {
  const db = env.BORC_DB;
  if (!db) return hata(503, "Borç takibi bu ortamda kurulu değil.");

  const url = new URL(request.url);
  const yontem = request.method.toUpperCase();
  const [, , , kaynak = "", kayitMetni] = path.split("/"); // ["", "api", "borc", kaynak, id]
  const kayitId = kayitMetni !== undefined && /^\d{1,12}$/.test(kayitMetni) ? Number(kayitMetni) : null;
  if (kayitMetni !== undefined && kayitId === null) return hata(404, "Bulunamadı.");

  try {
    // CSRF'in ikinci katı (SameSite=Strict zaten birinci): tarayıcı Origin gönderiyorsa bizim olmalı.
    if (yontem !== "GET" && yontem !== "HEAD") {
      const origin = request.headers.get("origin");
      if (origin !== null && origin !== url.origin) return hata(403, "İstek reddedildi.");
    }

    if (kaynak === "giris" && yontem === "POST") return await girisYap(request, db, url);

    const oturum = await oturumBul(request, db);
    if (!oturum) return hata(401, "Oturum kapalı. Giriş yapın.", { "set-cookie": cerezSil(url) });

    const yanit = async (): Promise<Response> => {
      if (kaynak === "veri" && yontem === "GET") {
        return json({ ok: true, veri: await veriOku(db, CEKIRDEK), kullanici: { kullaniciAdi: oturum.kullaniciAdi } });
      }
      if (kaynak === "cikis" && yontem === "POST") {
        await db.prepare("DELETE FROM oturumlar WHERE anahtar = ?").bind(oturum.anahtar).run();
        return json({ ok: true }, 200, { "set-cookie": cerezSil(url) });
      }

      // Yazma uçları ortak çekirdekte (Balım › Borçlar da aynısını kullanır).
      const sonuc = await borcUcu(db, CEKIRDEK, request, kaynak, kayitId);
      return "veri" in sonuc ? json({ ok: true, veri: sonuc.veri }) : hata(sonuc.durum, sonuc.mesaj);
    };

    const sonuc = await yanit();
    if (oturum.tazele) sonuc.headers.append("set-cookie", oturumCerezi(oturum.jeton, url));
    return sonuc;
  } catch (e) {
    if (e instanceof GecersizGirdi) return hata(400, e.message);
    // Ayrıntıyı (SQL, rakam) kullanıcıya da loglara da yazma: yalnızca hata türü.
    console.error("borc: beklenmeyen hata", e instanceof Error ? e.name : "bilinmiyor");
    return hata(500, "Bir sorun oluştu. Tekrar deneyin.");
  }
}
