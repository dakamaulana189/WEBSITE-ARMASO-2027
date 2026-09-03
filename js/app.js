/**
 * ============================================================================
 * ARMASO 2027 - MAIN UI & NAVIGATION CONTROLLER
 * Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition
 * ============================================================================
 */

(function () {
  'use strict';

  // Target event date: 23 Januari 2027 08:00:00 WIB
  const TARGET_DATE = new Date('2027-01-23T08:00:00+07:00').getTime();

  /**
   * 1. Navigation Bar & Mobile Drawer Toggle
   */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    // Sticky shadow on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile Toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });

      // Close mobile menu on clicking any link
      navMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('open');
        });
      });
    }
  }

  /**
   * 2. Event Countdown Timer
   */
  function initCountdown() {
    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minsEl = document.getElementById('count-mins');
    const secsEl = document.getElementById('count-secs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function updateTimer() {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      daysEl.textContent = days < 10 ? `0${days}` : days;
      hoursEl.textContent = hours < 10 ? `0${hours}` : hours;
      minsEl.textContent = minutes < 10 ? `0${minutes}` : minutes;
      secsEl.textContent = seconds < 10 ? `0${seconds}` : seconds;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /**
   * 3. Guidebook Modal & File Generator
   */
  function initGuidebookModals() {
    const guidebookModal = document.getElementById('guidebook-modal');
    const modalTitle = document.getElementById('guidebook-modal-title');
    const modalBody = document.getElementById('guidebook-modal-body');
    const btnDownloadAction = document.getElementById('btn-guidebook-download-action');

    const btnOlimpiadeGuidebook = document.getElementById('btn-download-guidebook-olymp');
    const btnFutsalGuidebook = document.getElementById('btn-download-guidebook-futsal');

    // Guidebook Text Content
    const guides = {
      olimpiade: {
        title: 'Buku Panduan (Guidebook) Olimpiade ARMASO 2027',
        filename: 'Guidebook_Olimpiade_ARMASO_2027.txt',
        content: `===============================================================
PETUNJUK TEKNIS & SILABUS OLIMPIADE ARMASO 2027
Pondok Pesantren Modern Ar Rahmat Bojonegoro, Jawa Timur
Ajang SD/MI Sederajat Se-Jawa Bali
===============================================================

A. KETENTUAN UMUM
1. Peserta adalah siswa/siswi aktif tingkat SD/MI sederajat di wilayah Jawa dan Bali.
2. Setiap sekolah dapat mengirimkan lebih dari 1 perwakilan untuk masing-masing bidang lomba.
3. Bidang lomba terdiri dari:
   - Matematika (Aritmatika, Teori Bilangan, Aljabar Sederhana, Geometri, Kombinatorika)
   - IPA / Science (Biologi Manusia & Lingkungan, Fisika Dasar, Energi, Pengukuran)
   - IPS / Social (Geografi Indonesia & Dunia, Sejarah Nusantara, Sosial Budaya, Koperasi & Ekonomi Dasar)
4. Biaya Pendaftaran: Rp 35.000,- per peserta.

B. TIMELINE & JALANNYA ACARA
1. Pendaftaran Online: Dibuka hingga 15 Januari 2027.
2. Babak Penyisihan (Offline/Online Campuran): Sabtu, 23 Januari 2027 (08.00 - 11.30 WIB).
3. Pengumuman Semifinalis: Sabtu, 23 Januari 2027 (16.00 WIB).
4. Babak Semifinal & Final: Minggu, 24 Januari 2027 (Pukul 08.00 WIB - selesai di Ar Rahmat Bojonegoro).

C. TOTAL HADIAH & PENGHARGAAN (TOTAL Rp 10 JUTA)
- Juara 1: Trophy Bergilir + Trophy Juara + Piagam Kemendikbud/Kemenag + Uang Pembinaan
- Juara 2 & 3: Trophy + Piagam Penghargaan + Uang Pembinaan
- Juara Harapan 1, 2, 3: Trophy + Piagam
- Seluruh Peserta: Sertifikat Resmi ARMASO 2027 bertaraf regional Jawa-Bali.

D. NARAHUBUNG RESMI
- WhatsApp: Kak Daka Maulana (+62 821-4276-1856)
- Instagram: @_dakamaulana_
- Kampus: Pondok Pesantren Modern Ar Rahmat, Jl. Untung Suropati No. 48 Bojonegoro.
===============================================================`
      },
      futsal: {
        title: 'Buku Regulasi & Guidebook Kompetisi Futsal ARMASO 2027',
        filename: 'Regulasi_Futsal_ARMASO_2027.txt',
        content: `===============================================================
REGULASI RESMI KOMPETISI FUTSAL ARMASO 2027
Pondok Pesantren Modern Ar Rahmat Bojonegoro, Jawa Timur
Tingkat SD/MI Sederajat Se-Jawa Bali
===============================================================

A. KETENTUAN TIM & PESERTA
1. Peserta adalah tim futsal putra delegasi SD/MI sederajat se-Jawa Bali.
2. Komposisi tiap tim: Maksimal 10 pemain (5 pemain inti + 5 pemain cadangan) dan 2 official/pelatih.
3. Wajib membawa surat rekomendasi kepala sekolah dan fotokopi raport/kartu pelajar saat registrasi ulang.
4. Biaya Pendaftaran: Rp 50.000,- per tim.

B. SISTEM PERTANDINGAN & JADWAL
1. Sistem Pertandingan: Sistem Gugur Tunggal (Single Elimination Knockout Stage).
2. Waktu Pertandingan:
   - Babak Penyisihan & Perempat Final: Setiap hari Minggu (1, 8, 15, dan 21 Januari 2027).
   - Babak Semifinal & Grand Final: Minggu, 24 Januari 2027 di Sport Arena Ar Rahmat Bojonegoro.
3. Durasi Pertandingan: 2 x 15 menit kotor (Semi/Final 2 x 20 menit).

C. TOTAL HADIAH & PENGHARGAAN (TOTAL Rp 20 JUTA)
- Juara 1: Trophy Bergilir ARMASO Cup + Piala Tetap + Medali Emas + Uang Tunai Pembinaan
- Juara 2: Piala + Medali Perak + Uang Tunai Pembinaan
- Juara 3: Piala + Medali Perunggu + Uang Tunai Pembinaan
- Top Scorer & Best Player: Sepatu Emas / Trophy Spesial + Sertifikat + Uang Tunai.

D. NARAHUBUNG RESMI
- WhatsApp: Kak Daka Maulana (+62 821-4276-1856)
- Lokasi: Hall & Sport Court Ar Rahmat, Bojonegoro.
===============================================================`
      }
    };

    function openGuidebook(type) {
      if (!guidebookModal) return;
      const data = guides[type];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalBody.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; font-size: 0.85rem; line-height: 1.5; color: #fbf8f0; background: rgba(12,9,6,0.85); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-gold); max-height: 380px; overflow-y: auto;">${data.content}</pre>`;

      btnDownloadAction.onclick = () => {
        const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      guidebookModal.classList.add('active');
    }

    if (btnOlimpiadeGuidebook) {
      btnOlimpiadeGuidebook.addEventListener('click', (e) => {
        e.preventDefault();
        openGuidebook('olimpiade');
      });
    }

    if (btnFutsalGuidebook) {
      btnFutsalGuidebook.addEventListener('click', (e) => {
        e.preventDefault();
        openGuidebook('futsal');
      });
    }
  }

  /**
   * 4. Webhook Configuration Dialog (Admin Tool)
   */
  function initWebhookDialog() {
    const btnOpenWebhook = document.getElementById('btn-open-gas-config');
    const btnOpenWebhookMobile = document.getElementById('btn-open-gas-mobile');
    const modalWebhook = document.getElementById('webhook-config-modal');
    const inputUrl = document.getElementById('gas-webhook-url-input');
    const btnSaveUrl = document.getElementById('btn-save-gas-url');
    const btnResetUrl = document.getElementById('btn-reset-gas-url');

    const STORAGE_KEY = 'armaso_gas_webhook_url';
    const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbxhAVGyeroYI8bx5NhkosgknUrx85Y8qUUb2CtJumQCmJrkHeVsh_K0QHxZEMzzPBpu9A/exec';

    function openModal() {
      if (!modalWebhook) return;
      if (inputUrl) {
        inputUrl.value = localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
      }
      modalWebhook.classList.add('active');
    }

    if (btnOpenWebhook) btnOpenWebhook.addEventListener('click', openModal);
    if (btnOpenWebhookMobile) btnOpenWebhookMobile.addEventListener('click', openModal);

    if (btnSaveUrl) {
      btnSaveUrl.addEventListener('click', () => {
        const val = inputUrl.value.trim();
        if (val) {
          localStorage.setItem(STORAGE_KEY, val);
          alert('URL Google Apps Script Webhook berhasil diperbarui!');
          modalWebhook.classList.remove('active');
        }
      });
    }

    if (btnResetUrl) {
      btnResetUrl.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        if (inputUrl) inputUrl.value = DEFAULT_URL;
        alert('URL Google Apps Script Webhook telah dikembalikan ke URL bawaan panitia.');
      });
    }
  }

  // Initialize all core controllers on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initCountdown();
    initGuidebookModals();
    initWebhookDialog();
  });

})();
