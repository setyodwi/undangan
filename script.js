const API_URL = "https://script.google.com/macros/s/AKfycbxqy94XwZpT6jwEHveV0jsBBVMKsaKvHBuL1Ge43k9MXgKHWHmMqtIF2z23_383Xwf-/exec";

document.addEventListener("DOMContentLoaded", function () {
  setGuestName();
  loadGallery();
  loadUcapan();
  setupRsvp();
});


/* =========================
   NAMA TAMU PERSONAL
========================= */

function setGuestName() {
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to");

  if (!guest) return;

  const nama = decodeURIComponent(
    guest.replace(/\+/g, " ")
  );

  const target = document.querySelector("#guest-name");

  if (target) {
    target.innerHTML = nama;
  }

  document.querySelectorAll(".guest-name")
    .forEach(el => {
      el.innerHTML = nama;
    });
}


/* =========================
   AMBIL GALLERY DARI SHEET
========================= */

async function loadGallery() {

  const container =
    document.getElementById("masonry");

  if (!container) return;


  try {

    const response = await fetch(
      API_URL + "?action=gallery"
    );


    const data = await response.json();


    container.innerHTML = "";


    data.forEach((foto) => {

      const item = document.createElement("figure");

      item.className = "g-item";


      item.innerHTML = `
                <img 
                    src="${foto.url}"
                    alt="${foto.nama_file || 'Gallery'}"
                    loading="lazy">
            `;


      container.appendChild(item);

    });


  } catch (error) {

    console.error(
      "Gallery gagal dimuat:",
      error
    );

  }

}



/* =========================
   AMBIL UCAPAN DARI SHEET
========================= */

async function loadUcapan() {

  const container =
    document.getElementById("ucapan-list");


  if (!container) return;


  try {

    const response = await fetch(
      API_URL + "?action=ucapan"
    );


    const data = await response.json();


    container.innerHTML = "";


    data.forEach((item) => {


      container.innerHTML += `

            <div class="ucapan-item">

                <h4>
                    ${escapeHTML(item.nama)}
                </h4>


                <p>
                    ${escapeHTML(item.pesan)}
                </p>


                <small>
                    ${item.hadir || ""}
                    ${item.jumlah ?
          " • " + item.jumlah + " orang"
          : ""}
                </small>

            </div>

            `;


    });


    const count =
      document.getElementById(
        "ucapan-count"
      );


    if (count) {

      count.innerHTML =
        "(" + data.length + ")";

    }


  } catch (error) {

    console.error(
      "Ucapan gagal dimuat:",
      error
    );

  }

}



/* =========================
   KIRIM UCAPAN KE SHEET
========================= */


function setupRsvp() {

  const form =
    document.getElementById(
      "rsvp-form"
    );


  if (!form) return;



  form.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();


      const data = {

        action: "saveUcapan",

        nama:
          document.getElementById(
            "f-nama"
          ).value,


        hadir:
          document.getElementById(
            "f-hadir"
          ).value,


        jumlah:
          document.getElementById(
            "f-jumlah"
          ).value,


        pesan:
          document.getElementById(
            "f-pesan"
          ).value

      };



      try {


        await fetch(
          API_URL,
          {

            method: "POST",

            body:
              JSON.stringify(data)

          }
        );



        alert(
          "Terima kasih, ucapan berhasil dikirim 🤍"
        );


        form.reset();


        loadUcapan();



      } catch (error) {


        alert(
          "Gagal mengirim ucapan"
        );


        console.error(error);

      }


    });


}



/* =========================
   AMANKAN HTML
========================= */

function escapeHTML(text) {

  if (!text) return "";

  return text
    .toString()
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}