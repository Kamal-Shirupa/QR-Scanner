// ===========================
// CONFIGURATION
// ===========================

const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbwpOyBOzK_x_6cIZd8IfbLHaQlRnonuljjHU9RJ1WGbwmDwPqTMNKLj1ystwS795gxjxg/exec";

let scanner;
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

function setStatus(message, css = "") {

    statusDiv.innerHTML = message;
    statusDiv.className = "status";

    if (css) {
        statusDiv.classList.add(css);
    }

}

// ===========================
// MARK ATTENDANCE
// ===========================

async function markAttendance(id) {

    try {

        setStatus("Checking Attendance...");

        studentId.innerHTML = id;

        const response = await fetch(
            `${WEB_APP_URL}?id=${encodeURIComponent(id)}&t=${Date.now()}`
        );

        const text = (await response.text()).trim();

        result.innerHTML = text;

        if (text === "Attendance Marked") {

            setStatus("✅ Attendance Marked", "success");

        } else if (text === "Already Attended") {

            setStatus("⚠ Already Attended", "warning");

        } else {

            setStatus("❌ Invalid QR", "error");

        }

    }
    catch (err) {

        console.error(err);

        setStatus("❌ Network Error", "error");

        result.innerHTML = "Failed";

    }

    setTimeout(() => {

        processing = false;

        studentId.innerHTML = "-";

        result.innerHTML = "-";

        setStatus("Waiting for QR...");

    }, 2500);

}

// ===========================
// QR SUCCESS
// ===========================

function onScanSuccess(decodedText) {

    if (processing) return;

    processing = true;

    if (navigator.vibrate) {
        navigator.vibrate(150);
    }

    markAttendance(decodedText);

}

// ===========================
// START SCANNER
// ===========================

function startScanner() {

    scanner = new Html5QrcodeScanner(
        "reader",
        {
            fps: 10,

            qrbox: {
                width: 250,
                height: 250
            },

            rememberLastUsedCamera: true,

            supportedScanTypes: [
                Html5QrcodeScanType.SCAN_TYPE_CAMERA
            ]
        },
        false
    );

    scanner.render(
        onScanSuccess,
        function () {}
    );

}

startScanner();

// ===========================
// RESTART
// ===========================

restartBtn.addEventListener("click", function () {

    processing = false;

    studentId.innerHTML = "-";

    result.innerHTML = "-";

    setStatus("Waiting for QR...");

});
