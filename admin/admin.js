const API_URL = "https://script.google.com/macros/s/AKfycbyC-z9dsRgUrNB4DH7MbPA3J3-u57aJMNnhqOFxX2_anvxM4aq0pwacarqBQy4--8zp/exec";

const ADMIN_USER = "boncel";
const ADMIN_PASS = "Annisa2000_";

let guests = [];
let galleryItems = [];
let wishes = [];

document.addEventListener("DOMContentLoaded", () => {
  bindUI();

  if (localStorage.getItem("zentih_admin_login") === "1") {
    showApp();
    refreshAll();
  } else {
    showLogin();
  }
});

function bindUI() {
  document.getElementById("btnLogin").addEventListener("click", login);
  document.getElementById("btnLogout").addEventListener("click", logout);

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => openSection(btn.dataset.target, btn));
  });

  document.querySelectorAll("[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.jump;
      const navBtn = document.querySelector(`.nav-btn[data-target="${target}"]`);
      openSection(target, navBtn);
    });
  });

  document.getElementById("btnAddGuest").addEventListener("click", () => openGuestModal());
  document.getElementById("btnCloseGuestModal").addEventListener("click", closeGuestModal);
  document.getElementById("btnCancelGuest").addEventListener("click", closeGuestModal);
  document.getElementById("btnSaveGuest").addEventListener("click", saveGuest);
  document.getElementById("btnBulkWA").addEventListener("click", bulkWA);
  document.getElementById("searchTamu").addEventListener("input", filterGuests);
  document.getElementById("btnUploadFoto").addEventListener("click", uploadPhotos);

  document.getElementById("password").addEventListener("keydown", e => {
    if (e.key === "Enter") login();
  });
}

function showLogin() {
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
}

function showApp() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    localStorage.setItem("zentih_admin_login", "1");
    showApp();
    refreshAll();
    toast("Login berhasil");
  } else {
    toast("Username atau password salah");
  }
}

function logout() {
  localStorage.removeItem("zentih_admin_login");
  location.reload();
}

function openSection(sectionId, btn = null) {
  document.querySelectorAll(".section-page").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const titleMap = {
    dashboardSection: "Dashboard",
    tamuSection: "Tamu",
    gallerySection: "Gallery",
    ucapanSection: "Ucapan"
  };
  document.getElementById("pageTitle").textContent = titleMap[sectionId] || "Dashboard";
}

async function apiGet(action) {
  const res = await fetch(`${API_URL}?action=${action}`);
  return await res.json();
}

async function apiPost(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return await res.json();
}

async function refreshAll() {
  await Promise.all([
    loadGuests(),
    loadGallery(),
    loadWishes()
  ]);
  renderStats();
}

/* ===========================
   TAMU
=========================== */

async function loadGuests() {
  try {
    guests = await apiGet("tamu");
    if (!Array.isArray(guests)) guests = [];
    renderGuests(guests);
  } catch (err) {
    console.error(err);
    guests = [];
    renderGuests([]);
    toast("Gagal memuat data tamu");
  }
}

function renderGuests(data) {
  const tbody = document.getElementById("tamuTable");

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">Belum ada data tamu.</div>
        </td>
      </tr>
    `;
    renderStats();
    return;
  }

  tbody.innerHTML = data.map((item, index) => {
    const status = (item.status || "").toLowerCase().includes("sudah")
      ? `<span class="badge badge-success">${escapeHtml(item.status || "Sudah")}</span>`
      : `<span class="badge badge-warn">${escapeHtml(item.status || "Belum dikirim")}</span>`;

    const link = buildInviteLink(item.nama);

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.nama || "")}</td>
        <td>${escapeHtml(item.wa || "")}</td>
        <td>
          <span class="link-box" title="${escapeHtml(link)}">/${escapeHtml((item.nama || "").trim())}</span>
        </td>
        <td>${status}</td>
        <td class="text-right">
          <div class="action-group">
            <button class="btn btn-soft action-btn" onclick="copyInviteLink('${escapeAttr(item.nama || "")}')">Copy Link</button>
            <button class="btn btn-soft action-btn" onclick="sendWA('${escapeAttr(item.wa || "")}','${escapeAttr(item.nama || "")}')">WA</button>
            <button class="btn btn-soft action-btn" onclick="openGuestModal(${serializeGuest(item)})">Edit</button>
            <button class="btn btn-danger action-btn" onclick="deleteGuest('${escapeAttr(item.id || "")}')">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  renderStats();
}

function filterGuests() {
  const q = document.getElementById("searchTamu").value.trim().toLowerCase();

  if (!q) {
    renderGuests(guests);
    return;
  }

  const filtered = guests.filter(item => {
    const name = String(item.nama || "").toLowerCase();
    const wa = String(item.wa || "").toLowerCase();
    return name.includes(q) || wa.includes(q);
  });

  renderGuests(filtered);
}

function openGuestModal(guest = null) {
  document.getElementById("guestModal").classList.remove("hidden");

  if (guest) {
    document.getElementById("guestModalTitle").textContent = "Edit Tamu";
    document.getElementById("guestId").value = guest.id || "";
    document.getElementById("guestName").value = guest.nama || "";
    document.getElementById("guestWa").value = guest.wa || "";
  } else {
    document.getElementById("guestModalTitle").textContent = "Tambah Tamu";
    document.getElementById("guestId").value = "";
    document.getElementById("guestName").value = "";
    document.getElementById("guestWa").value = "";
  }
}

function closeGuestModal() {
  document.getElementById("guestModal").classList.add("hidden");
}

async function saveGuest() {
  const id = document.getElementById("guestId").value.trim();
  const nama = document.getElementById("guestName").value.trim();
  const wa = normalizeWa(document.getElementById("guestWa").value);

  if (!nama) {
    toast("Nama tamu wajib diisi");
    return;
  }

  if (!wa) {
    toast("Nomor WhatsApp wajib diisi");
    return;
  }

  try {
    await apiPost({
      action: id ? "editTamu" : "addTamu",
      id,
      nama,
      wa
    });

    toast(id ? "Tamu berhasil diupdate" : "Tamu berhasil ditambahkan");
    closeGuestModal();
    await loadGuests();
  } catch (err) {
    console.error(err);
    toast("Gagal menyimpan tamu");
  }
}

async function deleteGuest(id) {
  if (!confirm("Hapus tamu ini?")) return;

  try {
    await apiPost({
      action: "deleteTamu",
      id
    });
    toast("Tamu berhasil dihapus");
    await loadGuests();
  } catch (err) {
    console.error(err);
    toast("Gagal menghapus tamu");
  }
}

function buildInviteLink(name) {
  return `https://www.zentih.my.id/?to=${encodeURIComponent(name || "")}`;
}

function buildWaMessage(name) {
  return `Assalamu'alaikum Yth. ${name},

Dengan penuh kebahagiaan kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.

💍 Nisa & Setyo

Buka undangan:
${buildInviteLink(name)}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.

Terima kasih 🤍`;
}

function sendWA(no, nama) {
  const cleanNo = normalizeWa(no);
  if (!cleanNo) {
    toast("Nomor WA kosong / tidak valid");
    return;
  }

  const text = buildWaMessage(nama || "Bapak/Ibu/Saudara/i");
  window.open(`https://wa.me/${cleanNo}?text=${encodeURIComponent(text)}`, "_blank");
}

async function bulkWA() {
  if (!guests.length) {
    toast("Belum ada data tamu");
    return;
  }

  if (!confirm("Kirim WhatsApp ke semua tamu? Browser akan membuka beberapa tab WhatsApp.")) return;

  guests.forEach((item, index) => {
    setTimeout(() => {
      sendWA(item.wa, item.nama);
    }, index * 2000);
  });
}

async function copyInviteLink(name) {
  try {
    const link = buildInviteLink(name);
    await navigator.clipboard.writeText(link);
    toast("Link undangan berhasil disalin");
  } catch (err) {
    console.error(err);
    toast("Gagal menyalin link");
  }
}

/* ===========================
   GALLERY
=========================== */

async function loadGallery() {
  try {
    galleryItems = await apiGet("gallery");
    if (!Array.isArray(galleryItems)) galleryItems = [];
    renderGallery(galleryItems);
  } catch (err) {
    console.error(err);
    galleryItems = [];
    renderGallery([]);
    toast("Gagal memuat gallery");
  }
}

function renderGallery(data) {
  const grid = document.getElementById("galleryGrid");

  if (!data.length) {
    grid.innerHTML = `<div class="empty-state">Belum ada foto di gallery.</div>`;
    renderStats();
    return;
  }

  grid.innerHTML = data.map(item => `
    <div class="gallery-card">
      <img class="gallery-thumb" src="${escapeAttr(item.url || "")}" alt="${escapeAttr(item.nama_file || "Gallery")}" />
      <div class="gallery-body">
        <p class="gallery-title">${escapeHtml(item.nama_file || "Foto")}</p>
        <div class="gallery-actions">
          <a class="btn btn-soft action-btn" href="${escapeAttr(item.url || "#")}" target="_blank">Lihat</a>
          <button class="btn btn-danger action-btn" onclick="deletePhoto('${escapeAttr(item.id || "")}')">Hapus</button>
        </div>
      </div>
    </div>
  `).join("");

  renderStats();
}

async function uploadPhotos() {
  const input = document.getElementById("foto");
  const files = Array.from(input.files || []);

  if (!files.length) {
    toast("Pilih foto dulu");
    return;
  }

  try {
    for (const file of files) {
      const base64 = await fileToBase64(file);

      await apiPost({
        action: "uploadGallery",
        file: base64,
        name: file.name
      });
    }

    input.value = "";
    toast("Foto berhasil diupload");
    await loadGallery();
  } catch (err) {
    console.error(err);
    toast("Upload foto gagal");
  }
}

async function deletePhoto(id) {
  if (!confirm("Hapus foto ini?")) return;

  try {
    await apiPost({
      action: "deleteGallery",
      id
    });
    toast("Foto berhasil dihapus");
    await loadGallery();
  } catch (err) {
    console.error(err);
    toast("Gagal menghapus foto");
  }
}

/* ===========================
   UCAPAN
=========================== */

async function loadWishes() {
  try {
    wishes = await apiGet("ucapan");
    if (!Array.isArray(wishes)) wishes = [];
    renderWishes(wishes);
  } catch (err) {
    console.error(err);
    wishes = [];
    renderWishes([]);
    toast("Gagal memuat ucapan");
  }
}

function renderWishes(data) {
  const wrap = document.getElementById("ucapanList");

  if (!data.length) {
    wrap.innerHTML = `<div class="empty-state">Belum ada ucapan.</div>`;
    renderStats();
    return;
  }

  wrap.innerHTML = data.map(item => `
    <div class="ucapan-card">
      <div class="ucapan-head">
        <div>
          <h4 class="ucapan-name">${escapeHtml(item.nama || "Tamu")}</h4>
          <div class="ucapan-meta">
            ${escapeHtml(item.hadir || "-")} • ${escapeHtml(String(item.jumlah || 1))} orang
          </div>
        </div>
        <button class="btn btn-danger action-btn" onclick="deleteWish('${escapeAttr(item.id || "")}')">Hapus</button>
      </div>
      <p class="ucapan-text">${escapeHtml(item.pesan || "-")}</p>
    </div>
  `).join("");

  renderStats();
}

async function deleteWish(id) {
  if (!confirm("Hapus ucapan ini?")) return;

  try {
    await apiPost({
      action: "deleteUcapan",
      id
    });
    toast("Ucapan berhasil dihapus");
    await loadWishes();
  } catch (err) {
    console.error(err);
    toast("Gagal menghapus ucapan");
  }
}

/* ===========================
   DASHBOARD
=========================== */

function renderStats() {
  document.getElementById("statTamu").textContent = guests.length;
  document.getElementById("statUcapan").textContent = wishes.length;
  document.getElementById("statGallery").textContent = galleryItems.length;

  const belum = guests.filter(item => {
    const status = String(item.status || "").toLowerCase();
    return !status.includes("sudah");
  }).length;

  document.getElementById("statBelum").textContent = belum;
}

/* ===========================
   HELPERS
=========================== */

function normalizeWa(value) {
  let v = String(value || "").trim();
  v = v.replace(/\s+/g, "");
  v = v.replace(/[^\d+]/g, "");

  if (v.startsWith("08")) {
    v = "62" + v.slice(1);
  } else if (v.startsWith("+62")) {
    v = "62" + v.slice(3);
  }

  return v;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.remove("hidden");

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.classList.add("hidden");
  }, 2500);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function serializeGuest(item) {
  return JSON.stringify({
    id: item.id || "",
    nama: item.nama || "",
    wa: item.wa || ""
  }).replace(/"/g, "&quot;");
}