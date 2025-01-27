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

// Serve static files (like images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html when visiting the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Simulate the payment success
app.get('/payment-success', (req, res) => {
  // Set session to true after payment
  req.session.paid = true;
  res.redirect('/paid.html');
});

// Serve the paid.html page after payment
app.get('/paid.html', (req, res) => {
  // Check if user has paid
  if (!req.session.paid) {
    return res.redirect('/'); // If not paid, redirect to the home page
  }
  res.sendFile(path.join(__dirname, 'paid.html'));
});

// Serve the test payment link (Stripe redirect simulation)
app.get('/test-payment', (req, res) => {
  res.redirect('https://buy.stripe.com/test_9AQ5o60a43oz0XCbII');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
