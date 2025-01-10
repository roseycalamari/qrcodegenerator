let isGenerating = false;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("text-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      generateQRCode();
    }
  });
});

function generateQRCode() {
  const inputText = document.getElementById("text-input").value.trim();
  const generateBtn = document.getElementById("generate-btn");
  const loadingBar = document.getElementById("loading-bar");
  const qrSection = document.querySelector(".qr-section");
  const qrcodeContainer = document.getElementById("qrcode-container");

  if (!isValidURL(inputText)) {
    alert("Please enter a valid URL to generate a QR code.");
    return;
  }

  if (isGenerating) return;
  isGenerating = true;

  generateBtn.style.display = "none";
  loadingBar.style.display = "flex";

  setTimeout(() => {
    loadingBar.style.display = "none";
    qrSection.style.display = "flex";
    qrcodeContainer.innerHTML = "";

    try {
      new QRCode(qrcodeContainer, {
        text: inputText,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L,
      });

      setTimeout(() => {
        addWatermarkToDisplayedQRCode();
      }, 100);
    } catch (error) {
      console.error("Error generating QR Code:", error);
      alert("An error occurred while generating the QR Code. Please try again.");
    }

    isGenerating = false;
  }, 1500);
}

function isValidURL(string) {
  try {
    const url = new URL(string.includes("http") ? string : `https://${string}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function addWatermarkToDisplayedQRCode() {
  const qrcodeContainer = document.getElementById("qrcode-container");
  const qrCanvas = qrcodeContainer.querySelector("canvas");

  if (!qrCanvas) {
    console.error("QR code canvas not found.");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = qrCanvas.width;
  canvas.height = qrCanvas.height;

  ctx.drawImage(qrCanvas, 0, 0);

  const text = "qrcodechameleon.com";
  const fontSize = qrCanvas.width * 0.1;
  ctx.font = `900 ${fontSize}px 'Montserrat', sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.lineWidth = fontSize * 0.05;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const diagonalRepeat = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
  for (let i = -diagonalRepeat; i < diagonalRepeat; i += 50) {
    ctx.save();
    ctx.translate(i, i);
    ctx.rotate(-Math.PI / 6);
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  qrcodeContainer.innerHTML = "";
  qrcodeContainer.appendChild(canvas);
}

function downloadQRCode() {
  const qrCodeCanvas = document.querySelector("#qrcode-container canvas");
  if (!qrCodeCanvas) {
    alert("No QR code found!");
    return;
  }

  const link = document.createElement("a");
  link.href = qrCodeCanvas.toDataURL("image/png");
  link.download = "qrcode.png";
  link.click();
}

function resetQRCodeGenerator() {
  document.getElementById("qrcode-container").innerHTML = "";
  document.querySelector(".qr-section").style.display = "none";
  document.getElementById("text-input").value = "";
  document.getElementById("generate-btn").style.display = "block";
}

function redirectToStripe() {
  const qrText = document.getElementById("text-input").value.trim();
  if (!qrText) {
    alert("Please generate a QR code before proceeding!");
    return;
  }

  const stripePaymentLink = "https://buy.stripe.com/test_9AQ5o60a43oz0XCbII";
  const paymentLinkWithQR = `${stripePaymentLink}?qr=${encodeURIComponent(qrText)}`;
  window.location.href = paymentLinkWithQR;
}
