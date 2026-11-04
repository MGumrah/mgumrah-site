-- Düzenli (her ay tekrarlayan) gelir kalemleri ve dövizli gelir. Geriye uyumlu:
-- yeni tablo + gelirler'e iki sütun (varsayılanlı); mevcut satırlara dokunmaz.
--
-- BU DOSYA CANLI VERİTABANINA UYGULANMADAN ÖNCE kullanıcıya sorulur; kod bu şemayı
-- bekler, bu yüzden önce migration, sonra deploy:
--   npx wrangler d1 migrations apply borc --remote
--
-- Depo herkese açık: burada gerçek tutar/ad yok. Kalemler uygulamadan (ya da Excel
-- içe aktarıcıdan) girilir. USD/TRY kuru `ayarlar` tablosunda `usdTry` anahtarıdır.

CREATE TABLE duzenli_gelirler (
  id INTEGER PRIMARY KEY,
  ad TEXT NOT NULL,
  -- para biriminin 1/100'ü: TRY için kuruş, USD için sent.
  tutar_kurus INTEGER NOT NULL CHECK (tutar_kurus > 0),
  para_birimi TEXT NOT NULL DEFAULT 'TRY' CHECK (para_birimi IN ('TRY', 'USD')),
  -- Ayın kaçında yatar; ayda o gün yoksa (31) ayın son günü.
  gun INTEGER NOT NULL CHECK (gun BETWEEN 1 AND 31),
  -- 0: tarih kesin değil ("söz verildi ama yatacağından emin değilim").
  kesin INTEGER NOT NULL DEFAULT 0,
  -- İlk beklenen ay (YYYY-MM). Öncesi için takvime satır üretilmez; geçmişteki
  -- gecikmiş alacak elle, tek seferlik gelir olarak girilir.
  baslangic_ay TEXT NOT NULL,
  aktif INTEGER NOT NULL DEFAULT 1,
  aciklama_not TEXT NOT NULL DEFAULT '',
  olusturuldu TEXT NOT NULL
);
CREATE UNIQUE INDEX duzenli_gelirler_ad ON duzenli_gelirler (ad);

-- Tek tek gerçekleşen / geciken kayıtlar gelirler'de kalır. Bir düzenli kalemin o ayki
-- kaydı varsa takvim o ay için kendi satırını üretmez.
ALTER TABLE gelirler ADD COLUMN para_birimi TEXT NOT NULL DEFAULT 'TRY';
ALTER TABLE gelirler ADD COLUMN duzenli_id INTEGER REFERENCES duzenli_gelirler (id) ON DELETE SET NULL;
CREATE INDEX gelirler_duzenli ON gelirler (duzenli_id, beklenen_tarih);
