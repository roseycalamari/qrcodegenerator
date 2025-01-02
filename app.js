let isGenerating = false; // Prevent multiple QR code generations
const watermarkImagePath = "watermark.png"; // Path to the watermark image

// Add "Enter" key functionality to trigger QR code generation
document.getElementById("text-input").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    generateQRCode();
  }
});

function generateQRCode() {
  const inputText = document.getElementById("text-input").value.trim();
  const generateBtn = document.getElementById("generate-btn");
  const loadingBar = document.getElementById("loading-bar");
  const qrSection = document.querySelector(".qr-section");
  const qrcodeContainer = document.getElementById("qrcode-container");

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

    // Add watermark overlay to the displayed QR code and prevent dragging
    setTimeout(() => {
      addWatermarkToDisplayedQRCode();
      preventCanvasDragging(); // Ensure drag prevention
    }, 100); // Add a delay to allow QR code rendering

    isGenerating = false;
  }, 2000); // Simulate loading time
}

// Helper function to validate URLs
function isValidURL(string) {
  try {
    // Check if the URL has a protocol; if not, prepend "https://"
    const url = new URL(string.includes('http') ? string : `https://${string}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function preventCanvasDragging() {
  const qrCanvas = document.querySelector("#qrcode-container canvas");
  if (qrCanvas) {
    // Disable drag events
    qrCanvas.addEventListener("dragstart", (event) => {
      event.preventDefault();
    });

    // Disable mouse interactions
    qrCanvas.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });

    // Disable touch interactions
    qrCanvas.addEventListener("touchstart", (event) => {
      event.preventDefault();
    });

    // Apply explicit CSS to prevent dragging
    qrCanvas.style.pointerEvents = "none";
    qrCanvas.style.userSelect = "none";
    qrCanvas.style.webkitUserDrag = "none";
  }
}

function addWatermarkToDisplayedQRCode() {
  const qrcodeContainer = document.getElementById("qrcode-container");
  const qrCanvas = qrcodeContainer.querySelector("canvas");

  if (!qrCanvas) {
    console.error("QR code canvas not found.");
    return;
  }

  // Create a high-resolution canvas
  const scaleFactor = 4; // Scale up the canvas resolution
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = qrCanvas.width * scaleFactor;
  canvas.height = qrCanvas.height * scaleFactor;

  // Scale the context for high-resolution rendering
  ctx.scale(scaleFactor, scaleFactor);

  // Draw the QR code onto the new canvas
  ctx.drawImage(qrCanvas, 0, 0);

  // Set text properties for watermark
  const text = "QRCodeChameleon.com";
  const fontSize = qrCanvas.width * 0.1; // Font size (10% of QR code width)
  ctx.font = `bold ${fontSize}px Impact`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.03)"; // Shadow color
  ctx.shadowBlur = 3; // Shadow blur amount
  ctx.shadowOffsetX = 2; // Horizontal shadow offset
  ctx.shadowOffsetY = 2; // Vertical shadow offset

  // Set text styles
  ctx.fillStyle = "rgba(255, 255, 255, 0.57)"; // White fill with transparency
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)"; // Black outline
  ctx.lineWidth = fontSize * 0.02; // Outline thickness (5% of font size)

  // Draw the watermark text repeatedly in a diagonal pattern
  const gap = fontSize * 5; // Adjust spacing between text
  for (let y = -gap; y < canvas.height / scaleFactor + gap; y += gap) {
    for (let x = -gap; x < canvas.width / scaleFactor + gap; x += gap) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 6); // Rotate text diagonally

      // Draw the text with both fill and outline
      ctx.fillText(text, 0, 0); // Fill text
      ctx.strokeText(text, 0, 0); // Outline text

      ctx.restore();
    }
  }

  // Replace the original QR code with the watermarked version
  qrcodeContainer.innerHTML = "";
  qrcodeContainer.appendChild(canvas);

  // Prevent dragging
  preventCanvasDragging();
}

function downloadQRCode() {
  const inputText = document.getElementById("text-input").value.trim();

  if (!inputText) {
    alert("Please generate a QR code first.");
    return;
  }

  // Get the QR code canvas
  const qrCodeCanvas = document.querySelector("#qrcode-container canvas");
  if (!qrCodeCanvas) {
    alert("No QR code found. Please generate one first.");
    return;
  }

  // Create a high-resolution canvas for download
  const qrResolution = 800; // Resolution of the QR code itself (e.g., 800x800)
  const margin = 100; // Margin size around the QR code
  const canvasSize = qrResolution + 2 * margin; // Total canvas size including margins
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set the canvas size
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  // Fill the background with white
  ctx.fillStyle = "#ffffff"; // White background
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill entire canvas

  // Draw the QR code in the center with margins
  ctx.drawImage(
    qrCodeCanvas,
    margin, // Start X (leave margin)
    margin, // Start Y (leave margin)
    qrResolution, // Width of the QR code
    qrResolution // Height of the QR code
  );

  // Extract the domain name or a sanitized version of the URL for the file name
  let filename = "qrcode"; // Default name
  try {
    const url = new URL(inputText.includes('http') ? inputText : `https://${inputText}`);
    filename = url.hostname.replace(/[^a-zA-Z0-9]/g, "_"); // Replace special characters with "_"
  } catch (e) {
    console.warn("Invalid URL, using default filename.");
  }

  // Create a download link
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png"); // Convert the canvas to a PNG
  link.download = `${filename}_qrcode.png`; // Use the dynamic filename
  link.click(); // Trigger the download
}


function resetQRCodeGenerator() {
  const qrcodeContainer = document.getElementById("qrcode-container");
  const textInput = document.getElementById("text-input");
  const generateBtn = document.getElementById("generate-btn");
  const qrSection = document.querySelector(".qr-section");
  const loadingBar = document.getElementById("loading-bar");

  // Clear the QR Code container
  qrcodeContainer.innerHTML = "";

  // Clear the input field for new text/URL
  textInput.value = "";

  // Hide the QR section
  qrSection.style.display = "none";

  // Show the "Generate" button and hide the loading bar
  generateBtn.style.display = "block";
  loadingBar.style.display = "none";
}
