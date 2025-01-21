const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (like images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html when visiting the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the paid.html page after payment
app.get('/paid.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'paid.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
