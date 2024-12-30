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

function isValidURL(string) {
  try {
    const url = new URL(string);
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
setTimeout(() => {
  addWatermarkToDisplayedQRCode();
}, 100);
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

  // Set the display size for the canvas (CSS)
  canvas.style.width = `${qrCanvas.width}px`;
  canvas.style.height = `${qrCanvas.height}px`;

  // Scale the context for high-resolution rendering
  ctx.scale(scaleFactor, scaleFactor);

  // Draw the QR code onto the new canvas
  ctx.drawImage(qrCanvas, 0, 0);

  // Set text properties for watermark
  const text = "QRCodeChameleon.com";
  const fontSize = qrCanvas.width * 0.1; // Larger font size (10% of QR code width)
  ctx.font = `bold ${fontSize}px Impact`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.29)"; // Shadow color (semi-transparent black)
ctx.shadowBlur = 4;                     // Shadow blur amount
ctx.shadowOffsetX = 4;                  // Horizontal shadow offset
ctx.shadowOffsetY = 5;                  // Vertical shadow offset


  // Set text styles (fill and optional outline)
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)"; // White fill with slight transparency
  ctx.strokeStyle = "rgba(0, 0, 0, 0.32)"; // Slight outline (reduce or remove if needed)
  ctx.lineWidth = fontSize * 0.05; // Minimal outline thickness (5% of font size)

  // Draw the watermark text repeatedly in a diagonal pattern
  const gap = fontSize * 5; // Adjust spacing between text (space between repetitions)
  for (let y = -gap; y < canvas.height / scaleFactor + gap; y += gap) {
    for (let x = -gap; x < canvas.width / scaleFactor + gap; x += gap) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 6); // Rotate text diagonally

      // Draw the text
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

function purchaseQRCode() {
  alert("Redirecting to the purchase page...");
  // You can redirect the user to a payment page or display a modal.
  window.location.href = "https://buy.stripe.com/14k2bw68BcND1JC7sw"; // Replace with your actual payment URL.
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

  // Create a download link
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png"); // Convert the canvas to a PNG
  link.download = "qrcode_with_margin.png"; // Set the file name
  link.click(); // Trigger the download
}


function resetQRCodeGenerator() {
  const qrcodeContainer = document.getElementById("qrcode-container");
  const generateBtn = document.getElementById("generate-btn");
  const qrSection = document.querySelector(".qr-section");
  const textInput = document.getElementById("text-input");

  // Clear the QR code
  qrcodeContainer.innerHTML = "";

  // Hide QR section
  qrSection.style.display = "none";

  // Show the Generate QR Code button
  generateBtn.style.display = "block";

  // Clear the text input
  textInput.value = ""; // Reset the input field to an empty string
}

function enableDownloadWithoutWatermark() {
  const button = document.getElementById("download-no-watermark-btn");
  button.classList.add("enabled");
  button.disabled = false; // Enable the button
}


function downloadQRCodeWithoutWatermark() {
  const inputText = document.getElementById("text-input").value.trim();

  if (!inputText) {
    alert("Please generate a QR code first.");
    return;
  }

  // Create a high-resolution canvas
  const resolution = 2000; // High-resolution size of the QR code
  const margin = 100; // Margin around the QR code  
  const canvasSize = resolution + 2 * margin; // Total canvas size with margins
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  // Fill the background with white
  ctx.fillStyle = "#ffffff"; // White background
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill entire canvas with white background

  // Get the existing QR code from the container
  const qrCodeCanvas = document.querySelector("#qrcode-container canvas");
  if (!qrCodeCanvas) {
    alert("No QR code found. Please generate one first.");
    return;
  }

  // Draw the QR code onto the main canvas, centered with margin
  ctx.drawImage(
    qrCodeCanvas,
    margin, // Start x position
    margin, // Start y position
    resolution, // Width of QR code
    resolution // Height of QR code
  );

  // Download the canvas as an image
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "qrcode_no_watermark_hd.png";
  link.click();
}

