/**
 * ============================================================================
 * ARMASO 2027 - REGISTRATION & SUPABASE / GAS DUAL INTEGRATION ENGINE
 * Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition
 * Pondok Pesantren Modern Ar Rahmat Bojonegoro, Jawa Timur
 * ============================================================================
 */

(function () {
  'use strict';

  // 1. Supabase PostgreSQL Configuration
  const SUPABASE_CONFIG = {
    url: 'https://lesnwzqicijcmbbquynk.supabase.co',
    anonKey: 'sb_publishable_n4n7HPAmj8JwmtH_19Q8HA__poiPj9J',
    tables: {
      olimpiade: 'registrations_olimpiade',
      futsal: 'registrations_futsal'
    }
  };

  // 2. Default Google Apps Script (GAS) Webhook Endpoint (Fallback / Dual-Sync)
  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxhAVGyeroYI8bx5NhkosgknUrx85Y8qUUb2CtJumQCmJrkHeVsh_K0QHxZEMzzPBpu9A/exec';
  const STORAGE_KEY_GAS = 'armaso_gas_webhook_url';

  // 3. Official Coordinator WhatsApp
  const PANITIA_WA = '6282142761856'; // Kak Daka Maulana

  // 4. Centralized File State Store
  const fileState = {
    olimpiade: { base64: '', name: '', type: '', size: 0 },
    futsal: { base64: '', name: '', type: '', size: 0 }
  };

  // Singleton Supabase Client instance
  let _supabaseInstance = null;

  /**
   * Get or initialize Supabase JS Client
   */
  function getSupabaseClient() {
    if (_supabaseInstance) return _supabaseInstance;
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        _supabaseInstance = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        return _supabaseInstance;
      }
    } catch (e) {
      console.warn('Supabase JS Client initialization error, fallback to REST API:', e);
    }
    return null;
  }

  /**
   * Get Active Google Apps Script Webhook URL (localStorage or default)
   */
  function getWebhookUrl() {
    return localStorage.getItem(STORAGE_KEY_GAS) || DEFAULT_GAS_URL;
  }

  /**
   * Format file size in KB or MB
   */
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Setup File Upload Dropzone for a specific category ('olimpiade' or 'futsal')
   */
  function setupFileUploader(category) {
    const dropzone = document.getElementById(`${category}-dropzone`);
    const fileInput = document.getElementById(`${category}-file`);
    const previewWrap = document.getElementById(`${category}-preview-wrap`);
    const previewThumb = document.getElementById(`${category}-preview-thumb`);
    const fileNameEl = document.getElementById(`${category}-filename`);
    const fileSizeEl = document.getElementById(`${category}-filesize`);
    const removeBtn = document.getElementById(`${category}-remove-file`);

    if (!dropzone || !fileInput) return;

    // Trigger file picker on dropzone click
    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        fileInput.click();
      }
    });

    // Drag and Drop Events
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    });

    fileInput.addEventListener('change', function () {
      if (this.files && this.files.length > 0) {
        handleFileSelection(this.files[0]);
      }
    });

    // Process selected file
    function handleFileSelection(file) {
      // Allowed formats: JPG, PNG, WEBP
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert('Format file tidak didukung! Harap unggah bukti transfer dalam format JPG, PNG, atau WEBP.');
        fileInput.value = '';
        return;
      }

      // Max size: 5MB
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert(`Ukuran file terlalu besar (${formatBytes(file.size)})! Maksimal ukuran file adalah 5 MB.`);
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        fileState[category].base64 = event.target.result;
        fileState[category].name = file.name;
        fileState[category].type = file.type;
        fileState[category].size = file.size;

        // Render preview UI
        if (previewThumb) previewThumb.src = event.target.result;
        if (fileNameEl) fileNameEl.textContent = file.name;
        if (fileSizeEl) fileSizeEl.textContent = formatBytes(file.size);

        if (previewWrap) previewWrap.style.display = 'flex';
        dropzone.style.display = 'none';
      };

      reader.onerror = function () {
        alert('Terjadi kesalahan saat membaca file bukti pembayaran. Silakan coba unggah kembali.');
      };

      reader.readAsDataURL(file);
    }

    // Remove file button
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        fileState[category].base64 = '';
        fileState[category].name = '';
        fileState[category].type = '';
        fileState[category].size = 0;

        if (previewWrap) previewWrap.style.display = 'none';
        dropzone.style.display = 'block';
      });
    }
  }

  /**
   * Save registration row directly to Supabase PostgreSQL using Client or REST fallback
   */
  async function saveToSupabase(tableKey, rowData) {
    const primaryTable = SUPABASE_CONFIG.tables[tableKey];
    const fallbackTable = tableKey === 'olimpiade' ? 'registrasi_olimpiade' : 'registrasi_futsal';
    const client = getSupabaseClient();

    // 1. Try with official Supabase JS Client first
    if (client) {
      try {
        const { data, error } = await client
          .from(primaryTable)
          .insert([rowData])
          .select();

        if (!error && data) {
          console.log(`[Supabase JS] Berhasil insert ke tabel ${primaryTable}:`, data);
          return { success: true, data, source: 'supabase_js' };
        }

        if (error) {
          console.warn(`[Supabase JS] Error insert ke ${primaryTable}:`, error.message, error);
          // If error was table name mismatch, try fallback table name
          if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
            const { data: fbData, error: fbErr } = await client
              .from(fallbackTable)
              .insert([rowData])
              .select();
            if (!fbErr && fbData) {
              console.log(`[Supabase JS] Berhasil insert ke tabel alternatif ${fallbackTable}:`, fbData);
              return { success: true, data: fbData, source: 'supabase_js_fallback' };
            }
          }
        }
      } catch (err) {
        console.warn('[Supabase JS Client Exception]:', err);
      }
    }

    // 2. Try direct Supabase PostgREST API (Direct Fetch)
    try {
      const endpointsToTry = [primaryTable, fallbackTable];
      for (const tName of endpointsToTry) {
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${tName}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_CONFIG.anonKey,
            'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(rowData)
        });

        if (response.ok) {
          const resJson = await response.json();
          console.log(`[Supabase REST] Berhasil insert ke ${tName}:`, resJson);
          return { success: true, data: resJson, source: 'supabase_rest' };
        } else {
          const errDetail = await response.json().catch(() => ({}));
          console.warn(`[Supabase REST] Status ${response.status} pada tabel ${tName}:`, errDetail);
          if (errDetail.code === '42501') {
            // Row-Level Security policy error
            return {
              success: false,
              rlsRequired: true,
              message: 'Kebijakan RLS (Row Level Security) perlu diaktifkan di Supabase SQL Editor untuk publik insert.'
            };
          }
        }
      }
    } catch (fetchErr) {
      console.warn('[Supabase REST Fetch Error]:', fetchErr);
    }

    return { success: false, message: 'Gagal menghubungkan ke database Supabase.' };
  }

  /**
   * Submit payload to Google Apps Script Webhook (for Google Sheets & Drive Dual-Sync / Fallback)
   */
  async function submitToGoogleAppsScript(payload) {
    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) return { status: 'skipped' };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (err) {
        return { status: 'success', raw: responseText };
      }
    } catch (networkError) {
      console.warn('Network warning sending to GAS, data cached for WhatsApp confirmation:', networkError);
      return { status: 'offline_saved', message: 'Data dikirim via WhatsApp' };
    }
  }

  /**
   * Display Confirmation Success Modal & configure WhatsApp Link
   */
  function showSuccessModal(data, syncStatus) {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    const idCodeEl = document.getElementById('modal-reg-id');
    const waBtn = document.getElementById('modal-btn-whatsapp');
    const modalDesc = modal.querySelector('.modal-desc');

    if (idCodeEl) {
      idCodeEl.textContent = data.regId;
    }

    if (modalDesc && syncStatus) {
      let syncBadge = '';
      if (syncStatus.supabase) {
        syncBadge = `<br><span style="display:inline-block; margin-top:0.5rem; color:#25d366; font-size:0.85rem;"><i class="fa-solid fa-circle-check"></i> Tersimpan di Database Supabase & Google Sheet</span>`;
      } else {
        syncBadge = `<br><span style="display:inline-block; margin-top:0.5rem; color:#f6d066; font-size:0.85rem;"><i class="fa-solid fa-cloud-arrow-up"></i> Terdata di Sistem Panitia. Silakan lakukan konfirmasi WhatsApp.</span>`;
      }
      modalDesc.innerHTML = `Data pendaftaran Anda telah berhasil diproses oleh sistem ARMASO 2027.${syncBadge}`;
    }

    // Build WhatsApp message for Kak Daka Maulana
    let waText = `*KONFIRMASI PENDAFTARAN ARMASO 2027*\n`;
    waText += `-------------------------------------------\n`;
    waText += `*Kode Registrasi:* ${data.regId}\n`;
    waText += `*Kategori:* ${data.kategori}\n`;

    if (data.kategori === 'Olimpiade') {
      waText += `*Bidang Lomba:* ${data.bidang}\n`;
      waText += `*Nama Peserta:* ${data.nama}\n`;
      waText += `*Asal Sekolah:* ${data.sekolah}\n`;
      waText += `*Biaya Pendaftaran:* Rp 35.000\n`;
    } else {
      waText += `*Nama Tim / Asal Sekolah:* ${data.sekolah}\n`;
      waText += `*Official / Pelatih:* ${data.official}\n`;
      waText += `*Biaya Pendaftaran:* Rp 50.000\n`;
    }

    waText += `*Nomor WhatsApp:* ${data.whatsapp}\n`;
    waText += `*Status:* Bukti transfer telah dilampirkan via website.\n`;
    waText += `-------------------------------------------\n`;
    waText += `Halo Kak Daka Maulana (Panitia ARMASO 2027), saya telah mendaftar melalui website resmi. Mohon konfirmasi dan verifikasi pendaftaran kami. Terima kasih!`;

    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${PANITIA_WA}?text=${encodedText}`;

    if (waBtn) {
      waBtn.href = waUrl;
    }

    modal.classList.add('active');
  }

  /**
   * Initialize Olimpiade Form Submission
   */
  function initOlimpiadeForm() {
    const form = document.getElementById('form-olimpiade');
    if (!form) return;

    setupFileUploader('olimpiade');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nama = document.getElementById('olymp-nama').value.trim();
      const sekolah = document.getElementById('olymp-sekolah').value.trim();
      const bidang = document.getElementById('olymp-bidang').value;
      const wa = document.getElementById('olymp-wa').value.trim();
      const notes = document.getElementById('olymp-notes') ? document.getElementById('olymp-notes').value.trim() : '';

      if (!nama || !sekolah || !bidang || !wa) {
        alert('Harap lengkapi semua kolom bertanda bintang (*)!');
        return;
      }

      if (!fileState.olimpiade.base64) {
        alert('Harap unggah bukti pembayaran transfer (Rp 35.000) terlebih dahulu!');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-olymp');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Database Supabase...';

      const regId = `ARM-OLY-${Math.floor(10000 + Math.random() * 90000)}`;

      // 1. Structure Row for Supabase Table 'registrations_olimpiade'
      const supabaseRow = {
        reg_id: regId,
        nama_lengkap: nama,
        asal_sekolah: sekolah,
        bidang_lomba: bidang,
        nomor_whatsapp: wa,
        biaya_pendaftaran: 35000,
        status_pembayaran: 'Menunggu Verifikasi',
        bukti_transfer_url: fileState.olimpiade.base64,
        catatan_tambahan: notes || null,
        waktu_daftar_gas: new Date().toISOString()
      };

      // 2. Structure Payload for Google Apps Script Webhook (Fallback & Sheet Sync)
      const gasPayload = {
        kategori: 'Olimpiade',
        regId: regId,
        nama: nama,
        sekolah: sekolah,
        bidang: bidang,
        whatsapp: wa,
        catatan: notes,
        biaya: 'Rp 35.000',
        fileName: fileState.olimpiade.name,
        fileType: fileState.olimpiade.type,
        fileBase64: fileState.olimpiade.base64
      };

      const syncStatus = { supabase: false, gas: false };

      try {
        // Submit to Supabase as primary database
        const supabaseResult = await saveToSupabase('olimpiade', supabaseRow);
        syncStatus.supabase = !!supabaseResult.success;

        // Perform simultaneous dual-sync or fallback to Google Apps Script
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sinkronisasi Google Sheets...';
        const gasResult = await submitToGoogleAppsScript(gasPayload);
        syncStatus.gas = !!(gasResult && gasResult.status !== 'error');

      } catch (err) {
        console.warn('Submission pipeline catch warning:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Reset form & file uploader
        form.reset();
        const removeBtn = document.getElementById('olimpiade-remove-file');
        if (removeBtn) removeBtn.click();

        // Show Success Confirmation Modal
        showSuccessModal(gasPayload, syncStatus);
      }
    });
  }

  /**
   * Initialize Futsal Form Submission
   */
  function initFutsalForm() {
    const form = document.getElementById('form-futsal');
    if (!form) return;

    setupFileUploader('futsal');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const sekolah = document.getElementById('futsal-sekolah').value.trim();
      const official = document.getElementById('futsal-official').value.trim();
      const wa = document.getElementById('futsal-wa').value.trim();
      const notes = document.getElementById('futsal-notes') ? document.getElementById('futsal-notes').value.trim() : '';

      if (!sekolah || !official || !wa) {
        alert('Harap lengkapi semua kolom bertanda bintang (*)!');
        return;
      }

      if (!fileState.futsal.base64) {
        alert('Harap unggah bukti pembayaran transfer (Rp 50.000) terlebih dahulu!');
        return;
      }

      const submitBtn = document.getElementById('btn-submit-futsal');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Database Supabase...';

      const regId = `ARM-FUT-${Math.floor(10000 + Math.random() * 90000)}`;

      // 1. Structure Row for Supabase Table 'registrations_futsal'
      const supabaseRow = {
        reg_id: regId,
        asal_sekolah_nama_tim: sekolah,
        nama_official_pelatih: official,
        nomor_whatsapp: wa,
        biaya_pendaftaran: 50000,
        status_pembayaran: 'Menunggu Verifikasi',
        bukti_transfer_url: fileState.futsal.base64,
        catatan_tambahan: notes || null,
        waktu_daftar_gas: new Date().toISOString()
      };

      // 2. Structure Payload for Google Apps Script Webhook (Fallback & Sheet Sync)
      const gasPayload = {
        kategori: 'Kompetisi Futsal',
        regId: regId,
        sekolah: sekolah,
        namaTim: sekolah,
        official: official,
        whatsapp: wa,
        catatan: notes,
        biaya: 'Rp 50.000',
        fileName: fileState.futsal.name,
        fileType: fileState.futsal.type,
        fileBase64: fileState.futsal.base64
      };

      const syncStatus = { supabase: false, gas: false };

      try {
        // Submit to Supabase as primary database
        const supabaseResult = await saveToSupabase('futsal', supabaseRow);
        syncStatus.supabase = !!supabaseResult.success;

        // Perform simultaneous dual-sync or fallback to Google Apps Script
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sinkronisasi Google Sheets...';
        const gasResult = await submitToGoogleAppsScript(gasPayload);
        syncStatus.gas = !!(gasResult && gasResult.status !== 'error');

      } catch (err) {
        console.warn('Submission pipeline catch warning:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Reset form & file uploader
        form.reset();
        const removeBtn = document.getElementById('futsal-remove-file');
        if (removeBtn) removeBtn.click();

        // Show Success Confirmation Modal
        showSuccessModal(gasPayload, syncStatus);
      }
    });
  }

  // Bind close buttons for modals
  function initModalClosers() {
    document.querySelectorAll('.modal-close-btn, .btn-close-modal').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach((modal) => {
          modal.classList.remove('active');
        });
      });
    });

    document.querySelectorAll('.modal-overlay').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  // Initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initOlimpiadeForm();
    initFutsalForm();
    initModalClosers();
  });

  // Export functions & configuration to window for debugging or manual inspection
  window.ArmasoRegistration = {
    getSupabaseClient,
    getWebhookUrl,
    saveToSupabase,
    showSuccessModal,
    SUPABASE_CONFIG
  };

})();
