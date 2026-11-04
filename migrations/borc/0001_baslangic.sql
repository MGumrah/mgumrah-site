-- /borc — kişisel borç takibi (kredi kartı, KMH, işyeri borcu) — ilk şema.
--
-- Bu dosyada GERÇEK VERİ YOK ve olmamalı: depo herkese açık. Hesaplar, durum ve
-- işlemler yalnızca sahibin makinesinde çalışan scripts/borc-ice-aktar.mjs ile
-- (ya da sayfadaki formlarla) D1'e girer; giriş bilgisi scripts/borc-kullanici.mjs
-- ile. Şema Balım'ınkiyle (migrations/balim) aynı kalıpta, ama AYRI bir D1
-- veritabanında: biri bozulursa ya da silinirse öteki etkilenmesin.
--
-- Tutarlar kuruş cinsinden tamsayı (1.249,90 TL = 124990). tarih ve son_odeme
-- İstanbul takvimindeki gün (YYYY-MM-DD); ay ise YYYY-MM. olusturuldu UTC ISO-8601.

CREATE TABLE kullanicilar (
  id INTEGER PRIMARY KEY,
  kullanici_adi TEXT NOT NULL UNIQUE,
  -- "pbkdf2-sha256$<tur>$<tuz>$<hash>", tuz ve hash base64
  sifre TEXT NOT NULL,
  olusturuldu TEXT NOT NULL
);

CREATE TABLE oturumlar (
  -- Çerezdeki jetonun SHA-256'sı: tablo sızsa bile içindekiyle giriş yapılamaz.
  anahtar TEXT PRIMARY KEY,
  kullanici_id INTEGER NOT NULL REFERENCES kullanicilar (id) ON DELETE CASCADE,
  olusturuldu TEXT NOT NULL,
  son_gorulme TEXT NOT NULL,
  cihaz TEXT NOT NULL DEFAULT ''
);
CREATE INDEX oturumlar_kullanici ON oturumlar (kullanici_id);

-- Hatalı giriş sayacı: IP başına ve toplamda 15 dakikalık pencere.
CREATE TABLE giris_denemeleri (
  id INTEGER PRIMARY KEY,
  ip TEXT NOT NULL,
  zaman TEXT NOT NULL
);
CREATE INDEX giris_denemeleri_zaman ON giris_denemeleri (zaman);
CREATE INDEX giris_denemeleri_ip ON giris_denemeleri (ip, zaman);

-- kart: kredi kartı · kmh: kredili mevduat (ek hesap) · diger: işyeri borcu gibi
-- limiti / faizi olmayan borçlar. 'diger' kart borcundan AYRI listelenir ama
-- "işyeri dahil" toplamına girer.
CREATE TABLE hesaplar (
  id INTEGER PRIMARY KEY,
  ad TEXT NOT NULL UNIQUE,
  tur TEXT NOT NULL CHECK (tur IN ('kart', 'kmh', 'diger')),
  limit_kurus INTEGER NOT NULL DEFAULT 0,
  -- Hesap kesim günü (1-31); yalnızca kartlarda.
  kesim_gunu INTEGER CHECK (kesim_gunu IS NULL OR kesim_gunu BETWEEN 1 AND 31),
  -- Son ödeme günü (yaklaşık; hafta sonuna göre kayar). Kesin tarih durum kaydındadır.
  son_odeme_gunu INTEGER CHECK (son_odeme_gunu IS NULL OR son_odeme_gunu BETWEEN 1 AND 31),
  -- Asgari ödeme / ekstre oranı, baz puan olarak: %40 = 4000, %20 = 2000.
  asgari_orani_bp INTEGER CHECK (asgari_orani_bp IS NULL OR asgari_orani_bp BETWEEN 0 AND 10000),
  sira INTEGER NOT NULL DEFAULT 0,
  aktif INTEGER NOT NULL DEFAULT 1
);

-- Bir hesabın bir günkü ölçümü. Hesap başına en yeni tarih "güncel durum"dur;
-- eskileri borç geçmişidir. Aynı gün ikinci kayıt öncekinin üstüne yazar.
CREATE TABLE durum_kayitlari (
  id INTEGER PRIMARY KEY,
  hesap_id INTEGER NOT NULL REFERENCES hesaplar (id) ON DELETE CASCADE,
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
CREATE INDEX durum_kayitlari_ay ON durum_kayitlari (ay);

-- Harcama. tutar pozitif = harcama, negatif = iade. taksit 1 = tek çekim.
-- ekstre_ay: harcamanın düştüğü ekstrenin ayı (kesim gününden sonraki harcama
-- bir sonraki ayın ekstresine düşer); sunucu hesaplar, elle girilmişse korunur.
CREATE TABLE islemler (
  id INTEGER PRIMARY KEY,
  tarih TEXT NOT NULL,
  hesap_id INTEGER NOT NULL REFERENCES hesaplar (id) ON DELETE CASCADE,
  aciklama TEXT NOT NULL,
  tutar_kurus INTEGER NOT NULL,
  taksit INTEGER NOT NULL DEFAULT 1 CHECK (taksit BETWEEN 1 AND 60),
  ekstre_ay TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT '',
  aciklama_not TEXT NOT NULL DEFAULT '',
  olusturuldu TEXT NOT NULL
);
CREATE INDEX islemler_tarih ON islemler (tarih);
CREATE INDEX islemler_hesap ON islemler (hesap_id);

-- Beklenen ya da alınmış gelir. alindi_tarihi boşken beklenen_tarih geçmişse
-- "gecikmiş alacak" sayılır (sayfa hesaplar, burada saklanmaz).
CREATE TABLE gelirler (
  id INTEGER PRIMARY KEY,
  ad TEXT NOT NULL,
  tutar_kurus INTEGER NOT NULL,
  beklenen_tarih TEXT NOT NULL,
  -- 0: tarih kesin değil ("15 Kasım'da gelecek ama söz yok").
  kesin INTEGER NOT NULL DEFAULT 1,
  alindi_tarihi TEXT,
  aciklama_not TEXT NOT NULL DEFAULT '',
  olusturuldu TEXT NOT NULL
);
CREATE INDEX gelirler_tarih ON gelirler (beklenen_tarih);

-- Faiz oranları vb. Anahtarlar worker/borc.ts'teki AYAR_ANAHTARLARI; yoksa varsayılan geçerli.
CREATE TABLE ayarlar (
  anahtar TEXT PRIMARY KEY,
  deger TEXT NOT NULL
);
