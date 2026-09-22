const API_URL = "https://script.google.com/macros/s/AKfycbzmjg_e2MHgeVYd7ehJH_3QFykCIJ-T78LcE44nopBjS30xwdJ95P4H-2EKX6qlglFd/exec";

const USER = "boncel";
const PASS = "Annisa2000_";

let tamu = [];

function login() {
  if (user.value === USER && pass.value === PASS) {
    localStorage.admin = "1";
    buka();
  } else alert("Login gagal");
}

function buka() {
  loginBox = document.getElementById("login");
  app = document.getElementById("app");
  loginBox.classList.add("hide");
  app.classList.remove("hide");
  loadTamu();
  loadUcapan();
}

if (localStorage.admin) buka();

function logout() {
  localStorage.clear();
  location.reload();
}

async function api(action) {
  let r = await fetch(API_URL + "?action=" + action);
  return await r.json();
}

async function loadTamu() {
  tamu = await api("tamu");
  document.getElementById("tamu").innerHTML = tamu.map(x => `
 <tr>
 <td>${x.nama}</td>
 <td>${x.wa}</td>
 <td>
 <button onclick="wa('${x.wa}','${x.nama}')">WA</button>
 </td>
 </tr>`).join("");
}

async function addTamu() {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "addTamu",
      nama: nama.value,
      wa: wa.value
    })
  });
  loadTamu();
}

function wa(no, nama) {
  let text = `Undangan Pernikahan Nisa & Setyo\nhttps://www.zentih.my.id/?to=${encodeURIComponent(nama)}`;
  window.open("https://wa.me/" + no + "?text=" + encodeURIComponent(text));
}

function bulkWA() {
  tamu.forEach((x, i) => {
    setTimeout(() => wa(x.wa, x.nama), i * 3000);
  });
}

async function loadUcapan() {
  let data = await api("ucapan");
  ucapan.innerHTML = data.map(x => `
 <div class="card"><b>${x.nama}</b><br>${x.pesan}</div>
 `).join("");
}

async function uploadFoto() {
  let files = document.getElementById("foto").files;
  for (let f of files) {
    alert("Upload " + f.name + " membutuhkan endpoint uploadGallery di Apps Script");
  }
}

function importExcel() {
  alert("Import Excel membutuhkan endpoint importExcel di Apps Script");
}
