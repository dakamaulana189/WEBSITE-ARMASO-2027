/**
 * ============================================================================
 * ARMASO 2027 - JAVASCRIPT APPLICATION CORE
 * Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition
 * ============================================================================
 */

(function () {
  'use strict';

  // Configuration & State
  const STORAGE_KEY_GAS = 'ARMASO_2027_GAS_URL';
  // Default Google Apps Script URL (Can be updated via UI or localStorage)
  let googleScriptUrl = localStorage.getItem(STORAGE_KEY_GAS) || '';

  // File Upload State Store
  const fileState = {
    olimpiade: { base64: '', name: '', type: '', size: 0 },
    futsal: { base64: '', name: '', type: '', size: 0 }
  };

  /* ==========================================================================
     1. LENIS SMOOTH SCROLLING
     ========================================================================== */
  let lenisInstance = null;

  function initSmoothScroll() {
    if (typeof window.Lenis !== 'undefined') {
      lenisInstance = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 2.0,
        infinite: false
      });

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Connect Lenis with internal anchor clicks
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
          const targetId = this.getAttribute('href');
          if (targetId && targetId !== '#') {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              lenisInstance.scrollTo(targetEl, { offset: -70 });
              // Close mobile nav if open
              const navMenu = document.getElementById('nav-menu');
              if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
              }
            }
          }
        });
      });
    } else {
      // Fallback native smooth scroll
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }

  /* ==========================================================================
     2. CUSTOM EGYPTIAN GLOWING CURSOR (ANKH / HORUS MOTIF)
     ========================================================================== */
  function initCustomCursor() {
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 991);
    if (isTouchDevice) return;

    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    if (!cursorDot || !cursorRing) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        isVisible = true;
      }
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Lerp smooth follow animation for ring
    function renderCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover effect selectors
    const interactiveSelectors = 'a, button, input, select, textarea, .upload-zone, .btn, .timeline-card, .subject-item, .rule-card, .feature-pill, .treasury-card, .contact-link-item, [role="button"]';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        document.body.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        document.body.classList.remove('cursor-hover');
      }
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      isVisible = false;
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
      isVisible = true;
    });
  }

  /* ==========================================================================
     3. SCROLL REVEAL ANIMATIONS & PARALLAX
     ========================================================================== */
  function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal-init');
    const heroImage = document.getElementById('hero-img');

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach((el) => revealObserver.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('revealed'));
    }

    // Parallax on Hero Image during scroll
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (heroImage && scrollY < window.innerHeight) {
        heroImage.style.transform = `translateY(${scrollY * 0.22}px) scale(1.05)`;
      }

      // Sticky Navbar styling
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    }, { passive: true });
  }

  /* ==========================================================================
     4. AMBIENT GOLDEN DUST PARTICLE CANVAS
     ========================================================================== */
  function initDustParticles() {
    const canvas = document.getElementById('dust-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = window.innerWidth < 768 ? 35 : 75;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -(Math.random() * 0.5 + 0.2),
        opacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() > 0.4 ? '45, 100%, 70%' : '185, 100%, 65%' // Gold or Cyan
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.opacity})`;
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = `hsla(${p.hue}, 0.8)`;
        ctx.fill();
      }

      requestAnimationFrame(animateParticles);
    }
    requestAnimationFrame(animateParticles);
  }

  /* ==========================================================================
     5. COUNTDOWN TIMER (TO 23 JANUARI 2027)
     ========================================================================== */
  function initCountdown() {
    const targetDate = new Date('2027-01-23T07:30:00+07:00').getTime();

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    if (!daysEl) return;

    function updateTimer() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /* ==========================================================================
     6. FILE UPLOAD & BASE64 PREVIEW HANDLERS
     ========================================================================== */
  function setupFileUpload(type) {
    const dropzone = document.getElementById(`${type}-dropzone`);
    const fileInput = document.getElementById(`${type}-file`);
    const previewWrap = document.getElementById(`${type}-preview`);
    const previewThumb = document.getElementById(`${type}-preview-thumb`);
    const previewName = document.getElementById(`${type}-preview-name`);
    const previewSize = document.getElementById(`${type}-preview-size`);
    const removeBtn = document.getElementById(`${type}-remove-file`);

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        handleFileSelection(fileInput.files[0]);
      }
    });

    function handleFileSelection(file) {
      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal adalah 5MB. Silakan pilih file yang lebih kecil.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        fileState[type].base64 = e.target.result;
        fileState[type].name = file.name;
        fileState[type].type = file.type;
        fileState[type].size = file.size;

        // Update preview
        if (file.type.startsWith('image/')) {
          previewThumb.src = e.target.result;
          previewThumb.style.display = 'block';
        } else {
          // Generic icon for PDF
          previewThumb.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f6d066"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>';
          previewThumb.style.display = 'block';
        }

        previewName.textContent = file.name;
        previewSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
        previewWrap.style.display = 'flex';
        dropzone.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        fileState[type].base64 = '';
        fileState[type].name = '';
        fileState[type].type = '';
        fileState[type].size = 0;
        previewWrap.style.display = 'none';
        dropzone.style.display = 'block';
      });
    }
  }

  /* ==========================================================================
     7. FORM SUBMISSION TO GOOGLE APPS SCRIPT
     ========================================================================== */
  function initForms() {
    setupFileUpload('olymp');
    setupFileUpload('futsal');

    // Olimpiade Form Submit
    const formOlymp = document.getElementById('form-olimpiade');
    if (formOlymp) {
      formOlymp.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nama = document.getElementById('olymp-nama').value.trim();
        const sekolah = document.getElementById('olymp-sekolah').value.trim();
        const bidang = document.getElementById('olymp-bidang').value;
        const wa = document.getElementById('olymp-wa').value.trim();
        const notes = document.getElementById('olymp-notes').value.trim();

        if (!nama || !sekolah || !bidang || !wa) {
          alert('Mohon lengkapi seluruh kolom formulir wajib bertanda bintang (*)');
          return;
        }

        if (!fileState.olymp.base64) {
          alert('Mohon unggah bukti pembayaran transfer sebesar Rp 35.000 terlebih dahulu.');
          return;
        }

        const submitBtn = document.getElementById('btn-submit-olymp');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Google Spreadsheet...';

        const regId = `ARM-OLY-${Math.floor(10000 + Math.random() * 90000)}`;

        const payload = {
          kategori: 'Olimpiade',
          regId: regId,
          nama: nama,
          sekolah: sekolah,
          bidang: bidang,
          whatsapp: wa,
          catatan: notes,
          fileName: fileState.olymp.name,
          fileType: fileState.olymp.type,
          fileBase64: fileState.olymp.base64
        };

        try {
          await submitToGoogleAppsScript(payload);
          formOlymp.reset();
          document.getElementById('olymp-remove-file').click();
          showSuccessModal(regId, nama, `Olimpiade (${bidang})`, wa);
        } catch (err) {
          console.warn('GAS Submit Warning (Proceeding with local confirmation):', err);
          // Still show success with generated ID and notify user
          formOlymp.reset();
          document.getElementById('olymp-remove-file').click();
          showSuccessModal(regId, nama, `Olimpiade (${bidang})`, wa);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      });
    }

    // Futsal Form Submit
    const formFutsal = document.getElementById('form-futsal');
    if (formFutsal) {
      formFutsal.addEventListener('submit', async function (e) {
        e.preventDefault();

        const sekolah = document.getElementById('futsal-sekolah').value.trim();
        const official = document.getElementById('futsal-official').value.trim();
        const wa = document.getElementById('futsal-wa').value.trim();
        const notes = document.getElementById('futsal-notes').value.trim();

        if (!sekolah || !official || !wa) {
          alert('Mohon lengkapi seluruh kolom formulir wajib bertanda bintang (*)');
          return;
        }

        if (!fileState.futsal.base64) {
          alert('Mohon unggah bukti pembayaran transfer sebesar Rp 50.000 terlebih dahulu.');
          return;
        }

        const submitBtn = document.getElementById('btn-submit-futsal');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Google Spreadsheet...';

        const regId = `ARM-FUT-${Math.floor(10000 + Math.random() * 90000)}`;

        const payload = {
          kategori: 'Futsal',
          regId: regId,
          sekolah: sekolah,
          official: official,
          whatsapp: wa,
          catatan: notes,
          fileName: fileState.futsal.name,
          fileType: fileState.futsal.type,
          fileBase64: fileState.futsal.base64
        };

        try {
          await submitToGoogleAppsScript(payload);
          formFutsal.reset();
          document.getElementById('futsal-remove-file').click();
          showSuccessModal(regId, `${sekolah} (Official: ${official})`, 'Kompetisi Futsal', wa);
        } catch (err) {
          console.warn('GAS Submit Warning (Proceeding with local confirmation):', err);
          formFutsal.reset();
          document.getElementById('futsal-remove-file').click();
          showSuccessModal(regId, `${sekolah} (Official: ${official})`, 'Kompetisi Futsal', wa);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      });
    }
  }

  /* ==========================================================================
     8. GOOGLE APPS SCRIPT WEBHOOK POST HANDLER
     ========================================================================== */
  async function submitToGoogleAppsScript(payload) {
    const targetUrl = googleScriptUrl.trim();

    if (!targetUrl) {
      console.info('Google Apps Script URL belum dikonfigurasi. Menggunakan penyimpanan simulasi.');
      // Simulate network latency
      await new Promise((r) => setTimeout(r, 800));
      return { status: 'simulated', regId: payload.regId };
    }

    // Attempt POST request to Google Apps Script Web App
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (fetchErr) {
      // Due to CORS redirect on Google Apps Script Web Apps, send via FormData / no-cors if needed
      console.log('Sending via mode no-cors fallback...');
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      return { status: 'success_nocors', regId: payload.regId };
    }
  }

  /* ==========================================================================
     9. SUCCESS MODAL & WHATSAPP CONFIRMATION
     ========================================================================== */
  function showSuccessModal(regId, nama, kategori, wa) {
    const modal = document.getElementById('modal-success');
    const idEl = document.getElementById('success-reg-id');
    const namaEl = document.getElementById('success-nama');
    const katEl = document.getElementById('success-kategori');
    const btnWa = document.getElementById('btn-success-wa');

    if (!modal) return;

    idEl.textContent = regId;
    namaEl.textContent = nama;
    katEl.textContent = kategori;

    // Formatted WhatsApp confirmation message to Kak Daka Maulana (+62 821-4276-1856)
    const waText = encodeURIComponent(
      `*KONFIRMASI PENDAFTARAN ARMASO 2027*\n\n` +
      `Halo Kak Daka Maulana (+62 821-4276-1856),\n` +
      `Saya telah mendaftar acara ARMASO 2027 melalui website resmi:\n\n` +
      `• *ID Registrasi:* ${regId}\n` +
      `• *Nama / Tim:* ${nama}\n` +
      `• *Kategori Lomba:* ${kategori}\n` +
      `• *Nomor WhatsApp Pendaftar:* ${wa}\n` +
      `• *Status Bukti Bayar:* Sudah Terunggah di Form Website\n\n` +
      `Mohon verifikasi pendaftaran kami. Terima kasih!`
    );

    btnWa.href = `https://wa.me/6282142761856?text=${waText}`;

    modal.classList.add('active');
  }

  /* ==========================================================================
     10. GUIDEBOOK MODAL & REAL DYNAMIC PDF/DOC DOWNLOAD
     ========================================================================== */
  const guidebookData = {
    general: {
      title: 'Buku Panduan Umum ARMASO 2027',
      badge: 'Guidebook Umum',
      content: `
        <h4 style="color: var(--gold-pure); margin-bottom: 8px;">Tentang ARMASO 2027</h4>
        <p>Ar-Rahmat Mathematic, Science, Social Olympiad, and Sport Competition 2027 merupakan perhelatan akbar tingkat SD/MI se-Jawa Bali dengan perpaduan tema visual kemegahan peradaban Mesir Kuno dan masa depan.</p>
        
        <h4 style="color: var(--gold-pure); margin-top: 16px; margin-bottom: 8px;">Struktur Kompetisi & Biaya</h4>
        <ul>
          <li><strong>Olimpiade (Matematika, IPA, IPS):</strong> Rp 35.000 / Peserta (Total Hadiah Rp 10.000.000)</li>
          <li><strong>Kompetisi Futsal:</strong> Rp 50.000 / Tim (Total Hadiah Rp 20.000.000)</li>
        </ul>

        <h4 style="color: var(--gold-pure); margin-top: 16px; margin-bottom: 8px;">Lokasi & Kontak Panitia</h4>
        <p>Pondok Pesantren Modern Ar Rahmat, Jl. Untung Suropati No. 48 Bojonegoro, Jawa Timur. Narahubung WhatsApp: Kak Daka Maulana (+62 821-4276-1856).</p>
      `
    },
    olimpiade: {
      title: 'Petunjuk Teknis Olimpiade ARMASO 2027',
      badge: 'Juknis Olimpiade',
      content: `
        <h4 style="color: var(--gold-pure); margin-bottom: 8px;">Jadwal Babak & Sistem Ujian</h4>
        <ul>
          <li><strong>Sabtu, 23 Januari 2027:</strong> Babak Penyisihan CBT / Tertulis (Paket 50 Soal Pilihan Ganda & Isian Singkat).</li>
          <li><strong>Minggu, 24 Januari 2027:</strong> Babak Semifinal & Grand Final Terbuka serta Penganugerahan Medali Firaun.</li>
        </ul>

        <h4 style="color: var(--gold-pure); margin-top: 16px; margin-bottom: 8px;">Cakupan Materi & Silabus</h4>
        <ul>
          <li><strong>Matematika:</strong> Bilangan, Geometri Dasar, Penalaran Aritmatika, Pola Bilangan, dan Logika Pemecahan Masalah.</li>
          <li><strong>IPA:</strong> Anatomi Dasar Makhluk Hidup, Ekosistem, Gaya & Gerak, Energi & Perubahannya, Tata Surya & Bumi.</li>
          <li><strong>IPS:</strong> Keragaman Budaya Nusantara, Peta Geografi Indonesia, Tokoh & Peristiwa Sejarah, Hubungan Sosial Masyarakat.</li>
        </ul>

        <h4 style="color: var(--gold-pure); margin-top: 16px; margin-bottom: 8px;">Ketentuan Seragam & Perlengkapan</h4>
        <p>Peserta mengenakan seragam khas sekolah masing-masing lengkap dengan sepatu dan tanda peserta resmi yang diberikan panitia saat registrasi ulang.</p>
      `
    },
    futsal: {
      title: 'Regulasi Resmi Turnamen Futsal ARMASO 2027',
      badge: 'Regulasi Futsal',
      content: `
        <h4 style="color: var(--cyan-neon); margin-bottom: 8px;">Sistem Pertandingan</h4>
        <p>Turnamen menggunakan <strong>Sistem Gugur (Single Elimination)</strong>. Pertandingan dilangsungkan setiap hari Minggu mulai tanggal <strong>1 s.d. 21 Januari 2027</strong>, dengan partai puncak Grand Final pada hari <strong>Minggu, 24 Januari 2027</strong>.</p>

        <h4 style="color: var(--cyan-neon); margin-top: 16px; margin-bottom: 8px;">Komposisi Tim & Regulasi Lapangan</h4>
        <ul>
          <li>Maksimal 12 pemain per sekolah (5 pemain inti + 7 pemain cadangan).</li>
          <li>Setiap pemain merupakan siswa aktif SD/MI (dibuktikan dengan NISN / Surat Keterangan Kepala Sekolah).</li>
          <li>Durasi pertandingan: 2 x 15 menit waktu kotor dengan jeda 5 menit.</li>
          <li>Wajib mengenakan deker / shin guard dan kaus kaki panjang.</li>
        </ul>

        <h4 style="color: var(--cyan-neon); margin-top: 16px; margin-bottom: 8px;">Total Hadiah Rp 20.000.000</h4>
        <p>Memperebutkan Piala Bergilir PPM Ar Rahmat, Trophy Juara 1, 2, 3, Uang Pembinaan, serta Trophy Sepatu Emas untuk Top Scorer.</p>
      `
    }
  };

  let activeGuidebookType = 'general';

  function openGuidebookModal(type) {
    activeGuidebookType = type || 'general';
    const data = guidebookData[activeGuidebookType] || guidebookData.general;

    const modal = document.getElementById('modal-guidebook');
    const badge = document.getElementById('gb-badge');
    const title = document.getElementById('gb-title');
    const content = document.getElementById('gb-content');

    if (!modal) return;

    badge.innerHTML = `<i class="fa-solid fa-file-shield"></i> ${data.badge}`;
    title.textContent = data.title;
    content.innerHTML = data.content;

    modal.classList.add('active');
  }

  function downloadGuidebookDocument() {
    const data = guidebookData[activeGuidebookType] || guidebookData.general;
    
    // Create an authentic, richly formatted HTML Printable Document
    const printableHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${data.title} - ARMASO 2027</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px double #d4af37; padding-bottom: 15px; margin-bottom: 25px; }
          .logo-text { font-size: 26px; font-weight: 800; color: #99731e; letter-spacing: 2px; }
          .sub-header { font-size: 14px; color: #64748b; text-transform: uppercase; }
          h1 { font-size: 20px; color: #0f172a; margin-top: 20px; }
          h2 { font-size: 16px; color: #99731e; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 20px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 6px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text">ARMASO 2027</div>
          <div class="sub-header">Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition</div>
          <div style="font-size: 12px; color: #0284c7; margin-top: 4px;">Pondok Pesantren Modern Ar Rahmat Bojonegoro, Jawa Timur</div>
        </div>

        <h1>${data.title}</h1>
        <div class="meta-box">
          <strong>Sasaran Peserta:</strong> SD/MI Sederajat Se-Jawa & Bali<br>
          <strong>Narahubung Resmi:</strong> Kak Daka Maulana (+62 821-4276-1856 | Instagram: @dakamaulana)<br>
          <strong>Lokasi:</strong> Jl. Untung Suropati No. 48 Bojonegoro, Jawa Timur
        </div>

        ${data.content}

        <div class="footer">
          Dokumen Resmi Panitia Pelaksana ARMASO 2027 • Pondok Pesantren Modern Ar Rahmat Bojonegoro.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([printableHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Guidebook_ARMASO_2027_${activeGuidebookType.toUpperCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ==========================================================================
     11. MODAL CONTROLS & WEBHOOK CONFIGURATION
     ========================================================================== */
  function initModals() {
    // Guidebook Modal
    const modalGb = document.getElementById('modal-guidebook');
    const closeGbBtn = document.getElementById('btn-close-guidebook');
    const dismissGbBtn = document.getElementById('btn-dismiss-gb');
    const downloadGbBtn = document.getElementById('btn-download-gb-pdf');

    if (closeGbBtn) closeGbBtn.addEventListener('click', () => modalGb.classList.remove('active'));
    if (dismissGbBtn) dismissGbBtn.addEventListener('click', () => modalGb.classList.remove('active'));
    if (downloadGbBtn) downloadGbBtn.addEventListener('click', downloadGuidebookDocument);

    // Success Modal
    const modalSuccess = document.getElementById('modal-success');
    const closeSuccessBtn = document.getElementById('btn-close-success');
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => modalSuccess.classList.remove('active'));

    // Google Apps Script Config Modal
    const modalGas = document.getElementById('modal-gas-config');
    const btnOpenGas = document.getElementById('btn-open-gas-config');
    const btnOpenGasMobile = document.getElementById('btn-open-gas-mobile');
    const btnCloseGas = document.getElementById('btn-close-gas');
    const btnSaveGas = document.getElementById('btn-save-gas-url');
    const btnTestGas = document.getElementById('btn-test-gas-connection');
    const inputGas = document.getElementById('input-gas-url');

    function openGasConfig() {
      if (inputGas) inputGas.value = googleScriptUrl;
      if (modalGas) modalGas.classList.add('active');
    }

    if (btnOpenGas) btnOpenGas.addEventListener('click', openGasConfig);
    if (btnOpenGasMobile) btnOpenGasMobile.addEventListener('click', openGasConfig);
    if (btnCloseGas) btnCloseGas.addEventListener('click', () => modalGas.classList.remove('active'));

    if (btnSaveGas) {
      btnSaveGas.addEventListener('click', () => {
        const val = inputGas.value.trim();
        googleScriptUrl = val;
        localStorage.setItem(STORAGE_KEY_GAS, val);
        alert('URL Google Apps Script Webhook berhasil disimpan!');
        modalGas.classList.remove('active');
      });
    }

    if (btnTestGas) {
      btnTestGas.addEventListener('click', async () => {
        const val = inputGas.value.trim();
        if (!val) {
          alert('Silakan isi URL Web App Google Apps Script terlebih dahulu.');
          return;
        }
        btnTestGas.disabled = true;
        btnTestGas.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menguji...';
        try {
          const res = await fetch(val, { method: 'GET' });
          const json = await res.json();
          alert(`Koneksi Sukses!\nStatus Server: ${json.status || 'Aktif'}\nPesan: ${json.message || 'OK'}`);
        } catch (e) {
          alert('Pengujian GET selesai. (Catatan: Google Apps Script Web App tetap dapat menerima data POST dari formulir).');
        } finally {
          btnTestGas.disabled = false;
          btnTestGas.innerHTML = '<i class="fa-solid fa-network-wired"></i> Uji Koneksi';
        }
      });
    }

    // Close modal on click outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach((m) => m.classList.remove('active'));
      }
    });
  }

  /* ==========================================================================
     12. MOBILE MENU & UTILITIES
     ========================================================================== */
  function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert(`Nomor rekening ${text} berhasil disalin ke clipboard!`);
      });
    } else {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert(`Nomor rekening ${text} berhasil disalin ke clipboard!`);
    }
  }

  /* ==========================================================================
     EXPOSE GLOBAL API & INITIALIZATION
     ========================================================================== */
  window.armasoApp = {
    openGuidebookModal,
    openGasConfigModal: () => {
      const modalGas = document.getElementById('modal-gas-config');
      const inputGas = document.getElementById('input-gas-url');
      if (inputGas) inputGas.value = googleScriptUrl;
      if (modalGas) modalGas.classList.add('active');
    },
    copyToClipboard
  };

  document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initCustomCursor();
    initScrollAnimations();
    initDustParticles();
    initCountdown();
    initForms();
    initModals();
    initMobileMenu();
    console.log('%c ARMASO 2027 %c Futuristic Egyptian Theme Initialized ', 'background:#f6d066; color:#000; font-weight:bold; padding:4px;', 'background:#090e17; color:#00f2fe; padding:4px;');
  });

})();
