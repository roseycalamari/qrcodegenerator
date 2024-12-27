function generateQRCode() {
  const inputText = document.getElementById("text-input").value;
  const qrcodeContainer = document.getElementById("qrcode");
  const downloadBtn = document.getElementById("download-btn");
  const loadingBar = document.getElementById("loading-bar");

  // Clear previous QR code
  qrcodeContainer.innerHTML = "";
  downloadBtn.style.display = "none";
  loadingBar.style.display = "flex"; // Show the loading bar

  if (inputText.trim() !== "") {
    // Simulate loading process with animation duration (2 seconds)
    setTimeout(() => {
      loadingBar.style.display = "none"; // Hide the loading bar

      // Generate QR code
      const qrCode = new QRCode(qrcodeContainer, {
        text: inputText,
        width: 150,
        height: 150,
        colorDark: "#ffffff",
        colorLight: "transparent",
        correctLevel: QRCode.CorrectLevel.H,
      });

      // Show the download button after QR code is generated
      setTimeout(() => {
        const qrCanvas = qrcodeContainer.querySelector("canvas");
        if (qrCanvas) {
          downloadBtn.style.display = "block";
        }
      }, 500);
    }, 2000); // Matches the loading bar animation duration
  } else {
    loadingBar.style.display = "none"; // Hide the loading bar
    alert("Please enter a valid text or URL.");
  }
}

function downloadQRCode() {
  const qrCanvas = document.querySelector("#qrcode canvas");
  const inputText = document.getElementById("text-input").value.trim();

  if (qrCanvas) {
    let fileName = "qrcode.png";
    if (inputText) {
      try {
        const url = new URL(inputText.startsWith("http") ? inputText : `https://${inputText}`);
        fileName = `${url.hostname}.png`;
      } catch {
        fileName = `${inputText.replace(/[^a-z0-9]/gi, "_").substring(0, 15)}.png`;
      }
    }

    const link = document.createElement("a");
    link.href = qrCanvas.toDataURL("image/png");
    link.download = fileName;
    link.click();
  } else {
    alert("Please generate a QR code first.");
  }
}
