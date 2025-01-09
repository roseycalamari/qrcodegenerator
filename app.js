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

  const qrCanvas = document.createElement("canvas");
  const size = 1000; // High resolution: 1000x1000 pixels
  const margin = 40; // Add margin around the QR code

  // Generate QR code on a high-resolution canvas
  const qrCode = new QRCode(qrcodeContainer, {
    text: text,
    width: size,
    height: size,
    colorDark: "#000000", // QR code color
    colorLight: "#ffffff", // Background color
    correctLevel: QRCode.CorrectLevel.H, // High error correction level
  });

  // Once the QR code is generated, draw it on a larger canvas with margins
  setTimeout(() => {
    const tempCanvas = qrcodeContainer.querySelector("canvas");
    const ctx = qrCanvas.getContext("2d");

    qrCanvas.width = size + 2 * margin;
    qrCanvas.height = size + 2 * margin;

    // Fill the background with white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);

    // Draw the QR code on the larger canvas
    ctx.drawImage(tempCanvas, margin, margin);

    // Replace the QR code container content with the high-resolution canvas
    qrcodeContainer.innerHTML = "";
    qrcodeContainer.appendChild(qrCanvas);

    // Prevent dragging
    preventCanvasDragging();
  }, 0);
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
  const tempCanvas = qrcodeContainer.querySelector("canvas");

  if (!tempCanvas) {
    console.error("QR code canvas not found.");
    return;
  }

  const size = 1000; // High resolution: 1000x1000 pixels
  const margin = 50; // Add margin around the QR code
  const logoSize = size * 0.4; // Larger logo size (20% of the QR code size)
  const watermarkText = "QRCodeChameleon.com"; // Text to display

  const qrCanvas = document.createElement("canvas");
  const ctx = qrCanvas.getContext("2d");

  qrCanvas.width = size + 2 * margin;
  qrCanvas.height = size + 2 * margin;

  // Draw a white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);

  // Draw the original QR code onto the high-resolution canvas
  ctx.drawImage(tempCanvas, margin, margin, size, size);

  // Load the logo
  const logo = new Image();
  logo.src = "chameleon logo white.png"; // Replace with the path to your logo image

  logo.onload = () => {
    console.log("Drawing two logos and diagonal text with outline");

    // Set global settings for shadow and opacity
    ctx.globalAlpha = 0.5; // Set low opacity for watermark
    ctx.shadowColor = "rgba(0, 0, 0, 0.61)"; // Shadow color
    ctx.shadowBlur = 6; // Shadow blur level
    ctx.shadowOffsetX = 5; // Horizontal shadow offset
    ctx.shadowOffsetY = 5; // Vertical shadow offset

    // Draw logos at the top-left and bottom-right corners
    const corners = [
      { x: margin, y: margin }, // Top-left
      { x: qrCanvas.width - margin - logoSize, y: qrCanvas.height - margin - logoSize }, // Bottom-right
    ];

    corners.forEach((corner) => {
      ctx.drawImage(
        logo,
        corner.x,
        corner.y,
        logoSize,
        logoSize
      );
    });

    // Draw the diagonal text in the center
    ctx.globalAlpha = 0.7; // Slightly higher opacity for the text
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Semi-transparent white text
    ctx.strokeStyle = "rgba(0, 0, 0, 0.42)"; // Semi-transparent black outline
    const maxTextWidth = size * 1.3; // Ensure text fits inside QR code
    ctx.font = `bold ${logoSize * 0.8}px Arial`; // Dynamically scaled font size
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 5; // Thickness of the outline

    // Measure and scale text to fit within QR code
    let textWidth = ctx.measureText(watermarkText).width;
    while (textWidth > maxTextWidth) {
      const currentFontSize = parseFloat(ctx.font.match(/\d+/)[0]); // Extract font size
      ctx.font = `bold ${currentFontSize - 2}px Arial`; // Reduce font size
      textWidth = ctx.measureText(watermarkText).width;
    }

    // Rotate and draw the text diagonally
    ctx.save();
    ctx.translate(qrCanvas.width / 2, qrCanvas.height / 2); // Move to the center
    ctx.rotate(-Math.PI / 4); // Rotate 45 degrees
    ctx.fillText(watermarkText, 0, 0); // Draw filled text
    ctx.strokeText(watermarkText, 0, 0); // Draw outlined text
    ctx.restore();

    // Replace the container's content with the new canvas
    qrcodeContainer.innerHTML = "";
    qrcodeContainer.appendChild(qrCanvas);

    // Prevent dragging
    preventCanvasDragging(); // Ensure dragging is disabled
  };

  // Handle error in case the logo fails to load
  logo.onerror = () => {
    console.error("Failed to load the logo.");
  };
}

// Function to prevent dragging of the QR code canvas
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

  const qrText = localStorage.getItem("qrText") || "QR_Code";
  const sanitizedFileName = sanitizeFileName(qrText);

  const link = document.createElement("a");
  link.href = qrCodeCanvas.toDataURL("image/png"); // Export as PNG
  link.download = `${sanitizedFileName}_high_quality.png`; // Name the file
  link.click();
}

// Helper function to sanitize file names
function sanitizeFileName(text) {
  return text.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50); // Remove special characters
}

// Redirect to Stripe for payment
function redirectToStripe() {
  const qrText = document.getElementById("text-input").value.trim();

  if (!qrText) {
    alert("Please generate a QR code before proceeding!");
    return;
  }

  // Save QR text for later use
  localStorage.setItem("qrText", qrText);

  // Generate a unique session ID
  const sessionId = `session_${Math.random().toString(36).substring(2)}`;
  localStorage.setItem("session_id", sessionId);

  // Stripe test payment link with session ID
  const stripePaymentLink = `https://buy.stripe.com/test_9AQ5o60a43oz0XCbII?session_id=${sessionId}`;

  // Redirect to Stripe
  window.location.href = stripePaymentLink;
}



// Extract the QR code text from the URL
function getQueryParameter(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// Function to handle ?paid=true page
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isPaid = urlParams.get("paid") === "true";

  // Retrieve session ID and QR code data from localStorage
  const sessionId = urlParams.get("session_id");
  const savedSessionId = localStorage.getItem("session_id");
  const qrText = localStorage.getItem("qrText");

  if (isPaid) {
    // Validate the session ID
    if (!sessionId || sessionId !== savedSessionId) {
      alert("Unauthorized access. Please complete the payment first.");
      window.location.href = "/"; // Redirect to the main page
      return;
    }

    // Validation passed, display thank you message and QR code
    if (qrText) {
      const container = document.querySelector(".container");
      container.innerHTML = `
        <h1>Thank you for your payment!</h1>
        <p>Your QR Code is ready for download.</p>
        <div id="qrcode-container" style="margin: 20px 0;"></div>
        <div class="button-row">
          <button id="download-btn" onclick="downloadQRCode()">Download</button>
          <button id="generate-new-btn" onclick="resetQRCodeGenerator()">Generate New</button>
        </div>
      `;

      // Generate the QR code without watermark
      generateQRCodeWithoutWatermark(qrText);
    } else {
      alert("Error: QR code data not found. Please generate a new QR code.");
      window.location.href = "/";
    }
  } else {
    // Redirect unauthorized access to the homepage
    window.location.href = "/";
  }
});


// Function to generate QR code without watermark
function generateQRCodeWithoutWatermark(text) {
  const qrcodeContainer = document.getElementById("qrcode-container");
  qrcodeContainer.innerHTML = ""; // Clear any existing QR codes

  const qrSize = 300; // Set a reasonable size for the QR code

  new QRCode(qrcodeContainer, {
    text: text,
    width: qrSize,
    height: qrSize,
    colorDark: "#000000", // Black QR code
    colorLight: "#ffffff", // White background
    correctLevel: QRCode.CorrectLevel.H, // High error correction level
  });
}




// Function to generate a high-quality QR code
function generateHighQualityQRCode(text) {
  const qrcodeContainer = document.getElementById("qrcode-container");
  qrcodeContainer.innerHTML = ""; // Clear any existing QR codes

  const qrCanvas = document.createElement("canvas");
  const ctx = qrCanvas.getContext("2d");
  const size = 1000; // High resolution: 1000x1000 pixels
  const margin = 50; // Add margin around the QR code

  qrCanvas.width = size + 2 * margin;
  qrCanvas.height = size + 2 * margin;

  // Create a temporary QR code to draw onto the high-resolution canvas
  const tempQRCode = new QRCode(document.createElement("div"), {
    text: text,
    width: size,
    height: size,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H, // High error correction level
  });

  // Extract the generated QR code and draw it onto the high-resolution canvas
  setTimeout(() => {
    const tempCanvas = tempQRCode._oDrawing._elCanvas;

    // Draw a white background on the high-resolution canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);

    // Draw the QR code with margin
    ctx.drawImage(tempCanvas, margin, margin, size, size);

    // Replace the container content with the high-resolution QR code
    qrcodeContainer.appendChild(qrCanvas);

    // Prevent dragging
    preventCanvasDragging();
  }, 100);
}

// Function to download the QR code as a high-quality image
function downloadQRCode() {
  const qrCodeCanvas = document.querySelector("#qrcode-container canvas");

  if (!qrCodeCanvas) {
    alert("No QR code found!");
    return;
  }

  const qrText = localStorage.getItem("qrText") || "QR_Code";
  const sanitizedFileName = sanitizeFileName(qrText);

  const link = document.createElement("a");
  link.href = qrCodeCanvas.toDataURL("image/png"); // Export as PNG
  link.download = `${sanitizedFileName}_high_quality.png`; // Name the file
  link.click();
}

// Helper function to sanitize file names
function sanitizeFileName(text) {
  return text.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 50); // Remove special characters
}

// Function to reset the QR code generator
function resetQRCodeGenerator() {
  localStorage.removeItem("session_id"); // Clear session ID
  localStorage.removeItem("qrText"); // Clear QR text
  window.location.href = "/"; // Redirect to the main page
}


// Function to prevent dragging of QR code canvas
function preventCanvasDragging() {
  const qrCanvas = document.querySelector("#qrcode-container canvas");
  if (qrCanvas) {
    qrCanvas.addEventListener("dragstart", (event) => event.preventDefault());
    qrCanvas.addEventListener("mousedown", (event) => event.preventDefault());
    qrCanvas.addEventListener("touchstart", (event) => event.preventDefault());
    qrCanvas.style.pointerEvents = "none";
  }
}

// Helper function to get query parameters
function getQueryParameter(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

