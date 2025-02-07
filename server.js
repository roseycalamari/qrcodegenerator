const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Serve static files
app.use(express.static(__dirname));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Protect paid.html
app.get('/paid.html', (req, res) => {
    if (req.session.hasPaid) {
        res.sendFile(path.join(__dirname, 'paid.html'));
    } else {
        res.redirect('/');
    }
});

// Payment success route
app.get('/payment-success', (req, res) => {
    req.session.hasPaid = true;
    res.redirect('/paid.html');
});

// Environment variables for deployment
const PORT = process.env.PORT || 3002;
const DOMAIN = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`;

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running at ${DOMAIN}`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is in use. Please try another port.`);
    } else {
        console.error('Server error:', error);
    }
});