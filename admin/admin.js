const API_URL = "https://script.google.com/macros/s/AKfycbwXBg8fYPIAuRfcfdWUjds01MAJwVNINUXb9NKKzMmD6Ny7opiVqwWFqL2ZxwqMrixH/exec";

let tamu = [];

function login() {
  if (username.value === "boncel" && password.value === "Annisa2000_") {
    localStorage.admin = "yes";
    openAdmin();
  } else alert("Login gagal");
}

function openAdmin() {
  loginCard.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loadTamu();
}

if (localStorage.admin) openAdmin();

function logout() { localStorage.clear(); location.reload() }

function showTab(id) {
  document.querySelectorAll(".tab").forEach(x => x.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if (id === "gallery") loadGallery();
  if (id === "ucapan") loadUcapan();
}

async function api(action) {
  let r = await fetch(API_URL + "?action=" + action);
  return await r.json();
}

async function loadTamu() {
  tamu = await api("tamu");
  tamuList.innerHTML = tamu.map(x => `
<tr>
<td>${x.nama || ""}</td>
<td>${x.wa || ""}</td>
<td><button onclick="sendWA('${x.wa}','${x.nama}')">WA</button></td>
</tr>`).join("");
}

async function addTamu() {
  await fetch(API_URL, {
    method: "POST", body: JSON.stringify({
      action: "addTamu",
      nama: nama.value,
      wa: wa.value
    })
  });
  loadTamu();
}

function sendWA(no, nama) {
  window.open("https://wa.me/" + no + "?text=" + encodeURIComponent(
    "Undangan Pernikahan Nisa & Setyo\nhttps://www.zentih.my.id/?to=" + nama
  ));
}

function bulkWA() {
  tamu.forEach((x, i) => setTimeout(() => sendWA(x.wa, x.nama), i * 3000));
}

async function loadGallery() {
  let data = await api("gallery");
  galleryList.innerHTML = data.map(x => `<img src="${x.url}">`).join("");
}

async function uploadFoto() {
  let files = foto.files;
  for (let f of files) {
    let reader = new FileReader();
    reader.onload = async () => {
      await fetch(API_URL, {
        method: "POST", body: JSON.stringify({
          action: "uploadGallery",
          file: reader.result.split(",")[1],
          name: f.name
        })
      });
    };
    reader.readAsDataURL(f);
  }
  alert("Upload diproses");
}

async function loadUcapan() {
  let data = await api("ucapan");
  ucapanList.innerHTML = data.map(x => `
<div class="card"><b>${x.nama}</b><p>${x.pesan}</p></div>`).join("");
}
