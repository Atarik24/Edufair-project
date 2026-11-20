# 🎓 Edu Fair & Career Day 2026 — Official Digital Invitation & Admin System

Website undangan digital resmi dan panel blast peserta untuk kegiatan **Edu Fair & Career Day 2026**. Proyek ini dilengkapi dengan personalisasi nama tamu dinamis via URL, generator blast WhatsApp, formulir konfirmasi kehadiran (RSVP), panel admin terproteksi password, dan integrasi Google Sheets sebagai backend database cloud.

---

## 🌟 Fitur Utama

1. **Undangan Digital Interaktif (`index.html`)**
   - Personalisasi dinamis nama tamu & kategori melalui URL query parameter:
     `index.html?to=Nama+Tamu+-+Nama+Instansi&kategori=Kampus`
   - Informasi lengkap: Tema, Waktu & Tempat, Susunan Acara (Rundown), Fasilitas Booth, dan Peta Lokasi Google Maps.
   - Formulir Konfirmasi Kehadiran (RSVP) interaktif.
   - **Desain Responsive Penuh** untuk Desktop, Tablet, dan Smartphone (dilengkapi Mobile Hamburger Navigation).

2. **Panel Admin Blast & Rekap RSVP (`admin.html`)**
   - **Proteksi Password Gate:** Akses dikunci menggunakan password **`ytta123`**.
   - **Manajemen Tamu CSV:** Membaca data tamu dari file `data-tamu.csv` atau upload file CSV kustom.
   - **One-Click WhatsApp Blast:** Menghasilkan link `wa.me/6282133416201` lengkap dengan template pesan undangan terpersonalisasi.
   - **Rekapitulasi RSVP Masuk:**
     - Data RSVP otomatis tersimpan dan muncul di tabel admin.
     - Terhubung dengan **Google Sheets** (database cloud) dan fallback otomatis ke `localStorage`.
     - Indikator sumber data (`☁️ Google Sheets` atau `💾 localStorage`).
     - Tombol **🔄 Refresh** data langsung dari cloud.
     - Tombol **📥 Export CSV** untuk download rekap tamu yang hadir.
     - Tombol **🗑️ Hapus Data** per baris atau sekaligus.

---

## 📱 Nomor WhatsApp Tujuan Blast
Semua tautan WhatsApp blast telah diatur ke nomor panitia:
- **082133416201** (`https://wa.me/6282133416201`)

---

## 🚀 Panduan Deploy ke GitHub Pages

1. **Buat Repository Baru di GitHub:**
   - Masuk ke akun [GitHub](https://github.com) Anda.
   - Klik **New Repository**, beri nama (contoh: `edufair-invitation-2026`).
   - Pilih **Public**.

2. **Upload / Push File:**
   Upload seluruh file proyek ini ke branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: EduFair Invitation 2026"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```

3. **Aktifkan GitHub Pages:**
   - Masuk ke menu **Settings** repository di GitHub.
   - Pilih menu **Pages** di sidebar kiri.
   - Pada bagian **Build and deployment > Branch**, pilih branch **`main`** dan folder **`/(root)`**.
   - Klik **Save**.
   - Tunggu 1–2 menit, website Anda akan aktif di URL:
     `https://USERNAME.github.io/REPO_NAME/`

---

## ☁️ Menghubungkan ke Google Sheets (Database Cloud)

Agar data RSVP dari berbagai orang/perangkat terkumpul secara terpusat:

1. Buka [Google Sheets](https://sheets.google.com) dan buat spreadsheet baru.
2. Klik menu **Extensions** > **Apps Script**.
3. Hapus kode bawaan, lalu salin seluruh isi file [`Code.gs`](Code.gs) ke editor tersebut.
4. Klik **Deploy** > **New deployment**.
5. Pilih tipe **Web app**:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
6. Klik **Deploy**, izinkan akses akun Google (*Allow*).
7. Salin **Web app URL** yang didapat (format: `https://script.google.com/macros/s/.../exec`).
8. Buka file [`script.js`](script.js), tempel URL pada baris ke-15:
   ```javascript
   const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/GANTI_DENGAN_URL_ANDA/exec";
   ```
9. Simpan perubahan dan lakukan `git push` kembali ke GitHub.

> **Catatan:** Jika `GOOGLE_SHEETS_URL` masih kosong, sistem akan tetap berjalan normal dengan menyimpan data secara lokal di browser (`localStorage`).

---

## 🔑 Informasi Akses Admin

| Halaman | Akses | Keterangan |
|---|---|---|
| Undangan | `index.html` | Terbuka untuk umum |
| Panel Admin | `admin.html` | Password: **`ytta123`** |

---

## 📂 Struktur File

```
├── index.html       # Halaman utama undangan digital & form RSVP
├── admin.html       # Panel admin blast WhatsApp & rekap RSVP
├── script.js        # Logika aplikasi, personalisasi URL, RSVP, & API
├── style.css        # Desain visual & layout responsive (mobile/tablet/desktop)
├── data-tamu.csv    # File data tamu default
├── Code.gs          # Script backend untuk Google Apps Script (Google Sheets)
└── README.md        # Panduan penggunaan & instalasi
```

