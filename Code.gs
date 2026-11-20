/**
 * ============================================================
 * GOOGLE APPS SCRIPT — Backend RSVP Edu Fair & Career Day 2026
 * ============================================================
 * 
 * CARA PAKAI:
 * 1. Buka Google Sheets baru → Extensions → Apps Script
 * 2. Hapus semua kode default, paste SEMUA kode ini
 * 3. Klik "Deploy" → "New deployment"
 * 4. Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Klik "Deploy", copy URL-nya
 * 6. Paste URL ke script.js (baris GOOGLE_SHEETS_URL)
 */

const SHEET_NAME = "RSVP_Data";

/**
 * Inisialisasi sheet dengan header saat pertama kali
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Set headers jika sheet kosong
  if (sheet.getLastRow() === 0) {
    const headers = ["ID", "Waktu Kirim", "Nama / Instansi", "Kategori", "Status Kehadiran", "Jumlah Delegasi", "Catatan"];
    sheet.appendRow(headers);
    
    // Format header
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1e3a8a");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    
    // Auto-resize kolom
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  
  return sheet;
}

/**
 * GET — Ambil semua data RSVP (dipanggil oleh Admin Panel)
 */
function doGet(e) {
  try {
    const sheet = setupSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return createJsonResponse({ success: true, data: [] });
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    const rows = data.map(row => ({
      id: row[0],
      waktu: row[1],
      instansi: row[2],
      kategori: row[3],
      status: row[4],
      delegasi: row[5],
      catatan: row[6]
    }));
    
    return createJsonResponse({ success: true, data: rows, total: rows.length });
    
  } catch (error) {
    return createJsonResponse({ success: false, error: error.message });
  }
}

/**
 * POST — Simpan data RSVP baru atau hapus data
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = setupSheet();
    
    // Aksi: hapus satu data
    if (payload.action === "delete" && payload.id) {
      return deleteRow(sheet, payload.id);
    }
    
    // Aksi: hapus semua data
    if (payload.action === "clear") {
      return clearAllRows(sheet);
    }
    
    // Aksi default: tambah data baru
    sheet.appendRow([
      payload.id || Date.now(),
      payload.waktu || new Date().toLocaleString("id-ID"),
      payload.instansi || "",
      payload.kategori || "",
      payload.status || "",
      payload.delegasi || "",
      payload.catatan || "-"
    ]);
    
    return createJsonResponse({ success: true, message: "Data RSVP berhasil disimpan!" });
    
  } catch (error) {
    return createJsonResponse({ success: false, error: error.message });
  }
}

/**
 * Hapus satu baris berdasarkan ID
 */
function deleteRow(sheet, targetId) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === String(targetId)) {
      sheet.deleteRow(i + 1);
      return createJsonResponse({ success: true, message: "Data berhasil dihapus." });
    }
  }
  
  return createJsonResponse({ success: false, error: "Data tidak ditemukan." });
}

/**
 * Hapus semua data (kecuali header)
 */
function clearAllRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return createJsonResponse({ success: true, message: "Semua data RSVP berhasil dihapus." });
}

/**
 * Helper: Buat response JSON dengan CORS headers
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

