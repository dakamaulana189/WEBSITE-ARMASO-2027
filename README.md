# Website Resmi ARMASO 2027 (Egyptian Futuristic Edition)
**Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition**  
*Pondok Pesantren Modern Ar Rahmat Bojonegoro, Jawa Timur*

---

## 🏛️ Gambaran Umum & Konsep Visual
Website **ARMASO 2027** dirancang dengan konsep visual megah bertema **Egyptian Futuristic** — perpaduan kemegahan peradaban Mesir Kuno (emas firaun, obsidian hitam, siluet piramida, hieroglif bersinar) dan estetika cyber neon (cyan & amber). Ditujukan untuk peserta tingkat **SD/MI sederajat se-Jawa Bali**.

### ✨ Fitur Unggulan
1. **Animasi Kursor Interaktif**:
   - Kursor kustom berelemen lingkaran cahaya dan simbol Ankh / Eye of Horus minimalis dengan aura emas dan biru neon.
   - Hover effect dinamis (membesar, berputar lembut 45°, dan berubah warna ke neon turquoise) pada seluruh tombol, form, dan tautan.
   - Otomatis dinonaktifkan secara rapi di perangkat layar sentuh / mobile untuk menjaga kenyamanan navigasi.
2. **Smooth Scrolling & Scroll Reveal (Lenis Engine)**:
   - Gulir halaman ultra-halus (*buttery smooth momentum*) menggunakan integrasi pustaka modern Lenis.
   - Elemen teks, banner piramida cyber, kartu event, dan timeline muncul perlahan (*fade-up & parallax reveal*) saat pengguna menggulir ke bawah.
3. **Struktur Konten Sesuai Ketentuan**:
   - **Beranda**: Penjelasan lengkap ARMASO 2027, hitung mundur menuju 23 Januari 2027, komparasi biaya pendaftaran (Rp35.000 untuk Olimpiade & Rp50.000 untuk Futsal), dan total hadiah (Rp10 juta untuk Olimpiade & Rp20 juta untuk Futsal).
   - **Halaman Olimpiade (Matematika, IPA, IPS)**: Timeline khusus (Sabtu 23 Jan 2027 penyisihan & Minggu 24 Jan 2027 semifinal/final), tombol download Guidebook interaktif, formulir registrasi per bidang dengan upload bukti transfer langsung.
   - **Halaman Futsal**: Peraturan dan jalannya acara sistem gugur, timeline khusus (1 - 21 Jan 2027 setiap hari Minggu & final 24 Jan 2027), tombol download Guidebook, formulir registrasi tim & official dengan upload bukti transfer.
   - **Lokasi & Kontak**: Peta interaktif Pondok Pesantren Modern Ar Rahmat, Jl. Untung Suropati No. 48 Bojonegoro, Jawa Timur. Narahubung resmi: **Daka Maulana** (WhatsApp: `+62 821-4276-1856`, Instagram: `@dakamaulana`, GitHub: `https://github.com/dakamaulana189`).
4. **Integrasi Real-Time Google Spreadsheet (Google Apps Script)**:
   - Seluruh data registrasi dan bukti transfer otomatis tersimpan ke Google Spreadsheet secara real-time.
   - Bukti transfer disimpan otomatis ke folder Google Drive panitia dan link view langsung dicantumkan pada baris data spreadsheet.
   - Disediakan tombol konfirmasi otomatis ke WhatsApp Kak Daka Maulana setelah formulir terkirim.

---

## 📂 Struktur File Proyek

```
WEBSITE ARMASO BETA/
├── assets/
│   └── images/
│       ├── hero-pyramid.jpg     # Banner Piramida Futuristik Emas
│       ├── olympiad-temple.jpg   # Kuil Sains & Matematika Cyber
│       └── futsal-arena.jpg     # Arena Futsal Futuristik
├── css/
│   └── style.css                # Desain sistem Egyptian Futuristic, kursor, & animasi
├── js/
│   └── app.js                   # Logika navigasi, Lenis smooth scroll, form & GAS webhook
├── google-apps-script/
│   └── Code.gs                  # Kode backend untuk Google Spreadsheet & Drive
├── index.html                   # Halaman web semantik lengkap
└── README.md                    # Dokumentasi ini
```

---

## ⚙️ Panduan Menghubungkan ke Google Spreadsheet

Untuk mencatat pendaftaran langsung ke Google Spreadsheet milik panitia:

1. Buka [Google Drive](https://drive.google.com/) dan buat **Google Spreadsheet** baru. Beri judul: `DATABASE PENDAFTARAN ARMASO 2027`.
2. Di menu atas Spreadsheet, klik menu **Extensions (Ekstensi)** > **Apps Script**.
3. Hapus seluruh isi kode bawaan, lalu salin dan tempel kode dari file [`google-apps-script/Code.gs`](file:///c:/Antigravity/WEBSITE%20ARMASO%20BETA/google-apps-script/Code.gs).
4. Klik tombol **Save Project** (ikon disket) atau tekan `Ctrl + S`.
5. Klik tombol biru **Deploy (Terapkan)** di kanan atas > pilih **New deployment (Deployment baru)**.
6. Klik ikon roda gigi di sebelah kiri "Select type", lalu pilih **Web app (Aplikasi web)**.
7. Isi konfigurasi:
   - **Description**: `Webhook ARMASO 2027`
   - **Execute as**: `Me (email akun Anda)`
   - **Who has access**: `Anyone (Siapa saja)` *(Penting agar form di website dapat mengirim data)*.
8. Klik tombol **Deploy**. Jika muncul jendela izin akses Google, klik **Authorize access** > pilih akun Anda > klik **Advanced** > klik **Go to Untitled project (unsafe)** > klik **Allow**.
9. Salin URL yang diberikan pada kolom **Web app URL** (berakhiran `/exec`).
10. Di website ARMASO 2027, klik tombol **"Google Sheet Webhook"** di navbar atas (atau footer), tempelkan URL tersebut, lalu klik **"Simpan URL Webhook"**.
11. Selesai! Kini setiap kali ada yang mendaftar Olimpiade atau Futsal, datanya otomatis masuk rapi ke lembar kerja *Olimpiade* dan *Futsal*.

---

## 🚀 Menjalankan Secara Lokal
Website ini dibangun murni menggunakan standar web modern tanpa memerlukan proses *build* yang rumit:

```bash
# Menggunakan serve (Node.js)
npx serve .

# Atau menggunakan Python HTTP Server
python -m http.server 8080
```
Buka browser pada alamat `http://localhost:8080`.
Website juga siap di-deploy langsung ke **GitHub Pages**, **Vercel**, **Netlify**, atau **cPanel**.
