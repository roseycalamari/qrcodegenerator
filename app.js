let isGenerating = false; // Prevent multiple QR code generations
const watermarkImagePath = "watermark.png"; // Path to the watermark image

// Add "Enter" key functionality to trigger QR code generation
document.getElementById("text-input").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    generateQRCode();
  }
});

// Function to generate QR Code
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

    qrcodeContainer.innerHTML = ""; // Clear existing QR codes

    new QRCode(qrcodeContainer, {
      text: inputText,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L,
    });

    addWatermarkToDisplayedQRCode(); // Add the watermark
    preventCanvasDragging(); // Disable dragging

    isGenerating = false;
  }, 2000);
}

// Function to validate URLs
function isValidURL(string) {
  try {
    const url = new URL(string.includes("http") ? string : `https://${string}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Add watermark to the displayed QR code
function addWatermarkToDisplayedQRCode() {
  const qrcodeContainer = document.getElementById("qrcode-container");
  const qrCanvas = qrcodeContainer.querySelector("canvas");

  if (!qrCanvas) {
    console.error("QR code canvas not found.");
    return;
  }

  const scaleFactor = 4;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = qrCanvas.width * scaleFactor;
  canvas.height = qrCanvas.height * scaleFactor;
  ctx.scale(scaleFactor, scaleFactor);

  ctx.drawImage(qrCanvas, 0, 0);

  const text = "QRCodeChameleon.com";
  const fontSize = qrCanvas.width * 0.1;
  ctx.font = `bold ${fontSize}px Impact`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = fontSize * 0.05;

  const gap = fontSize * 5;
  for (let y = -gap; y < canvas.height / scaleFactor + gap; y += gap) {
    for (let x = -gap; x < canvas.width / scaleFactor + gap; x += gap) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText(text, 0, 0);
      ctx.strokeText(text, 0, 0);
      ctx.restore();
    }
  }

  qrcodeContainer.innerHTML = "";
  qrcodeContainer.appendChild(canvas);
  preventCanvasDragging();
}

// Prevent dragging of the QR code
function preventCanvasDragging() {
  const qrCanvas = document.querySelector("#qrcode-container canvas");
  if (qrCanvas) {
    qrCanvas.addEventListener("dragstart", (event) => event.preventDefault());
    qrCanvas.addEventListener("mousedown", (event) => event.preventDefault());
    qrCanvas.addEventListener("touchstart", (event) => event.preventDefault());
    qrCanvas.style.pointerEvents = "none";
  }
}

// Download QR code
function downloadQRCode() {
  const qrCodeCanvas = document.querySelector("#qrcode-container canvas");
  if (!qrCodeCanvas) {
    alert("No QR code found!");
    return;
  }

  const link = document.createElement("a");
  link.href = qrCodeCanvas.toDataURL("image/png");
  link.download = "qrcode_with_watermark.png";
  link.click();
}

// Reset the QR code generator
function resetQRCodeGenerator() {
  document.getElementById("qrcode-container").innerHTML = "";
  document.querySelector(".qr-section").style.display = "none";
  document.getElementById("text-input").value = "";
  document.getElementById("generate-btn").style.display = "block";
}

// Redirect to Stripe for payment
function redirectToStripe() {
  const qrText = document.getElementById("text-input").value.trim();
  if (!qrText) {
    alert("Please generate a QR code before proceeding!");
    return;
  }

  const stripePaymentLink = "https://buy.stripe.com/14k2bw68BcND1JC7sw";
  const paymentLinkWithQR = `${stripePaymentLink}?qr=${encodeURIComponent(qrText)}`;
  window.location.href = paymentLinkWithQR;
}
