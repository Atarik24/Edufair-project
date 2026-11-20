/**
 * SCRIPT UTAMA: EDU FAIR & CAREER DAY 2026
 * Mencakup:
 * 1. Personalisasi Dinamis via URL Query Parameter (?to=...&kategori=...)
 * 2. Penanganan Form RSVP Interaktif
 * 3. Pembacaan File CSV (Fetch & FileReader API) dan Generator Link WhatsApp Blast
 * 4. Integrasi Google Sheets sebagai Backend RSVP (+ localStorage fallback)
 */

// =====================================================================
// ⚙️ KONFIGURASI: Paste URL Google Apps Script Web App di sini
// Kosongkan ("") jika belum setup → otomatis pakai localStorage saja
// =====================================================================
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxXC5Pn_fUoSNtg0jLcwwcgzds8rbeLjM6Qa5Fr-_NYhkOba0DBW9nja5O8Wxw-IWGL/exec";

// Data CSV default sebagai fallback otomatis apabila dibuka langsung via file:// (tanpa local web server)
const DEFAULT_CSV_DATA = `id,nama_tamu,instansi,kategori,no_whatsapp
1,Dr. Budi Santoso,Universitas Indonesia,Kampus,6282133416201
2,Ir. Siti Aminah,Institut Teknologi Bandung,Kampus,6282133416201
3,Rizky Pratama,PT Telkom Indonesia (Persero) Tbk,Perusahaan Mitra,6282133416201
4,Nadia Putri,GoTo Group,Perusahaan Mitra,6282133416201
5,Athar Waldan,Ikatan Alumni Angkatan 2024,Alumni,6282133416201
6,Dewi Lestari,Universitas Gadjah Mada,Kampus,6282133416201`;

document.addEventListener("DOMContentLoaded", () => {
    initPasswordGate();
    initInvitationPersonalization();
    initRSVPForm();
    initAdminPanel();
    initRSVPAdmin();
    initMobileNav();
});

/**
 * 0. Password Gate untuk halaman Admin
 */
function initPasswordGate() {
    const gate = document.getElementById("password-gate");
    const form = document.getElementById("password-form");
    const adminContent = document.getElementById("admin-content");
    const errorEl = document.getElementById("password-error");

    if (!gate || !form) return;

    // Cek apakah sudah login di session ini
    if (sessionStorage.getItem("admin_authenticated") === "true") {
        gate.style.display = "none";
        if (adminContent) adminContent.classList.remove("admin-content-hidden");
        return;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const passwordInput = document.getElementById("admin-password");
        const password = passwordInput.value;

        if (password === "ytta123") {
            sessionStorage.setItem("admin_authenticated", "true");
            gate.style.display = "none";
            if (adminContent) adminContent.classList.remove("admin-content-hidden");
        } else {
            errorEl.textContent = "❌ Password salah! Silakan coba lagi.";
            errorEl.style.display = "block";
            passwordInput.value = "";
            passwordInput.focus();
        }
    });
}

/**
 * Mobile Navigation Toggle (Hamburger Menu)
 */
function initMobileNav() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    // Jangan tambah hamburger jika sudah ada
    if (navbar.querySelector(".hamburger")) return;

    const navLinks = navbar.querySelector(".nav-links");
    if (!navLinks) return;

    // Buat tombol hamburger
    const hamburger = document.createElement("button");
    hamburger.className = "hamburger";
    hamburger.setAttribute("aria-label", "Toggle navigasi");
    hamburger.innerHTML = `<span></span><span></span><span></span>`;
    navbar.appendChild(hamburger);

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("nav-open");
        hamburger.classList.toggle("active");
    });

    // Tutup menu saat klik link
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("nav-open");
            hamburger.classList.remove("active");
        });
    });
}

/**
 * 1. Membaca Query Parameter pada halaman index.html
 * Contoh URL: index.html?to=Universitas+Negeri&kategori=Kampus
 */
function initInvitationPersonalization() {
    const guestNameEl = document.getElementById("guest-name");
    const guestCatEl = document.getElementById("guest-category");
    const rsvpInstansiInput = document.getElementById("rsvp-instansi");
    const rsvpKategoriInput = document.getElementById("rsvp-kategori");

    if (!guestNameEl || !guestCatEl) return;

    const params = new URLSearchParams(window.location.search);
    const toParam = params.get("to");
    const kategoriParam = params.get("kategori");

    if (toParam && toParam.trim() !== "") {
        guestNameEl.textContent = toParam.trim();
        if (rsvpInstansiInput) {
            rsvpInstansiInput.value = toParam.trim();
        }
    }

    if (kategoriParam && kategoriParam.trim() !== "") {
        guestCatEl.textContent = `Kategori: ${kategoriParam.trim()}`;
        if (rsvpKategoriInput) {
            rsvpKategoriInput.value = kategoriParam.trim();
        }
    }
}

/**
 * 2. Menangani submit Form RSVP di index.html
 */
function initRSVPForm() {
    const rsvpForm = document.getElementById("rsvp-form");
    const rsvpAlert = document.getElementById("rsvp-alert");

    if (!rsvpForm) return;

    rsvpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const instansi = document.getElementById("rsvp-instansi").value;
        const kategori = document.getElementById("rsvp-kategori").value;
        const status = document.getElementById("rsvp-status").value;
        const delegasi = document.getElementById("rsvp-delegasi").value;
        const catatan = document.getElementById("rsvp-catatan").value;

        const rsvpEntry = {
            id: Date.now(),
            waktu: new Date().toLocaleString("id-ID", { 
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit"
            }),
            instansi: instansi,
            kategori: kategori,
            status: status,
            delegasi: delegasi,
            catatan: catatan || "-"
        };

        // Simpan ke localStorage (sebagai backup/fallback)
        const rsvpData = JSON.parse(localStorage.getItem("edufair_rsvp") || "[]");
        rsvpData.push(rsvpEntry);
        localStorage.setItem("edufair_rsvp", JSON.stringify(rsvpData));

        // Kirim ke Google Sheets (jika URL sudah diisi)
        if (GOOGLE_SHEETS_URL) {
            fetch(GOOGLE_SHEETS_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(rsvpEntry)
            }).catch(err => console.warn("Gagal kirim ke Google Sheets:", err));
        }

        rsvpAlert.style.display = "block";
        rsvpAlert.innerHTML = `✅ Terima kasih! Konfirmasi kehadiran untuk <strong>${escapeHtml(instansi)}</strong> (${escapeHtml(kategori)}) dengan status <em>"${escapeHtml(status)}"</em> (${escapeHtml(delegasi)} delegasi) telah berhasil tercatat di sistem panitia.`;
        rsvpForm.reset();

        // Kembalikan nilai default dari query parameter jika ada
        initInvitationPersonalization();
    });
}

/**
 * 3. Inisialisasi Halaman Admin & Pembacaan CSV
 */
function initAdminPanel() {
    const tableBody = document.getElementById("guest-table-body");
    const fileInput = document.getElementById("csv-file-input");
    const resetBtn = document.getElementById("btn-reset-csv");

    if (!tableBody) return;

    // Coba muat file data-tamu.csv menggunakan fetch, jika diblokir CORS file:// gunakan fallback DEFAULT_CSV_DATA
    loadDefaultCSV(tableBody);

    // Event listener untuk upload file .csv menggunakan FileReader bawaan JS
    if (fileInput) {
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const csvText = e.target.result;
                const parsedData = parseCSV(csvText);
                renderGuestTable(parsedData, tableBody);
            };
            reader.readAsText(file);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (fileInput) fileInput.value = "";
            loadDefaultCSV(tableBody);
        });
    }
}

function loadDefaultCSV(tableBody) {
    fetch("data-tamu.csv")
        .then((response) => {
            if (!response.ok) throw new Error("Gagal memuat CSV via fetch");
            return response.text();
        })
        .then((csvText) => {
            const parsedData = parseCSV(csvText);
            renderGuestTable(parsedData, tableBody);
        })
        .catch(() => {
            // Fallback apabila dibuka langsung melalui protokol file:// di browser
            const parsedData = parseCSV(DEFAULT_CSV_DATA);
            renderGuestTable(parsedData, tableBody);
        });
}

/**
 * Fungsi Parser CSV Murni (Mendukung header id, nama_tamu, instansi, kategori, no_whatsapp)
 */
function parseCSV(csvText) {
    const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < headers.length) continue;

        const rowObj = {};
        headers.forEach((header, index) => {
            rowObj[header] = values[index] || "";
        });
        rows.push(rowObj);
    }
    return rows;
}

/**
 * Menampilkan daftar tamu ke dalam tabel Admin beserta tombol Blast WhatsApp
 */
function renderGuestTable(guests, tableBody) {
    tableBody.innerHTML = "";

    if (guests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Tidak ada data tamu ditemukan di file CSV.</td></tr>`;
        return;
    }

    // Dapatkan base URL menuju index.html
    const baseUrl = getInvitationBaseUrl();

    guests.forEach((guest) => {
        const recipientDisplay = `${guest.nama_tamu} - ${guest.instansi}`;
        const queryParams = new URLSearchParams({
            to: recipientDisplay,
            kategori: guest.kategori
        }).toString();

        const personalizedUrl = `${baseUrl}?${queryParams}`;
        const waLink = generateWhatsAppBlastLink(guest, personalizedUrl);
        const badgeClass = getCategoryBadgeClass(guest.kategori);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${escapeHtml(guest.id)}</strong></td>
            <td>${escapeHtml(guest.nama_tamu)}</td>
            <td><strong>${escapeHtml(guest.instansi)}</strong></td>
            <td><span class="badge-cat ${badgeClass}">${escapeHtml(guest.kategori)}</span></td>
            <td>${escapeHtml(guest.no_whatsapp)}</td>
            <td>
                <a href="index.html?${queryParams}" target="_blank" class="link-preview" title="Klik untuk uji buka undangan">
                    index.html?${escapeHtml(queryParams)}
                </a>
            </td>
            <td>
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
                    📲 Kirim Undangan WhatsApp
                </a>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

/**
 * Membuat tautan WhatsApp API (wa.me) dengan pesan otomatis dan link undangan terpersonalisasi
 */
function generateWhatsAppBlastLink(guest, personalizedUrl) {
    const cleanPhone = (guest.no_whatsapp || "").replace(/[^0-9]/g, "");
    const message = 
`Halo Yth. *${guest.nama_tamu}* dari *${guest.instansi}* (${guest.kategori}),

Kami dari Panitia *Edu Fair & Career Day 2026* mengundang Bapak/Ibu untuk hadir dan berpartisipasi dalam ajang pameran pendidikan & karir tahunan sekolah kami pada:

📅 Hari/Tanggal: Sabtu, 28 November 2026
⏰ Waktu: 08.00 - 15.30 WIB
📍 Tempat: Aula Utama & Hall Serbaguna Sekolah

Silakan buka tautan undangan digital eksklusif Anda serta lakukan konfirmasi kehadiran (RSVP) melalui link berikut:
${personalizedUrl}

Terima kasih atas perhatian dan kerja sama Bapak/Ibu.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

function getInvitationBaseUrl() {
    const currentHref = window.location.href.split("?")[0];
    if (currentHref.endsWith("admin.html")) {
        return currentHref.replace(/admin\.html$/, "index.html");
    }
    const lastSlash = currentHref.lastIndexOf("/");
    return currentHref.substring(0, lastSlash + 1) + "index.html";
}

function getCategoryBadgeClass(kategori = "") {
    const lower = kategori.toLowerCase();
    if (lower.includes("kampus") || lower.includes("universitas")) return "badge-kampus";
    if (lower.includes("mitra") || lower.includes("perusahaan")) return "badge-mitra";
    return "badge-alumni";
}

function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * 4. RSVP Admin — Menampilkan, Export, dan Hapus data RSVP
 *    Prioritas: Google Sheets → localStorage fallback
 */
function initRSVPAdmin() {
    const rsvpTableBody = document.getElementById("rsvp-table-body");
    const rsvpCountEl = document.getElementById("rsvp-count");
    const exportBtn = document.getElementById("btn-export-rsvp");
    const clearBtn = document.getElementById("btn-clear-rsvp");
    const refreshBtn = document.getElementById("btn-refresh-rsvp");

    if (!rsvpTableBody) return;

    // Indikator sumber data
    const sourceIndicator = document.getElementById("rsvp-source");

    // Load data pertama kali
    loadAndRenderRSVP();

    // Tombol refresh
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            loadAndRenderRSVP();
        });
    }

    // Export CSV
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const data = getCurrentData();
            if (data.length === 0) {
                alert("Belum ada data RSVP untuk di-export.");
                return;
            }

            const headers = "No,Waktu Kirim,Nama/Instansi,Kategori,Status Kehadiran,Jumlah Delegasi,Catatan";
            const rows = data.map((r, i) => 
                `${i + 1},"${r.waktu}","${r.instansi}","${r.kategori}","${r.status}",${r.delegasi},"${r.catatan}"`
            );
            const csvContent = [headers, ...rows].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `RSVP_EduFair2026_${new Date().toISOString().slice(0,10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    // Hapus semua data
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            const data = getCurrentData();
            if (data.length === 0) {
                alert("Tidak ada data RSVP untuk dihapus.");
                return;
            }
            if (confirm(`Yakin ingin menghapus semua ${data.length} data RSVP? Tindakan ini tidak bisa dibatalkan.`)) {
                // Hapus dari localStorage
                localStorage.removeItem("edufair_rsvp");

                // Hapus dari Google Sheets jika tersedia
                if (GOOGLE_SHEETS_URL) {
                    fetch(GOOGLE_SHEETS_URL, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({ action: "clear" })
                    }).catch(err => console.warn("Gagal menghapus data di Google Sheets:", err));
                }

                window._rsvpCache = [];
                renderRSVPTable([]);
            }
        });
    }

    /**
     * Load data dari Google Sheets (prioritas) atau localStorage (fallback)
     */
    function loadAndRenderRSVP() {
        // Tampilkan loading
        rsvpTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted); padding: 2rem;">⏳ Memuat data RSVP...</td></tr>`;

        if (GOOGLE_SHEETS_URL) {
            fetch(GOOGLE_SHEETS_URL)
                .then(res => res.json())
                .then(result => {
                    if (result.success && result.data) {
                        window._rsvpCache = result.data;
                        renderRSVPTable(result.data);
                        if (sourceIndicator) {
                            sourceIndicator.textContent = "☁️ Google Sheets";
                            sourceIndicator.className = "rsvp-source-badge source-cloud";
                        }
                    } else {
                        throw new Error("Invalid response");
                    }
                })
                .catch(err => {
                    console.warn("Gagal ambil data dari Google Sheets, fallback ke localStorage:", err);
                    loadFromLocalStorage();
                });
        } else {
            loadFromLocalStorage();
        }
    }

    function loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem("edufair_rsvp") || "[]");
        window._rsvpCache = data;
        renderRSVPTable(data);
        if (sourceIndicator) {
            sourceIndicator.textContent = "💾 localStorage";
            sourceIndicator.className = "rsvp-source-badge source-local";
        }
    }

    function getCurrentData() {
        return window._rsvpCache || JSON.parse(localStorage.getItem("edufair_rsvp") || "[]");
    }

    function renderRSVPTable(data) {
        // Update counter
        if (rsvpCountEl) {
            rsvpCountEl.textContent = `${data.length} respons masuk`;
        }

        if (data.length === 0) {
            rsvpTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted); padding: 2rem;">Belum ada data konfirmasi kehadiran (RSVP) yang masuk.</td></tr>`;
            return;
        }

        rsvpTableBody.innerHTML = "";
        data.forEach((rsvp, index) => {
            const statusClass = getStatusBadgeClass(rsvp.status);
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${index + 1}</strong></td>
                <td style="white-space: nowrap; font-size: 0.82rem;">${escapeHtml(rsvp.waktu)}</td>
                <td><strong>${escapeHtml(rsvp.instansi)}</strong></td>
                <td><span class="badge-cat ${getCategoryBadgeClass(rsvp.kategori)}">${escapeHtml(rsvp.kategori)}</span></td>
                <td><span class="badge-status ${statusClass}">${escapeHtml(rsvp.status)}</span></td>
                <td style="text-align: center;"><strong>${escapeHtml(String(rsvp.delegasi))}</strong> orang</td>
                <td style="font-size: 0.85rem; max-width: 200px;">${escapeHtml(rsvp.catatan)}</td>
                <td>
                    <button class="btn btn-delete-rsvp" onclick="deleteRSVP('${rsvp.id}')" title="Hapus data ini">🗑️</button>
                </td>
            `;
            rsvpTableBody.appendChild(tr);
        });
    }

    // Jadikan fungsi bisa dipanggil global
    window._renderRSVPTable = renderRSVPTable;
    window._loadAndRenderRSVP = loadAndRenderRSVP;
}

/**
 * Hapus satu data RSVP
 */
function deleteRSVP(id) {
    if (!confirm("Hapus data RSVP ini?")) return;

    // Hapus dari localStorage
    let data = JSON.parse(localStorage.getItem("edufair_rsvp") || "[]");
    data = data.filter(r => String(r.id) !== String(id));
    localStorage.setItem("edufair_rsvp", JSON.stringify(data));

    // Hapus dari Google Sheets jika tersedia
    if (GOOGLE_SHEETS_URL) {
        fetch(GOOGLE_SHEETS_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ action: "delete", id: id })
        }).catch(err => console.warn("Gagal hapus dari Google Sheets:", err));
    }

    // Refresh tampilan
    if (window._loadAndRenderRSVP) {
        // Jika pakai Google Sheets, re-fetch setelah delay kecil agar Sheets sempat proses
        if (GOOGLE_SHEETS_URL) {
            setTimeout(() => window._loadAndRenderRSVP(), 1000);
        } else {
            window._rsvpCache = data;
            if (window._renderRSVPTable) window._renderRSVPTable(data);
        }
    }
}

function getStatusBadgeClass(status = "") {
    const lower = status.toLowerCase();
    if (lower.includes("booth")) return "badge-hadir-booth";
    if (lower.includes("pembicara") || lower.includes("vip")) return "badge-hadir-vip";
    if (lower.includes("berhalangan")) return "badge-tidak-hadir";
    return "badge-alumni";
}
