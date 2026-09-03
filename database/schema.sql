-- ============================================================================
-- ARMASO 2027 - POSTGRESQL DATABASE SCHEMA
-- Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition
-- Pondok Pesantren Modern Ar Rahmat Bojonegoro, Jawa Timur
-- ============================================================================

-- Ekstensi UUID jika diperlukan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Tipe Lomba & Status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'competition_category') THEN
    CREATE TYPE competition_category AS ENUM ('OLIMPIADE', 'FUTSAL');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'olympiad_field') THEN
    CREATE TYPE olympiad_field AS ENUM ('Matematika', 'IPA (Science)', 'IPS (Social)');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('Menunggu Verifikasi', 'Lunas / Terverifikasi', 'Ditolak');
  END IF;
END $$;

-- 1. Tabel Registrasi Olimpiade
CREATE TABLE IF NOT EXISTS registrations_olimpiade (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reg_id VARCHAR(50) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(255) NOT NULL,
  asal_sekolah VARCHAR(255) NOT NULL,
  bidang_lomba VARCHAR(50) NOT NULL,
  nomor_whatsapp VARCHAR(50) NOT NULL,
  biaya_pendaftaran NUMERIC(12, 2) DEFAULT 35000.00,
  status_pembayaran VARCHAR(50) DEFAULT 'Menunggu Verifikasi',
  bukti_transfer_url TEXT,
  catatan_tambahan TEXT,
  waktu_daftar_gas VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks performa untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_olymp_reg_id ON registrations_olimpiade(reg_id);
CREATE INDEX IF NOT EXISTS idx_olymp_wa ON registrations_olimpiade(nomor_whatsapp);
CREATE INDEX IF NOT EXISTS idx_olymp_bidang ON registrations_olimpiade(bidang_lomba);
CREATE INDEX IF NOT EXISTS idx_olymp_sekolah ON registrations_olimpiade(asal_sekolah);

-- 2. Tabel Registrasi Kompetisi Futsal
CREATE TABLE IF NOT EXISTS registrations_futsal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reg_id VARCHAR(50) UNIQUE NOT NULL,
  asal_sekolah_nama_tim VARCHAR(255) NOT NULL,
  nama_official_pelatih VARCHAR(255) NOT NULL,
  nomor_whatsapp VARCHAR(50) NOT NULL,
  biaya_pendaftaran NUMERIC(12, 2) DEFAULT 50000.00,
  status_pembayaran VARCHAR(50) DEFAULT 'Menunggu Verifikasi',
  bukti_transfer_url TEXT,
  catatan_tambahan TEXT,
  waktu_daftar_gas VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks performa Futsal
CREATE INDEX IF NOT EXISTS idx_futsal_reg_id ON registrations_futsal(reg_id);
CREATE INDEX IF NOT EXISTS idx_futsal_wa ON registrations_futsal(nomor_whatsapp);
CREATE INDEX IF NOT EXISTS idx_futsal_nama_tim ON registrations_futsal(asal_sekolah_nama_tim);

-- 3. Trigger Otomatis Pembaruan timestamp updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_olymp ON registrations_olimpiade;
CREATE TRIGGER trg_update_olymp
BEFORE UPDATE ON registrations_olimpiade
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trg_update_futsal ON registrations_futsal;
CREATE TRIGGER trg_update_futsal
BEFORE UPDATE ON registrations_futsal
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- 4. View Terpadu Seluruh Peserta ARMASO 2027
CREATE OR REPLACE VIEW view_all_armaso_registrations AS
SELECT 
  id,
  reg_id,
  'OLIMPIADE' AS kategori,
  bidang_lomba AS detail_bidang,
  nama_lengkap AS nama_pendaftar,
  asal_sekolah,
  nomor_whatsapp,
  biaya_pendaftaran,
  status_pembayaran,
  bukti_transfer_url,
  created_at
FROM registrations_olimpiade
UNION ALL
SELECT 
  id,
  reg_id,
  'FUTSAL' AS kategori,
  'Turnamen Futsal Putra' AS detail_bidang,
  nama_official_pelatih AS nama_pendaftar,
  asal_sekolah_nama_tim AS asal_sekolah,
  nomor_whatsapp,
  biaya_pendaftaran,
  status_pembayaran,
  bukti_transfer_url,
  created_at
FROM registrations_futsal;
