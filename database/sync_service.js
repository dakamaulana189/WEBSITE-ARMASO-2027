/**
 * ============================================================================
 * ARMASO 2027 - POSTGRESQL SYNC & WEBHOOK RECEIVER SERVICE (NODE.JS)
 * Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition
 * ============================================================================
 * 
 * Penggunaan:
 *   1. Pasang dependensi: npm install pg (opsional express/dotenv jika ingin server penuh)
 *   2. Jalankan: node database/sync_service.js
 * ============================================================================
 */

const http = require('http');

// Konfigurasi Database PostgreSQL (Dapat diisi via Environment Variable)
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/armaso2027',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

/**
 * Upsert Data Registrasi Olimpiade ke PostgreSQL
 */
async function upsertOlimpiade(pgPool, data) {
  const query = `
    INSERT INTO registrations_olimpiade (
      reg_id, nama_lengkap, asal_sekolah, bidang_lomba, 
      nomor_whatsapp, biaya_pendaftaran, status_pembayaran, 
      bukti_transfer_url, catatan_tambahan, waktu_daftar_gas
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (reg_id) DO UPDATE SET
      nama_lengkap = EXCLUDED.nama_lengkap,
      asal_sekolah = EXCLUDED.asal_sekolah,
      bidang_lomba = EXCLUDED.bidang_lomba,
      nomor_whatsapp = EXCLUDED.nomor_whatsapp,
      status_pembayaran = EXCLUDED.status_pembayaran,
      bukti_transfer_url = EXCLUDED.bukti_transfer_url,
      updated_at = NOW()
    RETURNING id, reg_id;
  `;

  const values = [
    data.regId,
    data.nama || '-',
    data.sekolah || '-',
    data.bidang || 'Matematika',
    data.whatsapp || '-',
    data.biaya || 35000.00,
    data.status || 'Menunggu Verifikasi',
    data.fileUrl || null,
    data.catatan || null,
    data.timestamp || null
  ];

  const res = await pgPool.query(query, values);
  return res.rows[0];
}

/**
 * Upsert Data Registrasi Futsal ke PostgreSQL
 */
async function upsertFutsal(pgPool, data) {
  const query = `
    INSERT INTO registrations_futsal (
      reg_id, asal_sekolah_nama_tim, nama_official_pelatih,
      nomor_whatsapp, biaya_pendaftaran, status_pembayaran,
      bukti_transfer_url, catatan_tambahan, waktu_daftar_gas
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (reg_id) DO UPDATE SET
      asal_sekolah_nama_tim = EXCLUDED.asal_sekolah_nama_tim,
      nama_official_pelatih = EXCLUDED.nama_official_pelatih,
      nomor_whatsapp = EXCLUDED.nomor_whatsapp,
      status_pembayaran = EXCLUDED.status_pembayaran,
      bukti_transfer_url = EXCLUDED.bukti_transfer_url,
      updated_at = NOW()
    RETURNING id, reg_id;
  `;

  const values = [
    data.regId,
    data.sekolah || data.namaTim || '-',
    data.official || '-',
    data.whatsapp || '-',
    data.biaya || 50000.00,
    data.status || 'Menunggu Verifikasi',
    data.fileUrl || null,
    data.catatan || null,
    data.timestamp || null
  ];

  const res = await pgPool.query(query, values);
  return res.rows[0];
}

/**
 * Lightweight HTTP Server untuk Menerima Webhook Sinkronisasi dari Google Apps Script
 */
function startWebhookServer(port = process.env.PORT || 3000) {
  let pgPool = null;

  try {
    const { Pool } = require('pg');
    pgPool = new Pool(dbConfig);
    console.log('[PostgreSQL] Database pool initialized successfully.');
  } catch (err) {
    console.warn('[PostgreSQL Warning] Modul "pg" belum terpasang. Jalankan "npm install pg" untuk mengaktifkan koneksi database langsung.');
  }

  const server = http.createServer(async (req, res) => {
    // Header CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'ARMASO 2027 PostgreSQL Ingest Server' }));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/sync') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          console.log('[Sync Received]:', payload.regId, payload.category);

          let dbResult = { saved: false, reason: 'No PG Pool active' };
          if (pgPool) {
            if (payload.category === 'FUTSAL') {
              dbResult = await upsertFutsal(pgPool, payload);
            } else {
              dbResult = await upsertOlimpiade(pgPool, payload);
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'success', data: dbResult }));
        } catch (error) {
          console.error('[Sync Error]:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', message: error.message }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'not_found' }));
  });

  server.listen(port, () => {
    console.log(`[ARMASO 2027 Sync Server] Berjalan pada http://localhost:${port}`);
    console.log(`Endpoint Webhook Sinkronisasi: POST http://localhost:${port}/api/sync`);
  });

  return server;
}

// Jika dijalankan langsung melalui CLI
if (require.main === module) {
  startWebhookServer();
}

module.exports = {
  upsertOlimpiade,
  upsertFutsal,
  startWebhookServer
};
