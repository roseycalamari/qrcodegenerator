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

// Explicitly set port to 3001
const server = app.listen(3002, () => {
    console.log('Server running at http://localhost:3002');  // Updated log message too
    console.log('Press Ctrl+C to stop the server');
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error('Port 3002 is in use. Please try another port.');  // Updated error message
    } else {
        console.error('Server error:', error);
    }
});