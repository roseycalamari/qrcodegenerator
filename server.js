const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// Use express-session to store user session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // For testing purposes, disable secure cookies if not using HTTPS
}));

app.use(express.json());  // To handle JSON requests

// Serve static files (like images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html when visiting the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to store QR code data in the session
app.post('/store-qr', (req, res) => {
  const { qrDataURL } = req.body;
  req.session.qrDataURL = qrDataURL;  // Store QR code in session
  res.status(200).send({ message: 'QR code saved in session' });
});

// Route to retrieve the QR code data from the session
app.get('/get-qr', (req, res) => {
  res.json({ qrDataURL: req.session.qrDataURL || null });
});

// Serve the paid.html page after payment
app.get('/paid.html', (req, res) => {
  if (!req.session.qrDataURL) {
    return res.redirect('/'); // If no QR code data exists, redirect to the home page
  }
  res.sendFile(path.join(__dirname, 'paid.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
