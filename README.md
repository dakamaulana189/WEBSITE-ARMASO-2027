# Website Resmi ARMASO 2027 (Classic & Majestic Egyptian Edition)
**Ar-Rahmat Mathematic, Science, Social Olympiad, and Sport Competition**  
*Pondok Pesantren Modern Ar Rahmat Bojonegoro, Jawa Timur*

---

## 🏛️ Gambaran Umum & Konsep Visual

Website resmi **ARMASO 2027** mengusung tema **Classic & Majestic Egyptian** yang megah, sakral, dan otentik. Terinspirasi dari kejayaan peradaban Mesir Kuno dengan palet warna emas Firaun (`#f6d066`), batu obsidian, dan batu pasir hangat cokelat tua, bebas dari efek neon/futuristik yang mengganggu. 

Ditujukan untuk peserta tingkat **SD/MI sederajat se-Jawa Bali** dalam dua rumpun kompetisi bergengsi:
1. **Olimpiade Akademik**: Matematika, IPA (*Science*), dan IPS (*Social*).
2. **Turnamen Futsal Putra**: Kompetisi olahraga sistem gugur antar sekolah.

---

## 💎 Struktur Halaman & Fitur Utama

1. **Beranda Utama (`index.html`)**:
   - Hero banner megah berlatar Piramida Giza dan Sphinx klasik saat matahari terbenam emas (*golden sunset*).
   - Penjelasan ringkas mengenai ARMASO 2027 dan countdown timer menuju 23 Januari 2027.
   - Komparasi Biaya Pendaftaran (**Olimpiade Rp 35.000**, **Futsal Rp 50.000**) dan Total Hadiah (**Olimpiade Rp 10 Juta**, **Futsal Rp 20 Juta**).
   - Navigasi modular langsung menuju sub-halaman `olimpiade.html` dan `futsal.html`.
   - Profil Pondok Pesantren Modern Ar Rahmat Bojonegoro.
   - Footer lengkap berisi:
     - Lokasi: *Pondok Pesantren Modern Ar Rahmat, Jl. Untung Suropati No. 48 Bojonegoro, Jawa Timur*.
     - Kontak WhatsApp Panitia: **Daka Maulana (+62 821-4276-1856)**.
     - Instagram: **`@_dakamaulana_`**.
     - GitHub: **`https://github.com/dakamaulana189`**.

2. **Sub-Halaman Olimpiade (`olimpiade.html`)**:
   - Tiga bidang lomba: **Matematika**, **IPA (Science)**, dan **IPS (Social)**.
   - Timeline Khusus:
     - **Babak Penyisihan**: Sabtu, 23 Januari 2027.
     - **Babak Semifinal & Final**: Minggu, 24 Januari 2027.
   - Tombol unduh file *Guidebook* (Petunjuk Teknis & Silabus).
   - Formulir pendaftaran online terintegrasi dengan validasi ketat dan drag & drop file upload bukti transfer (Max 5MB, format JPG/PNG/WEBP).
   - Modal konfirmasi sukses dengan kode registrasi unik dan tombol otomatis konfirmasi WhatsApp ke Kak Daka Maulana.

3. **Sub-Halaman Futsal (`futsal.html`)**:
   - Penjelasan regulasi pertandingan, durasi, komposisi tim (5 inti + 5 cadangan + 2 official), dan format sistem gugur (*Single Elimination*).
   - Timeline Khusus:
     - **Babak Penyisihan & Perempat Final**: 1 - 21 Januari 2027 (setiap hari Minggu).
     - **Babak Semifinal & Grand Final**: Minggu, 24 Januari 2027 di Sport Arena Ar Rahmat Bojonegoro.
   - Tombol unduh file *Guidebook* regulasi futsal.
   - Formulir registrasi tim & official dengan upload bukti transfer Rp 50.000,-.

4. **Integrasi Backend Ganda (Google Apps Script & PostgreSQL)**:
   - Form submission otomatis masuk ke Google Spreadsheet dan file bukti transfer otomatis tersimpan rapi di folder Google Drive panitia.
   - Skema database PostgreSQL lengkap di [`database/schema.sql`](file:///c:/Antigravity/WEBSITE%20ARMASO%20BETA/database/schema.sql) dan modul sinkronisasi Node.js di [`database/sync_service.js`](file:///c:/Antigravity/WEBSITE%20ARMASO%20BETA/database/sync_service.js).
   - Logika pembacaan Base64 yang tahan error dengan state management file yang terisolasi.

---

## 📂 Struktur Direktori Proyek

```
WEBSITE ARMASO BETA/
├── assets/
│   └── images/
│       ├── hero-pyramid.jpg          # Kemegahan Piramida Klasik Emas (Beranda)
│       ├── olympiad-temple.jpg        # Kuil Kebijaksanaan & Sains Klasik (Olimpiade)
│       └── futsal-arena.jpg          # Arena Koloseum Olahraga Klasik (Futsal)
├── css/
│   └── style.css                     # Sistem Desain Classic & Majestic Egyptian
├── js/
│   ├── app.js                        # Kontroler UI, Navbar Mobile, Timer, & Guidebook
│   └── registration.js               # Mesin Form, Base64 Uploader, GAS Webhook, & WA Bridge
├── database/
│   ├── schema.sql                    # Skema DDL Database PostgreSQL
│   └── sync_service.js               # Modul Sinkronisasi Node.js / PostgreSQL
├── google-apps-script/
│   └── Code.gs                       # Webhook Google Spreadsheet & Google Drive
├── index.html                        # Beranda Utama
├── olimpiade.html                    # Sub-Halaman Olimpiade SD/MI
├── futsal.html                       # Sub-Halaman Kompetisi Futsal
└── README.md                         # Dokumentasi Proyek
```

---

## ⚙️ Panduan Menghubungkan ke Google Spreadsheet

1. Buka [Google Drive](https://drive.google.com/) dan buat **Google Spreadsheet** baru dengan nama: `DATABASE PENDAFTARAN ARMASO 2027`.
2. Di menu atas, pilih **Ekstensi** > **Apps Script**.
3. Salin seluruh isi berkas [`google-apps-script/Code.gs`](file:///c:/Antigravity/WEBSITE%20ARMASO%20BETA/google-apps-script/Code.gs), tempel di editor Apps Script, dan simpan (`Ctrl + S`).
4. Klik tombol **Deploy** (Terapkan) berwarna biru di kanan atas > **New deployment**.
5. Pilih tipe **Web app** (Aplikasi web) dengan pengaturan:
   - **Description**: `Webhook ARMASO 2027 Classic`
   - **Execute as**: `Me (Email Anda)`
   - **Who has access**: `Anyone (Siapa saja)`
6. Klik **Deploy**, berikan izin akses (*Authorize access*), lalu salin URL Web app (berakhiran `/exec`).
7. Pada website ARMASO 2027, klik tombol **"Google Sheet Webhook"** di navbar atas dan tempelkan URL tersebut.

---

## 🐘 Penggunaan Database PostgreSQL

Jika panitia ingin menyimpan atau menyinkronkan data langsung ke PostgreSQL:
1. Impor skema tabel:
   ```bash
   psql -U postgres -d nama_database -f database/schema.sql
   ```
2. Jalankan server ingest webhook / sinkronisasi:
   ```bash
   node database/sync_service.js
   ```

---

## 🚀 Menjalankan Secara Lokal

Website ini dibangun murni menggunakan standar web modern tanpa build tool rumit:

```bash
# Menggunakan Python
python -m http.server 8080

# Atau menggunakan Node.js serve
npx -y serve .
```

Akses melalui browser di: `http://localhost:8080`.
