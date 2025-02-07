// server.js
const express = require('express');
const app = express();
const session = require('express-session');

app.use(express.static('public'));
app.use(express.json());
app.use(session({
    secret: 'temporary-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Store QR data temporarily
app.post('/store-qr', (req, res) => {
    const { qrDataURL, qrText } = req.body;
    req.session.qrData = { qrDataURL, qrText };
    res.json({ success: true });
});

// Retrieve QR data
app.get('/get-qr', (req, res) => {
    if (req.session.qrData) {
        res.json(req.session.qrData);
    } else {
        res.status(403).json({ error: 'No QR data found' });
    }
});

// Cleanup session
app.post('/cleanup-session', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Create test checkout session
app.post('/create-test-checkout', async (req, res) => {
    // For now, just redirect to paid page
    res.json({ url: '/paid.html' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
