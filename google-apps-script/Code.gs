/**
 * ============================================================================
 * ARMASO 2027 - GOOGLE APPS SCRIPT BACKEND WEBHOOK
 * Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition 2027
 * ============================================================================
 * 
 * PANDUAN PEMASANGAN CEPAT:
 * 1. Buka Google Drive (drive.google.com), buat Google Spreadsheet baru.
 * 2. Beri nama file Spreadsheet: "DATABASE PENDAFTARAN ARMASO 2027"
 * 3. Di menu atas Spreadsheet, klik: Extensions (Ekstensi) > Apps Script.
 * 4. Hapus semua kode default, lalu salin dan tempel (copy-paste) seluruh isi file ini.
 * 5. Klik icon Disket (Save project) atau Ctrl + S.
 * 6. Klik tombol "Deploy" (Terapkan) berwarna biru di kanan atas > "New deployment" (Deployment baru).
 * 7. Pilih tipe: "Web app" (Aplikasi web).
 * 8. Konfigurasi:
 *    - Description: "Webhook Pendaftaran Armaso 2027"
 *    - Execute as: "Me" (Email Google Anda)
 *    - Who has access: "Anyone" (Siapa saja, penting agar form website dapat mengirim data)
 * 9. Klik "Deploy", lalu klik "Authorize access" (Izinkan akses akun Anda).
 * 10. Salin "Web app URL" (URL berakhiran /exec).
 * 11. Buka website Armaso 2027, klik menu "Pengaturan Sheet" atau ubah variabel
 *     GOOGLE_SCRIPT_URL di file `js/app.js` dengan URL yang baru saja Anda salin.
 * ============================================================================
 */

function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Olimpiade
  var olymSheet = ss.getSheetByName("Olimpiade");
  if (!olymSheet) {
    olymSheet = ss.insertSheet("Olimpiade");
    var headersOlym = [
      "ID Registrasi",
      "Waktu Daftar",
      "Kategori Lomba",
      "Bidang",
      "Nama Lengkap",
      "Asal Sekolah",
      "Nomor WhatsApp",
      "Biaya Pendaftaran",
      "Status Pembayaran",
      "Link Bukti Bayar (Google Drive)",
      "Catatan Panitia"
    ];
    olymSheet.getRange(1, 1, 1, headersOlym.length).setValues([headersOlym]);
    olymSheet.getRange(1, 1, 1, headersOlym.length)
      .setBackground("#1a1505")
      .setFontColor("#f6d066")
      .setFontWeight("bold");
    olymSheet.setFrozenRows(1);
  }

  // Sheet 2: Futsal
  var futsalSheet = ss.getSheetByName("Futsal");
  if (!futsalSheet) {
    futsalSheet = ss.insertSheet("Futsal");
    var headersFutsal = [
      "ID Registrasi",
      "Waktu Daftar",
      "Kategori Lomba",
      "Asal Sekolah / Nama Tim",
      "Nama Official / Pelatih",
      "Nomor WhatsApp",
      "Biaya Pendaftaran",
      "Status Pembayaran",
      "Link Bukti Bayar (Google Drive)",
      "Catatan Panitia"
    ];
    futsalSheet.getRange(1, 1, 1, headersFutsal.length).setValues([headersFutsal]);
    futsalSheet.getRange(1, 1, 1, headersFutsal.length)
      .setBackground("#05161c")
      .setFontColor("#00f2fe")
      .setFontWeight("bold");
    futsalSheet.setFrozenRows(1);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Kunci proses selama 30 detik untuk mencegah race-condition jika banyak pendaftar bersamaan
    lock.waitLock(30000);
    
    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var category = (data.kategori || "Olimpiade").toLowerCase();
    var isFutsal = category.indexOf("futsal") !== -1;
    var targetSheetName = isFutsal ? "Futsal" : "Olimpiade";
    
    var sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) {
      setupSpreadsheet();
      sheet = ss.getSheetByName(targetSheetName);
    }

    // Upload Bukti Pembayaran ke Google Drive jika ada
    var fileUrl = "Tidak ada lampiran";
    if (data.fileBase64 && data.fileName) {
      try {
        var folderName = "Bukti Pembayaran Armaso 2027";
        var folders = DriveApp.getFoldersByName(folderName);
        var folder;
        if (folders.hasNext()) {
          folder = folders.next();
        } else {
          folder = DriveApp.createFolder(folderName);
        }

        var contentType = data.fileType || "image/jpeg";
        var base64Data = data.fileBase64;
        if (base64Data.indexOf("base64,") !== -1) {
          base64Data = base64Data.split("base64,")[1];
        }

        var decoded = Utilities.base64Decode(base64Data);
        var cleanFileName = (data.regId || "ARM") + "_" + (data.nama || data.sekolah || "Peserta") + "_" + data.fileName;
        var blob = Utilities.newBlob(decoded, contentType, cleanFileName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
      } catch (uploadError) {
        fileUrl = "Gagal upload Drive: " + uploadError.toString();
      }
    }

    var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy HH:mm:ss");
    var regId = data.regId || ("ARM-" + (isFutsal ? "FUT" : "OLY") + "-" + Math.floor(10000 + Math.random() * 90000));

    var newRow = [];
    if (isFutsal) {
      newRow = [
        regId,
        timestamp,
        "Kompetisi Futsal",
        data.sekolah || data.namaTim || "-",
        data.official || data.namaPelatih || "-",
        data.whatsapp || "-",
        "Rp 50.000",
        "Menunggu Verifikasi",
        fileUrl,
        data.catatan || ""
      ];
    } else {
      newRow = [
        regId,
        timestamp,
        "Olimpiade",
        data.bidang || "Matematika",
        data.nama || "-",
        data.sekolah || "-",
        data.whatsapp || "-",
        "Rp 35.000",
        "Menunggu Verifikasi",
        fileUrl,
        data.catatan || ""
      ];
    }

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data pendaftaran berhasil tersimpan di Google Spreadsheet!",
      regId: regId,
      timestamp: timestamp,
      sheet: targetSheetName,
      fileUrl: fileUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Google Apps Script Armaso 2027 Webhook berjalan aktif!",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
