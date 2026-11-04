-- Balım › Borçlar — kart / KMH / kredi / tedarikçi borçlarının takibi.
--
-- BU DOSYA CANLI VERİTABANINA UYGULANMADAN ÖNCE kullanıcıya sorulur:
--   npx wrangler d1 migrations apply balim --remote
-- Kod bu şemadan önce deploy edilirse panel bozulmaz: Worker, tablo/sütun yoksa
-- borç bölümünü "yetkisiz" sayar (worker/balim.ts → borcYetkisiVar). Yine de sıra:
-- önce migration, sonra deploy.
--
-- Bu dosyada GERÇEK VERİ YOK ve olmamalı (depo herkese açık). Tablolar boş açılır;
-- işletme kendi hesaplarını ve rakamlarını panelden girer.
--
-- Şema /borc'unkiyle (migrations/borc) birebir aynı, tablo adları `borc_` önekli:
-- Balım'ın kendi `ayarlar` tablosu zaten var. İkisi de worker/borc-cekirdek.ts'in
-- aynı SQL'ini kullanır; bir sütun değişirse iki yerde birden değişmelidir.
--
-- Tutarlar kuruş (USD için sent) cinsinden tamsayı. tarih ve son_odeme İstanbul
-- takvimindeki gün (YYYY-MM-DD); ay ise YYYY-MM. olusturuldu UTC ISO-8601.

-- ── Yetki ────────────────────────────────────────────────────────────────
-- Panelde şu an her kullanıcı aynı veriyi görüyor; kart/KMH borcu ise hassas.
-- Bu yüzden borç bölümü varsayılan olarak KAPALI: yalnızca bu alanı 1 olan
-- kişiler hem sekmeyi görür hem API'den veri alır (sunucuda her istekte
-- denetlenir). Yetki panelden verilemez; yalnızca komut satırından:
--   node scripts/balim-kullanici.mjs <kullanici> --borc
ALTER TABLE kullanicilar ADD COLUMN borc_yetkisi INTEGER NOT NULL DEFAULT 0 CHECK (borc_yetkisi IN (0, 1));

-- kart: kredi kartı · kmh: kredili mevduat (ek hesap) · diger: limiti/faizi olmayan
-- borçlar (tedarikçi, ortak, kişi). 'diger' kart borcundan AYRI listelenir ama
-- "diğer dahil" toplamına girer.
CREATE TABLE borc_hesaplar (
  id INTEGER PRIMARY KEY,
  ad TEXT NOT NULL UNIQUE,
  tur TEXT NOT NULL CHECK (tur IN ('kart', 'kmh', 'diger')),
  limit_kurus INTEGER NOT NULL DEFAULT 0,
  -- Hesap kesim günü (1-31); yalnızca kartlarda.
  kesim_gunu INTEGER CHECK (kesim_gunu IS NULL OR kesim_gunu BETWEEN 1 AND 31),
  -- Son ödeme günü (yaklaşık; hafta sonuna göre kayar). Kesin tarih durum kaydındadır.
  son_odeme_gunu INTEGER CHECK (son_odeme_gunu IS NULL OR son_odeme_gunu BETWEEN 1 AND 31),
  -- Asgari ödeme / ekstre oranı, baz puan: %40 = 4000, %20 = 2000.
  asgari_orani_bp INTEGER CHECK (asgari_orani_bp IS NULL OR asgari_orani_bp BETWEEN 0 AND 10000),
  sira INTEGER NOT NULL DEFAULT 0,
  aktif INTEGER NOT NULL DEFAULT 1
);

-- Bir hesabın bir günkü ölçümü. Hesap başına en yeni tarih "güncel durum"dur;
-- eskileri borç geçmişidir. Aynı gün ikinci kayıt öncekinin üstüne yazar.
CREATE TABLE borc_durum_kayitlari (
  id INTEGER PRIMARY KEY,
  hesap_id INTEGER NOT NULL REFERENCES borc_hesaplar (id) ON DELETE CASCADE,
  tarih TEXT NOT NULL,
  ay TEXT NOT NULL,
  -- Kartta: limit − kullanılabilir limit. KMH'de: hesabın eksi bakiyesi (artıdaysa 0).
  borc_kurus INTEGER NOT NULL,
  limit_kurus INTEGER,
  -- Son kesilen ekstrenin borcu ve bankanın yazdığı asgari; yoksa NULL.
  ekstre_kurus INTEGER,
  asgari_kurus INTEGER,
  son_odeme TEXT,
  aciklama TEXT NOT NULL DEFAULT '',
  olusturuldu TEXT NOT NULL,
  UNIQUE (hesap_id, tarih)
);
CREATE INDEX borc_durum_kayitlari_ay ON borc_durum_kayitlari (ay);

-- Harcama. tutar pozitif = harcama, negatif = iade. taksit 1 = tek çekim.
-- ekstre_ay: harcamanın düştüğü ekstrenin ayı (kesim gününden sonraki harcama bir
-- sonraki ayın ekstresine düşer); sunucu hesaplar, elle girilmişse korunur.
-- kaynak_anahtar: dosyadan içe aktarmanın yinelenmesini önler; elle girilenlerde NULL.
CREATE TABLE borc_islemler (
  id INTEGER PRIMARY KEY,
  tarih TEXT NOT NULL,
  hesap_id INTEGER NOT NULL REFERENCES borc_hesaplar (id) ON DELETE CASCADE,
  aciklama TEXT NOT NULL,
  tutar_kurus INTEGER NOT NULL,
  taksit INTEGER NOT NULL DEFAULT 1 CHECK (taksit BETWEEN 1 AND 60),
  ekstre_ay TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT '',
  aciklama_not TEXT NOT NULL DEFAULT '',
  olusturuldu TEXT NOT NULL,
  kaynak_anahtar TEXT
);
CREATE INDEX borc_islemler_tarih ON borc_islemler (tarih);
CREATE INDEX borc_islemler_hesap ON borc_islemler (hesap_id);
CREATE UNIQUE INDEX borc_islemler_kaynak ON borc_islemler (kaynak_anahtar);

-- Her ay tekrarlayan gelir (kira, sözleşme, maaş...). Takvim bundan aylık satır türetir.
CREATE TABLE borc_duzenli_gelirler (
  id INTEGER PRIMARY KEY,
  ad TEXT NOT NULL,
  -- para biriminin 1/100'ü: TRY için kuruş, USD için sent.
  tutar_kurus INTEGER NOT NULL CHECK (tutar_kurus > 0),
  para_birimi TEXT NOT NULL DEFAULT 'TRY' CHECK (para_birimi IN ('TRY', 'USD')),
  -- Ayın kaçında yatar; ayda o gün yoksa (31) ayın son günü.
  gun INTEGER NOT NULL CHECK (gun BETWEEN 1 AND 31),
  -- 0: tarih kesin değil.
  kesin INTEGER NOT NULL DEFAULT 0,
  -- İlk beklenen ay (YYYY-MM). Öncesi için takvime satır üretilmez.
  baslangic_ay TEXT NOT NULL,
  aktif INTEGER NOT NULL DEFAULT 1,
  aciklama_not TEXT NOT NULL DEFAULT '',
  olusturuldu TEXT NOT NULL
);
CREATE UNIQUE INDEX borc_duzenli_gelirler_ad ON borc_duzenli_gelirler (ad);

-- Tek tek gerçekleşen / geciken gelir kayıtları. alindi_tarihi boşken beklenen_tarih
-- geçmişse "gecikmiş alacak" sayılır (sayfa hesaplar, burada saklanmaz).
CREATE TABLE borc_gelirler (
  id INTEGER PRIMARY KEY,
  ad TEXT NOT NULL,
  tutar_kurus INTEGER NOT NULL,
  para_birimi TEXT NOT NULL DEFAULT 'TRY',
  beklenen_tarih TEXT NOT NULL,
  -- 0: tarih kesin değil.
  kesin INTEGER NOT NULL DEFAULT 1,
  alindi_tarihi TEXT,
  duzenli_id INTEGER REFERENCES borc_duzenli_gelirler (id) ON DELETE SET NULL,
  aciklama_not TEXT NOT NULL DEFAULT '',
  olusturuldu TEXT NOT NULL
);
CREATE INDEX borc_gelirler_tarih ON borc_gelirler (beklenen_tarih);
CREATE INDEX borc_gelirler_duzenli ON borc_gelirler (duzenli_id, beklenen_tarih);

-- Faiz varsayımları, USD/TRY kuru, eldeki nakit ve `surum` (aşağıya bakın).
-- Anahtarlar app/borc/ortak.ts → Ayarlar; yoksa varsayılan geçerli. Kur varsayılanı
-- yoktur (0 = girilmedi): işletme kendi tahminini girer.
CREATE TABLE borc_ayarlar (
  anahtar TEXT PRIMARY KEY,
  deger TEXT NOT NULL
);
-- `surum`: her yazmada artar. Açık sayfalar yalnızca bunu sorar; başka biri borç
-- verisini değiştirdiyse yeniden çeker. (Balım'ın etkinlikler tablosuna YAZILMAZ:
-- o akış ve bildirimler herkese gider, borç hareketi herkese görünmemeli.)
INSERT INTO borc_ayarlar (anahtar, deger) VALUES ('surum', '0');
