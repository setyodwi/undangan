const API_URL = "https://script.google.com/macros/s/AKfycbxqy94XwZpT6jwEHveV0jsBBVMKsaKvHBuL1Ge43k9MXgKHWHmMqtIF2z23_383Xwf-/exec";

const USER = "boncel";
const PASS = "Annisa2000_";

let tamuData = [];

function login(){
 const u=document.getElementById("username").value;
 const p=document.getElementById("password").value;

 if(u===USER && p===PASS){
   localStorage.admin="true";
   showDashboard();
 } else {
   alert("Login gagal");
 }
}

function showDashboard(){
 document.getElementById("login-box").classList.add("hidden");
 document.getElementById("dashboard").classList.remove("hidden");
 loadTamu();
 loadUcapan();
 loadGallery();
}

function logout(){
 localStorage.removeItem("admin");
 location.reload();
}

if(localStorage.admin==="true"){
 showDashboard();
}

async function getData(action){
 const r=await fetch(API_URL+"?action="+action);
 return await r.json();
}

async function loadTamu(){
 tamuData=await getData("tamu");
 document.getElementById("tamu-list").innerHTML=tamuData.map((x)=>`
 <tr>
 <td>${x.nama||""}</td>
 <td>${x.wa||""}</td>
 <td><button onclick="sendWA('${x.wa}','${x.nama}')">WA</button></td>
 </tr>`).join("");
}

function sendWA(no,nama){
 let pesan=`Assalamu'alaikum ${nama},\n\nDengan hormat kami mengundang Bapak/Ibu untuk hadir pada pernikahan Nisa & Setyo.\n\nBuka undangan:\nhttps://www.zentih.my.id/?to=${encodeURIComponent(nama)}\n\nTerima kasih 🤍`;
 window.open("https://wa.me/"+no+"?text="+encodeURIComponent(pesan),"_blank");
}

function bulkWA(){
 if(!tamuData.length) return alert("Data tamu kosong");
 tamuData.forEach((x,i)=>{
   setTimeout(()=>sendWA(x.wa,x.nama),i*4000);
 });
}

async function loadUcapan(){
 const data=await getData("ucapan");
 document.getElementById("ucapan-list").innerHTML=data.map(x=>`
 <div class="card"><b>${x.nama}</b><br>${x.pesan}</div>
 `).join("");
}

async function loadGallery(){
 const data=await getData("gallery");
 document.getElementById("gallery-list").innerHTML=data.map(x=>`
 <img src="${x.url}" width="150">
 `).join("");
}
