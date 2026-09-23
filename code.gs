const SHEET_ID = "1Swu_JSskJhmWEPaJ_YayNBLWn1t0BoFY1i5IVmU1Z-o";
const DRIVE_ID = "17n0dUZRSdPQoPPib1aiXxsJaaXlxvzqW";
const WEBSITE_URL = "https://www.zentih.my.id";



/* ======================
   API GET
====================== */

function doGet(e){

  let action = e.parameter.action;


  if(action=="tamu"){
    return json(getTamu());
  }


  if(action=="gallery"){
    return json(getGallery());
  }


  if(action=="ucapan"){
    return json(getUcapan());
  }


  return json({
    status:true,
    message:"Zentih API aktif"
  });

}



/* ======================
   API POST
====================== */

function doPost(e){

  let data = JSON.parse(e.postData.contents);


  switch(data.action){


    case "saveUcapan":
      saveUcapan(data);
      break;


    case "addTamu":
      addTamu(data);
      break;


    case "editTamu":
      editTamu(data);
      break;


    case "deleteTamu":
      deleteTamu(data.id);
      break;


    case "uploadGallery":
      uploadGallery(data.file,data.name);
      break;


    case "deleteGallery":
      deleteGallery(data.id);
      break;


    case "deleteUcapan":
      deleteUcapan(data.id);
      break;

  }


  return json({
    status:true
  });

}





/* ======================
   TAMU
====================== */


function getTamu(){

 const sh =
 SpreadsheetApp
 .openById(SHEET_ID)
 .getSheetByName("TAMU");


 let data =
 sh.getDataRange()
 .getValues();


 data.shift();


 return data.map(r=>({

   id:r[0],
   nama:r[1],
   wa:String(r[2]),
   link:r[3],
   status:r[4],
   tanggal:r[5]

 }));

}




function addTamu(data){

 const sh =
 SpreadsheetApp
 .openById(SHEET_ID)
 .getSheetByName("TAMU");


 sh.appendRow([

   Date.now(),

   data.nama,

   String(data.wa),

   WEBSITE_URL+
   "/?to="+
   encodeURIComponent(data.nama),

   "Belum dikirim",

   new Date()

 ]);

}




function editTamu(data){

 const sh =
 SpreadsheetApp
 .openById(SHEET_ID)
 .getSheetByName("TAMU");


 let rows =
 sh.getDataRange()
 .getValues();


 for(let i=1;i<rows.length;i++){


   if(rows[i][0]==data.id){


     sh.getRange(i+1,2)
     .setValue(data.nama);


     sh.getRange(i+1,3)
     .setValue(String(data.wa));


     sh.getRange(i+1,4)
     .setValue(
       WEBSITE_URL+
       "/?to="+
       encodeURIComponent(data.nama)
     );


     break;

   }

 }

}





function deleteTamu(id){

 const sh =
 SpreadsheetApp
 .openById(SHEET_ID)
 .getSheetByName("TAMU");


 let rows =
 sh.getDataRange()
 .getValues();


 for(let i=1;i<rows.length;i++){

   if(rows[i][0]==id){

     sh.deleteRow(i+1);

     return true;

   }

 }


 return false;

}





/* ======================
   UCAPAN
====================== */


function saveUcapan(data){

 const sh =
 SpreadsheetApp
 .openById(SHEET_ID)
 .getSheetByName("UCAPAN");


 sh.appendRow([

 Date.now(),

 data.nama || "",

 data.hadir || "",

 data.jumlah || 1,

 data.pesan || "",

 new Date()

 ]);

}





function getUcapan(){

 const sh =
 SpreadsheetApp
 .openById(SHEET_ID)
 .getSheetByName("UCAPAN");


 let data =
 sh.getDataRange()
 .getValues();


 data.shift();


 return data.map(r=>({

   id:r[0],
   nama:r[1],
   hadir:r[2],
   jumlah:r[3],
   pesan:r[4],
   tanggal:r[5]

 }));

}





function deleteUcapan(id){


 const sh =
 SpreadsheetApp
 .openById(SHEET_ID)
 .getSheetByName("UCAPAN");


 let rows =
 sh.getDataRange()
 .getValues();



 for(let i=1;i<rows.length;i++){


   if(rows[i][0]==id){

     sh.deleteRow(i+1);

     return true;

   }

 }

}





/* ======================
   GALLERY
====================== */


function getGallery(){

 const folder =
 DriveApp
 .getFolderById(DRIVE_ID);


 let files =
 folder.getFiles();


 let result=[];


 while(files.hasNext()){


   let file =
   files.next();



   result.push({

    id:file.getId(),

    nama_file:file.getName(),

    url:
    "https://drive.google.com/uc?export=view&id="
    +
    file.getId()

   });


 }


 return result;

}





function uploadGallery(base64,name){


 const folder =
 DriveApp
 .getFolderById(DRIVE_ID);


 let bytes =
 Utilities.base64Decode(base64);



 let blob =
 Utilities.newBlob(
   bytes,
   MimeType.JPEG,
   name
 );



 let file =
 folder.createFile(blob);



 const sh =
 SpreadsheetApp
 .openById(SHEET_ID)
 .getSheetByName("GALLERY");



 sh.appendRow([

 Date.now(),

 file.getName(),

 "https://drive.google.com/uc?export=view&id="
 +
 file.getId(),

 file.getId(),

 new Date()

 ]);



}





function getGallery() {
  const sh =
    SpreadsheetApp
      .openById(SHEET_ID)
      .getSheetByName("GALLERY");

  const rows = sh.getDataRange().getValues();
  rows.shift();

  return rows.map(r => ({
    id: r[0],          // id row / timestamp
    nama_file: r[1],
    url: r[2],
    file_id: r[3],
    tanggal: r[4]
  }));
}

function deleteGallery(id) {
  const sh =
    SpreadsheetApp
      .openById(SHEET_ID)
      .getSheetByName("GALLERY");

  const rows = sh.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      const fileId = rows[i][3];

      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (e) {}

      sh.deleteRow(i + 1);
      return true;
    }
  }

  return false;
}



/* ======================
   JSON
====================== */


function json(data){

 return ContentService
 .createTextOutput(
   JSON.stringify(data)
 )
 .setMimeType(
 ContentService.MimeType.JSON
 );

}