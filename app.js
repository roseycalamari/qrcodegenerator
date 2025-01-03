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
  const container = document.querySelector(".container");

  // Check if the input is a valid URL
  if (!isValidURL(inputText)) {
    alert("Please enter a valid URL to generate a QR code.");
    return;
  }

  if (isGenerating) return; // Prevent multiple clicks
  isGenerating = true;

  generateBtn.style.display = "none"; // Hide Generate button
  loadingBar.style.display = "flex"; // Show loading bar

  setTimeout(() => {
    loadingBar.style.display = "none"; // Hide loading bar
    qrSection.style.display = "flex"; // Show QR Code section
    container.classList.add("qr-generated"); // Enable scrolling on mobile

    // Clear the QR code container
    qrcodeContainer.innerHTML = "";

    // Generate a new QR code
    const qrCode = new QRCode(qrcodeContainer, {
      text: inputText,
      width: 200,
      height: 200,
      colorDark: "#000000", // Black QR code color
      colorLight: "#ffffff", // White background for display
      correctLevel: QRCode.CorrectLevel.L, // Error correction level
    });

    // Add the watermark
    setTimeout(() => {
      addWatermarkToDisplayedQRCode();
      preventCanvasDragging();
    }, 100); // Allow QR code to render before adding watermark

    isGenerating = false;
  }, 2000); // Simulate loading time
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

// Prevent dragging of the QR code canvas
function preventCanvasDragging() {
  const qrCanvas = document.querySelector("#qrcode-container canvas");
  if (qrCanvas) {
    qrCanvas.addEventListener("dragstart", (event) => event.preventDefault());
    qrCanvas.addEventListener("mousedown", (event) => event.preventDefault());
    qrCanvas.addEventListener("touchstart", (event) => event.preventDefault());

    qrCanvas.style.pointerEvents = "none";
    qrCanvas.style.userSelect = "none";
    qrCanvas.style.webkitUserDrag = "none";
  }
}

// Add a watermark to the QR code
function addWatermarkToDisplayedQRCode() {
  const qrcodeContainer = document.getElementById("qrcode-container");
  const qrCanvas = qrcodeContainer.querySelector("canvas");

  if (!qrCanvas) {
    console.error("QR code canvas not found.");
    return;
  }

  const scaleFactor = 4; // Scale for high resolution
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
  ctx.shadowColor = "rgba(0, 0, 0, 0.02)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.32)";
  ctx.lineWidth = fontSize * 0.02;

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

// Download QR code function
function downloadQRCode() {
  const inputText = document.getElementById("text-input").value.trim();

  if (!inputText) {
    alert("Please generate a QR code first.");
    return;
  }

  const qrCodeCanvas = document.querySelector("#qrcode-container canvas");
  if (!qrCodeCanvas) {
    alert("No QR code found. Please generate one first.");
    return;
  }

  const qrResolution = 800;
  const margin = 100;
  const canvasSize = qrResolution + 2 * margin;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    qrCodeCanvas,
    margin,
    margin,
    qrResolution,
    qrResolution
  );

  let filename = "qrcode";
  try {
    const url = new URL(inputText.includes("http") ? inputText : `https://${inputText}`);
    filename = url.hostname.replace(/[^a-zA-Z0-9]/g, "_");
  } catch (e) {
    console.warn("Invalid URL, using default filename.");
  }

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${filename}_qrcode.png`;
  link.click();
}

// Reset QR code generator
function resetQRCodeGenerator() {
  const qrcodeContainer = document.getElementById("qrcode-container");
  const generateBtn = document.getElementById("generate-btn");
  const qrSection = document.querySelector(".qr-section");
  const textInput = document.getElementById("text-input");
  const loadingBar = document.getElementById("loading-bar");
  const container = document.querySelector(".container");

  qrcodeContainer.innerHTML = "";
  qrSection.style.display = "none";
  textInput.value = "";
  generateBtn.style.display = "block";
  loadingBar.style.display = "none";
  container.classList.remove("qr-generated");
}

function redirectToStripe() {
  const qrText = document.getElementById("text-input").value.trim();
  if (!qrText) {
    alert("Please generate a QR code before proceeding!");
    return;
  }

  // Your Stripe Payment Link
  const stripePaymentLink = "https://buy.stripe.com/14k2bw68BcND1JC7sw";

  // Append the QR code text as a query parameter
  const paymentLinkWithQR = `${stripePaymentLink}?qr=${encodeURIComponent(qrText)}`;
  console.log("Redirecting to Stripe with URL:", paymentLinkWithQR);

  // Redirect to Stripe
  window.location.href = paymentLinkWithQR;
}






