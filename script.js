// ===========================
// CONFIGURATION
// ===========================

const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbwpOyBOzK_x_6cIZd8IfbLHaQlRnonuljjHU9RJ1WGbwmDwPqTMNKLj1ystwS795gxjxg/exec";

let html5QrCode;
let processing = false;

// ===========================
// UI ELEMENTS
// ===========================

const statusDiv = document.getElementById("status");
const studentId = document.getElementById("studentId");
const result = document.getElementById("result");
const restartBtn = document.getElementById("restartBtn");

// ===========================
// STATUS
// ===========================

function setStatus(message, css){

    statusDiv.innerHTML = message;

    statusDiv.className = "status";

    if(css)
        statusDiv.classList.add(css);

}

// ===========================
// SEND TO APPS SCRIPT
// ===========================

async function markAttendance(id){

    try{

        setStatus("Checking Attendance...", "");

        studentId.innerHTML = id;

        const url =
        WEB_APP_URL +
        "?id=" +
        encodeURIComponent(id) +
        "&t=" +
        new Date().getTime();

        const response = await fetch(url,{
            method:"GET",
            cache:"no-store"
        });

        const text = await response.text();

        result.innerHTML = text;

        if(text==="Attendance Marked"){

            setStatus("✅ Attendance Marked","success");

        }
        else if(text==="Already Attended"){

            setStatus("⚠ Already Attended","warning");

        }
        else if(text==="Invalid QR"){

            setStatus("❌ Invalid QR","error");

        }
        else{

            setStatus(text,"error");

        }

    }
    catch(error){

        console.error(error);

        setStatus("Network Error","error");

        result.innerHTML="Failed";

    }

    setTimeout(function(){

        processing=false;

        result.innerHTML="-";

        studentId.innerHTML="-";

        setStatus("Waiting for QR...","");

    },2500);

}

// ===========================
// SUCCESS
// ===========================

function onScanSuccess(decodedText){

    if(processing)
        return;

    processing=true;

    if(navigator.vibrate){

        navigator.vibrate(150);

    }

    markAttendance(decodedText);

}

// ===========================
// FAILURE
// ===========================

function onScanFailure(error){

}

// ===========================
// START CAMERA
// ===========================

function startScanner(){

    html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras()
    .then(function(devices){

        if(devices.length===0){

            setStatus("Camera Not Found","error");

            return;

        }

        html5QrCode.start(

            devices[0].id,

            {
                fps:10,
                qrbox:250
            },

            onScanSuccess,
            onScanFailure

        );

    })
    .catch(function(err){

        console.log(err);

        setStatus("Camera Permission Denied","error");

    });

}

startScanner();

// ===========================
// RESTART BUTTON
// ===========================

restartBtn.onclick=function(){

    processing=false;

    result.innerHTML="-";

    studentId.innerHTML="-";

    setStatus("Waiting for QR...","");

};