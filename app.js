let isGenerating = false; // Prevent multiple QR code generations

// Add "Enter" key functionality to trigger QR code generation
document.getElementById("text-input").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    generateQRCode();
  }
});

// Check if the user is returning after payment
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isPaid = urlParams.get("paid") === "true";

  if (isPaid) {
    // Generate the QR code without watermark for paid users
    const qrText = localStorage.getItem("qrText"); // Retrieve saved QR code data
    if (qrText) {
      showThankYouMessage();
      generateQRCodeWithoutWatermark(qrText);

      // Hide all irrelevant elements
      document.getElementById("text-input").style.display = "none"; // Hide text input
      document.getElementById("generate-btn").style.display = "none"; // Hide Generate button

      // Replace button row with just "Download" and "Generate New"
      const buttonRow = document.querySelector(".button-row");
      buttonRow.innerHTML = `
        <button id="download-btn" onclick="downloadQRCode()">Download QR Code</button>
        <button id="generate-new-btn" onclick="resetQRCodeGenerator()">Generate Another QR Code</button>
      `;
    } else {
      alert("QR code data not found. Please generate a QR code first.");
      window.location.href = "index.html"; // Redirect to the main page
    }
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

  // Save QR text for later use (post-payment)
  localStorage.setItem("qrText", inputText);

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

// Function to generate QR code without watermark
function generateQRCodeWithoutWatermark(text) {
  const qrcodeContainer = document.getElementById("qrcode-container");
  qrcodeContainer.innerHTML = ""; // Clear existing QR codes

  new QRCode(qrcodeContainer, {
    text: text,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L,
  });

  preventCanvasDragging(); // Disable dragging
}

// Add a thank-you message for paid users
function showThankYouMessage() {
  const qrSection = document.querySelector(".qr-section");
  qrSection.style.display = "flex";
  qrSection.insertAdjacentHTML(
    "afterbegin",
    `
    <p>Thanks for your payment! Feel free to download your QR Code below.</p>
    `
  );
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
  link.download = "qrcode.png";
  link.click();
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

// Extract the QR code text from the URL
function getQueryParameter(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

const isPaidPage = getQueryParameter("paid") === "true";
const qrText = getQueryParameter("qr");

if (isPaidPage) {
  const container = document.querySelector(".container");
  const qrcodeContainer = document.getElementById("qrcode-container");

  // Clear the page and show "thank you" message
  container.innerHTML = `
    <h1>Thank you for your payment!</h1>
    <p>Your QR Code is ready for download.</p>
    <div id="qrcode-container" style="margin: 20px 0;"></div>
    <div class="button-row">
      <button id="download-btn" onclick="downloadQRCode()">Download QR Code</button>
      <button id="generate-new-btn" onclick="resetQRCodeGenerator()">Generate Another QR Code</button>
    </div>
  `;

  // Generate the QR code without watermark
  if (qrText) {
    new QRCode(document.getElementById("qrcode-container"), {
      text: qrText,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L,
    });
  } else {
    qrcodeContainer.innerHTML = "<p style='color: red;'>Error: No QR Code data provided!</p>";
  }
}

// Reset function to return to the original page
function resetQRCodeGenerator() {
  window.location.href = window.location.pathname; // Removes query parameters
}


