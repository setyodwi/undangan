const API_URL = "https://script.google.com/macros/s/AKfycbxVQ4SsG32XFwUQ8Z6HzXTOS8E8MsxHQmYZwzgcP9M1YlpgnTOs2E78nbvhQlggXtZa/exec";
let tamu = [];

function login() {
  if (username.value === "boncel" && password.value === "Annisa2000_") {
    localStorage.admin = "1"; openApp()
  } else alert("Login gagal")
}
function openApp() { loginPage.classList.add("hidden"); app.classList.remove("hidden"); loadTamu(); loadUcapan(); loadGallery() }
if (localStorage.admin) openApp();
function logout() { localStorage.clear(); location.reload() }
function menu(x) { document.querySelectorAll(".page").forEach(e => e.classList.add("hidden")); document.getElementById(x).classList.remove("hidden"); title.innerHTML = x }

async function get(a) { return await (await fetch(API_URL + "?action=" + a)).json() }

async function loadTamu() { tamu = await get("tamu"); totalTamu.innerHTML = tamu.length; renderTamu(tamu) }
function renderTamu(d) { tamuTable.innerHTML = d.map(x => `<tr><td>${x.nama}</td><td>${x.wa}</td><td><button onclick="sendWA('${x.wa}','${x.nama}')">WA</button></td></tr>`).join("") }
function filterTamu() { renderTamu(tamu.filter(x => (x.nama + x.wa).toLowerCase().includes(search.value.toLowerCase()))) }
async function addTamu() { await fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "addTamu", nama: nama.value, wa: wa.value }) }); loadTamu() }
function sendWA(no, nama) { window.open("https://wa.me/" + no + "?text=" + encodeURIComponent(`Assalamu'alaikum Yth. ${nama},\n\nDengan penuh kebahagiaan kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.\n\nBuka undangan:\nhttps://www.zentih.my.id/?to=${nama}\n\nTerima kasih 🤍`)) }
async function loadGallery() { let d = await get("gallery"); totalFoto.innerHTML = d.length; galleryGrid.innerHTML = d.map(x => `<img src="${x.url}">`).join("") }
async function loadUcapan() { let d = await get("ucapan"); totalUcapan.innerHTML = d.length; ucapanList.innerHTML = d.map(x => `<div class="card"><b>${x.nama}</b><br>${x.pesan}</div>`).join("") }
async function uploadFoto() { alert("Endpoint upload aktif, tinggal sambungkan dari Code.gs") }
