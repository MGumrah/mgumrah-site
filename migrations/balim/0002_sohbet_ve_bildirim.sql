-- Aile sohbeti ve telefon bildirimleri.

-- Mesajın fotoğrafı gorseller tablosunda "Sohbet" kategorisiyle durur; böylece
-- sohbette paylaşılan her şey Görseller sekmesinde de bulunur.
CREATE TABLE mesajlar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kullanici_id INTEGER REFERENCES kullanicilar (id) ON DELETE SET NULL,
  metin TEXT NOT NULL DEFAULT '',
  gorsel_id TEXT REFERENCES gorseller (id) ON DELETE SET NULL,
  olusturuldu TEXT NOT NULL
);

-- Okunmamış mesaj sayısı bunun üstündeki başkalarının mesajları.
ALTER TABLE kullanicilar ADD COLUMN son_okunan_mesaj INTEGER NOT NULL DEFAULT 0;

-- Bir kişinin her cihazı ayrı abonelik. endpoint tarayıcının push servisindeki
-- adresi; aynı cihaz yeniden abone olunca satır güncellenir, çoğalmaz.
CREATE TABLE bildirim_abonelikleri (
  id INTEGER PRIMARY KEY,
  kullanici_id INTEGER NOT NULL REFERENCES kullanicilar (id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  -- JSON: { "sohbet": true, "degisiklikler": true, "hatirlatmalar": true }
  tercihler TEXT NOT NULL DEFAULT '{}',
  cihaz TEXT NOT NULL DEFAULT '',
  olusturuldu TEXT NOT NULL,
  guncellendi TEXT NOT NULL
);
CREATE INDEX bildirim_abonelikleri_kullanici ON bildirim_abonelikleri (kullanici_id);
