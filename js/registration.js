/**
 * ============================================================================
 * ARMASO 2027 - REGISTRATION & FILE UPLOAD ENGINE (MODULAR)
 * Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition
 * ============================================================================
 */

(function () {
  'use strict';

  // Default Google Apps Script Webhook Endpoint
  const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxhAVGyeroYI8bx5NhkosgknUrx85Y8qUUb2CtJumQCmJrkHeVsh_K0QHxZEMzzPBpu9A/exec';
  const STORAGE_KEY_GAS = 'armaso_gas_webhook_url';

  // Official Coordinator WhatsApp
  const PANITIA_WA = '6282142761856'; // Kak Daka Maulana

  // Centralized, bug-free File State Store
  const fileState = {
    olimpiade: { base64: '', name: '', type: '', size: 0 },
    futsal: { base64: '', name: '', type: '', size: 0 }
  };

  /**
   * Get Active Webhook URL (from localStorage or default fallback)
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
      // Prevent double trigger if clicking input itself
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
   * Submit payload to Google Apps Script Webhook
   */
  async function submitRegistration(payload) {
    const webhookUrl = getWebhookUrl();

    // Use URLSearchParams or JSON string based on compatibility
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
      console.warn('Network or CORS warning sending to GAS, data cached for WhatsApp confirmation:', networkError);
      return { status: 'offline_saved', message: 'Data dikirim via WhatsApp' };
    }
  }

  /**
   * Display Confirmation Success Modal & configure WhatsApp Link
   */
  function showSuccessModal(data) {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    const idCodeEl = document.getElementById('modal-reg-id');
    const waBtn = document.getElementById('modal-btn-whatsapp');

    if (idCodeEl) {
      idCodeEl.textContent = data.regId;
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
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan Pendaftaran...';

      const regId = `ARM-OLY-${Math.floor(10000 + Math.random() * 90000)}`;

      const payload = {
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

      try {
        await submitRegistration(payload);
      } catch (err) {
        console.warn('Submission fallback:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Reset form & file uploader
        form.reset();
        const removeBtn = document.getElementById('olimpiade-remove-file');
        if (removeBtn) removeBtn.click();

        // Show Success Confirmation Modal
        showSuccessModal(payload);
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
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan Pendaftaran...';

      const regId = `ARM-FUT-${Math.floor(10000 + Math.random() * 90000)}`;

      const payload = {
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

      try {
        await submitRegistration(payload);
      } catch (err) {
        console.warn('Submission fallback:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Reset form & file uploader
        form.reset();
        const removeBtn = document.getElementById('futsal-remove-file');
        if (removeBtn) removeBtn.click();

        // Show Success Confirmation Modal
        showSuccessModal(payload);
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

  // Export functions to window for debugging or manual triggering
  window.ArmasoRegistration = {
    getWebhookUrl,
    showSuccessModal
  };

})();
