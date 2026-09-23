const API_URL =
  "https://script.google.com/macros/s/AKfycbxqy94XwZPjT6jwEHveV0jsBBVMKsaKvHBuL1Ge43k9MXgKHWHmMqtIF2z23_383Xwf-/exec";


const ADMIN_USER = "boncel";
const ADMIN_PASS = "Annisa2000_";


let guests = [];
let galleryItems = [];
let wishes = [];



document.addEventListener("DOMContentLoaded", () => {


  bindEvents();


  if (localStorage.getItem("zentih_admin_login")) {

    showApp();

    loadAll();

  } else {

    showLogin();

  }


});





function bindEvents() {


  const login =
    document.getElementById("btnLogin");


  if (login)
    login.onclick = loginAdmin;



  const logout =
    document.getElementById("btnLogout");


  if (logout)
    logout.onclick = logout;



  document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {


      btn.onclick = () => {

        openSection(
          btn.dataset.target,
          btn
        );

      };


    });



  const add =
    document.getElementById("btnAddGuest");


  if (add)
    add.onclick = () => openGuestModal();



  const save =
    document.getElementById("btnSaveGuest");


  if (save)
    save.onclick = saveGuest;



  const close =
    document.getElementById("btnCloseGuestModal");


  if (close)
    close.onclick = closeGuestModal;



  const cancel =
    document.getElementById("btnCancelGuest");


  if (cancel)
    cancel.onclick = closeGuestModal;



  const search =
    document.getElementById("searchTamu");


  if (search)
    search.oninput = filterGuests;



  const upload =
    document.getElementById("btnUploadFoto");


  if (upload)
    upload.onclick = uploadPhotos;


}







/*
LOGIN
*/


function loginAdmin() {


  let u =
    document.getElementById("username").value;


  let p =
    document.getElementById("password").value;



  if (
    u === ADMIN_USER &&
    p === ADMIN_PASS
  ) {


    localStorage.setItem(
      "zentih_admin_login",
      "1"
    );


    showApp();


    loadAll();



  } else {


    alert("Username/password salah");


  }


}





function showLogin() {

  document
    .getElementById("loginPage")
    .classList
    .remove("hidden");


  document
    .getElementById("app")
    .classList
    .add("hidden");

}




function showApp() {

  document
    .getElementById("loginPage")
    .classList
    .add("hidden");


  document
    .getElementById("app")
    .classList
    .remove("hidden");


}




function logout() {

  localStorage.removeItem(
    "zentih_admin_login"
  );


  location.reload();

}





/*
MENU
*/


function openSection(id, btn) {


  document
    .querySelectorAll(".section-page")
    .forEach(x =>
      x.classList.add("hidden")
    );



  document
    .getElementById(id)
    .classList
    .remove("hidden");



  document
    .querySelectorAll(".nav-btn")
    .forEach(x =>
      x.classList.remove("active")
    );



  if (btn)
    btn.classList.add("active");



}







/*
API
*/


async function apiGet(action) {


  let res =
    await fetch(
      API_URL + "?action=" + action
    );


  return await res.json();


}




async function apiPost(data) {


  let res =
    await fetch(
      API_URL,
      {

        method: "POST",

        body:
          JSON.stringify(data)

      });


  return await res.json();


}






async function loadAll() {

  await loadGuests();

  await loadGallery();

  await loadWishes();


}







/*
TAMU
*/


async function loadGuests() {


  try {


    guests =
      await apiGet("tamu");



    renderGuests(
      guests
    );



    document
      .getElementById("statTamu")
      .innerHTML =
      guests.length;



  } catch (e) {


    console.log(e);

    toast(
      "Gagal mengambil tamu"
    );


  }



}






function renderGuests(data) {


  let table =
    document.getElementById(
      "tamuTable"
    );



  if (!data.length) {


    table.innerHTML =
      `
<tr>
<td colspan="6">
Belum ada data
</td>
</tr>
`;

    return;


  }



  table.innerHTML =
    data.map((x, i) => {


      return `

<tr>

<td>${i + 1}</td>

<td>${x.nama || ""}</td>

<td>${x.wa || ""}</td>


<td>

<button
class="btn btn-soft"
onclick="copyLink('${x.nama}')">

Copy

</button>

</td>


<td>

${x.status || "Belum dikirim"}

</td>



<td>


<button
class="btn btn-soft"
onclick="sendWA('${x.wa}','${x.nama}')">

WA

</button>


<button
class="btn btn-soft"
onclick='editGuest(${JSON.stringify(x)})'>

Edit

</button>



<button
class="btn btn-danger"
onclick="deleteGuest('${x.id}')">

Hapus

</button>


</td>


</tr>

`;


    }).join("");



}







function filterGuests() {


  let q =
    document
      .getElementById("searchTamu")
      .value
      .toLowerCase();



  let hasil =
    guests.filter(x => {


      return (

        String(x.nama)
          .toLowerCase()
          .includes(q)

        ||

        String(x.wa)
          .includes(q)

      );


    });



  renderGuests(hasil);


}








function openGuestModal() {


  document
    .getElementById("guestModal")
    .classList
    .remove("hidden");



  document
    .getElementById("guestId")
    .value = "";


  document
    .getElementById("guestName")
    .value = "";


  document
    .getElementById("guestWa")
    .value = "";


}







function editGuest(x) {


  openGuestModal();



  document
    .getElementById("guestId")
    .value = x.id;



  document
    .getElementById("guestName")
    .value = x.nama;



  document
    .getElementById("guestWa")
    .value = x.wa;


}







function closeGuestModal() {


  document
    .getElementById("guestModal")
    .classList
    .add("hidden");


}






async function saveGuest() {


  let id =
    guestId.value;



  await apiPost({

    action:
      id ?
        "editTamu" :
        "addTamu",


    id: id,


    nama:
      guestName.value,


    wa:
      guestWa.value


  });



  closeGuestModal();


  loadGuests();


}







async function deleteGuest(id) {


  if (
    !confirm("Hapus tamu?")
  )
    return;



  await apiPost({

    action: "deleteTamu",

    id: id

  });



  loadGuests();


}








function sendWA(no, nama) {


  let text =

    `Assalamu'alaikum Yth. ${nama},


Dengan penuh kebahagiaan kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami.


💍 Nisa & Setyo


Buka undangan:

https://www.zentih.my.id/?to=${nama}


Terima kasih 🤍`;



  window.open(

    "https://wa.me/" + no +

    "?text=" +

    encodeURIComponent(text)

  );


}





function copyLink(nama) {


  navigator.clipboard.writeText(

    "https://www.zentih.my.id/?to=" + nama

  );


  toast("Link tersalin");


}






/*
BULK WA
*/


function bulkWA() {


  guests.forEach((x, i) => {


    setTimeout(() => {


      sendWA(
        x.wa,
        x.nama
      );


    }, i * 2000);



  });


}








/*
GALLERY
*/


async function loadGallery() {


  galleryItems =
    await apiGet(
      "gallery"
    );



  document
    .getElementById("statGallery")
    .innerHTML =
    galleryItems.length;



  renderGallery(
    galleryItems
  );



}





function renderGallery(data) {


  let box =
    document.getElementById(
      "galleryGrid"
    );



  box.innerHTML =
    data.map(x => `

<div class="gallery-card">


<img
src="${x.url}"
class="gallery-thumb">


<p>
${x.nama_file}
</p>



<button
class="btn btn-danger"
onclick="deletePhoto('${x.id}')">

Hapus

</button>



</div>

`).join("");



}








async function uploadPhotos() {


  let files =
    document
      .getElementById("foto")
      .files;



  if (!files.length) {

    toast(
      "Pilih foto dulu"
    );

    return;

  }



  for (
    let file of files
  ) {



    let base64 =
      await fileToBase64(file);



    await apiPost({

      action: "uploadGallery",


      file: base64,


      name: file.name,


      mime: file.type


    });



  }



  toast(
    "Upload selesai"
  );



  loadGallery();


}







async function deletePhoto(id) {


  await apiPost({

    action: "deleteGallery",

    id: id

  });



  loadGallery();


}








/*
IMPORT EXCEL
*/


async function importExcel() {


  let file =
    document
      .getElementById("excelFile")
      .files[0];



  if (!file) {

    toast(
      "Pilih Excel"
    );

    return;

  }




  let base64 =
    await fileToBase64(file);



  await apiPost({

    action: "importExcel",

    file: base64

  });



  toast(
    "Excel berhasil masuk"
  );



  loadGuests();


}







/*
UCAPAN
*/


async function loadWishes() {


  wishes =
    await apiGet(
      "ucapan"
    );



  document
    .getElementById("statUcapan")
    .innerHTML =
    wishes.length;



  document
    .getElementById("ucapanList")
    .innerHTML =


    wishes.map(x => `

<div class="ucapan-card">


<b>${x.nama}</b>

<p>${x.pesan}</p>


<button
onclick="deleteWish('${x.id}')">

Hapus

</button>


</div>


`).join("");



}






async function deleteWish(id) {


  await apiPost({

    action: "deleteUcapan",

    id: id

  });


  loadWishes();


}







/*
HELPER
*/


function fileToBase64(file) {


  return new Promise((resolve, reject) => {


    let reader =
      new FileReader();



    reader.onload = () => {


      resolve(

        reader.result
          .split(",")[1]

      );


    };



    reader.onerror = reject;


    reader.readAsDataURL(file);



  });


}




function toast(msg) {


  alert(msg);


}