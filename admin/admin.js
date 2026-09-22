const API_URL="https://script.google.com/macros/s/AKfycbxVQ4SsG32XFwUQ8Z6HzXTOS8E8MsxHQmYZwzgcP9M1YlpgnTOs2E78nbvhQlggXtZa/exec";
let tamu=[];

function login(){
 if(document.getElementById("username").value==="boncel" &&
 document.getElementById("password").value==="Annisa2000_"){
 localStorage.admin="1";
 document.getElementById("loginPage").classList.add("hidden");
 document.getElementById("app").classList.remove("hidden");
 loadAll();
 }else alert("Login gagal");
}

window.onload=()=>{
 if(localStorage.admin){
 document.getElementById("loginPage").classList.add("hidden");
 document.getElementById("app").classList.remove("hidden");
 loadAll();
 }
}

function logout(){localStorage.clear();location.reload()}

function openMenu(id){
document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));
document.getElementById(id).classList.remove("hidden");
document.getElementById("title").innerHTML=id;
}

async function api(a){
let r=await fetch(API_URL+"?action="+a);
return await r.json();
}

async function loadAll(){loadTamu();loadGallery();loadUcapan()}

async function loadTamu(){
tamu=await api("tamu");
document.getElementById("totalTamu").innerHTML=tamu.length;
renderTamu(tamu);
}

function renderTamu(data){
document.getElementById("tamuTable").innerHTML=data.map(x=>`
<tr>
<td>${x.nama||""}</td>
<td>${x.wa||""}</td>
<td>
<button onclick="sendWA('${x.wa}','${x.nama}')">WA</button>
<button onclick="hapusTamu('${x.id}')">Hapus</button>
</td>
</tr>`).join("");
}

function filterTamu(){
let q=document.getElementById("search").value.toLowerCase();
renderTamu(tamu.filter(x=>(x.nama+x.wa).toLowerCase().includes(q)));
}

async function addTamu(){
await post({action:"addTamu",nama:nama.value,wa:wa.value});
loadTamu();
}

function sendWA(no,nama){
let text=`Assalamu'alaikum Yth. ${nama},

Dengan penuh kebahagiaan kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.

Buka undangan:
https://www.zentih.my.id/?to=${encodeURIComponent(nama)}

Terima kasih 🤍`;
window.open("https://wa.me/"+no+"?text="+encodeURIComponent(text));
}

async function hapusTamu(id){await post({action:"deleteTamu",id:id});loadTamu()}

async function loadGallery(){
let d=await api("gallery");
document.getElementById("totalGallery").innerHTML=d.length;
document.getElementById("galleryGrid").innerHTML=d.map(x=>`<img src="${x.url}">`).join("");
}

async function uploadFoto(){alert("upload siap setelah endpoint upload diaktifkan")}

async function loadUcapan(){
let d=await api("ucapan");
document.getElementById("totalUcapan").innerHTML=d.length;
document.getElementById("ucapanList").innerHTML=d.map(x=>`<div>${x.nama}<br>${x.pesan}</div>`).join("");
}

async function post(data){
return fetch(API_URL,{method:"POST",body:JSON.stringify(data)});
}