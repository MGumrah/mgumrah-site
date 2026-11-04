-- Excel içe aktarması yeniden çalıştırılabilsin diye (scripts/borc-ice-aktar.mjs):
-- içe aktarılan her işlem, Excel'deki satırından türetilen bir anahtar taşır;
-- aynı anahtar bir daha gelirse yeni satır açılmaz, mevcut güncellenir. Telefondan
-- elle girilen işlemlerde anahtar NULL'dır ve içe aktarma onlara hiç dokunmaz.
-- (SQLite'ta UNIQUE indeks birden çok NULL'a izin verir.)

ALTER TABLE islemler ADD COLUMN kaynak_anahtar TEXT;
CREATE UNIQUE INDEX islemler_kaynak ON islemler (kaynak_anahtar);
