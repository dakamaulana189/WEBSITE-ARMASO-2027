/**
 * ============================================================================
 * ARMASO 2027 - GOOGLE APPS SCRIPT WEBHOOK BACKEND & POSTGRESQL SYNC HOOK
 * Ar-Rahmat Mathematic, Science, Social Olympiad & Sport Competition 2027
 * ============================================================================
 * 
 * PANDUAN DEPLOYMENT:
 * 1. Buka Google Drive (drive.google.com), buat Google Spreadsheet baru: "DATABASE PENDAFTARAN ARMASO 2027"
 * 2. Klik menu: Ekstensi > Apps Script.
 * 3. Hapus kode default, tempel seluruh kode ini, lalu simpan (Ctrl + S).
 * 4. Klik "Deploy" (Terapkan) > "New deployment" (Deployment baru) > Tipe: "Web app" (Aplikasi web).
 * 5. Konfigurasi:
 *    - Description: "Webhook ARMASO 2027 Classic Edition"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Penting agar web form dapat mengirim data tanpa login)
 * 6. Klik "Deploy", izinkan akses Google Account ("Authorize access" > Advanced > Go to project).
 * 7. Salin Web App URL (berakhiran /exec) dan tempel di website ARMASO 2027 via tombol "Google Sheet Webhook".
 * ============================================================================
 */

// OPTIONAL: URL Endpoint backend PostgreSQL jika ingin sinkronisasi real-time otomatis
var POSTGRES_INGEST_URL = ""; // Contoh: "https://api.domain-anda.com/api/webhooks/armaso"

/**
 * Inisialisasi Lembar Kerja Google Spreadsheet (Classic & Majestic Egyptian Styling)
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
      "Bidang Lomba",
      "Nama Lengkap",
      "Asal Sekolah",
      "Nomor WhatsApp",
      "Biaya Pendaftaran",
      "Status Pembayaran",
      "Link Bukti Transfer (Google Drive)",
      "Catatan Tambahan"
    ];
    olymSheet.getRange(1, 1, 1, headersOlym.length).setValues([headersOlym]);
    olymSheet.getRange(1, 1, 1, headersOlym.length)
      .setBackground("#1c150e") // Dark Egyptian Ebony
      .setFontColor("#f6d066")  // Royal Gold
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    olymSheet.setFrozenRows(1);
    olymSheet.autoResizeColumns(1, headersOlym.length);
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
      "Nomor WhatsApp Official",
      "Biaya Pendaftaran",
      "Status Pembayaran",
      "Link Bukti Transfer (Google Drive)",
      "Catatan Tambahan"
    ];
    futsalSheet.getRange(1, 1, 1, headersFutsal.length).setValues([headersFutsal]);
    futsalSheet.getRange(1, 1, 1, headersFutsal.length)
      .setBackground("#1c150e")
      .setFontColor("#f6d066")
      .setFontWeight("bold")
      .setHorizontalAlignment("center");
    futsalSheet.setFrozenRows(1);
    futsalSheet.autoResizeColumns(1, headersFutsal.length);
  }
}

/**
 * Handle HTTP POST Request (Form Submission)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Kunci selama 30 detik untuk mencegah konflik concurrent request
    lock.waitLock(30000);

    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
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

    // 1. Simpan Bukti Pembayaran ke Google Drive
    var fileUrl = "Tidak ada lampiran";
    if (data.fileBase64 && data.fileName) {
      try {
        var folderName = "Bukti Pembayaran Armaso 2027";
        var folders = DriveApp.getFoldersByName(folderName);
        var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

        var contentType = data.fileType || "image/jpeg";
        var base64Data = data.fileBase64;
        if (base64Data.indexOf("base64,") !== -1) {
          base64Data = base64Data.split("base64,")[1];
        }

        var decoded = Utilities.base64Decode(base64Data);
        var cleanFileName = (data.regId || "ARM") + "_" + (data.nama || data.sekolah || "Peserta").replace(/[^a-zA-Z0-9_-]/g, "_") + "_" + data.fileName;
        var blob = Utilities.newBlob(decoded, contentType, cleanFileName);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
      } catch (uploadError) {
        fileUrl = "Gagal upload Drive: " + uploadError.toString();
      }
    }

    // 2. Format Timestamp & ID
    var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy HH:mm:ss");
    var regId = data.regId || ("ARM-" + (isFutsal ? "FUT" : "OLY") + "-" + Math.floor(10000 + Math.random() * 90000));

    // 3. Masukkan Baris Baru ke Google Sheet
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

    // 4. Hook Forwarding ke Backend PostgreSQL (Jika POSTGRES_INGEST_URL dikonfigurasi)
    if (POSTGRES_INGEST_URL && POSTGRES_INGEST_URL.length > 5) {
      try {
        var pgPayload = {
          regId: regId,
          timestamp: timestamp,
          category: isFutsal ? "FUTSAL" : "OLIMPIADE",
          bidang: data.bidang || null,
          nama: data.nama || null,
          sekolah: data.sekolah || data.namaTim || null,
          official: data.official || null,
          whatsapp: data.whatsapp || null,
          biaya: isFutsal ? 50000 : 35000,
          status: "Menunggu Verifikasi",
          fileUrl: fileUrl,
          catatan: data.catatan || null
        };

        UrlFetchApp.fetch(POSTGRES_INGEST_URL, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(pgPayload),
          muteHttpExceptions: true
        });
      } catch (pgError) {
        Logger.log("Forward to PostgreSQL warning: " + pgError.toString());
      }
    }

    // Response Sukses
    var output = {
      status: "success",
      message: "Data pendaftaran ARMASO 2027 berhasil tersimpan di Google Spreadsheet & Drive!",
      regId: regId,
      timestamp: timestamp,
      sheet: targetSheetName,
      fileUrl: fileUrl
    };

    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle HTTP GET Request (Health Check)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "ARMASO 2027 Webhook Service",
    theme: "Classic & Majestic Egyptian",
    sheets: ["Olimpiade", "Futsal"],
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
