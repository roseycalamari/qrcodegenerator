require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Protect paid.html
app.get('/paid.html', async (req, res) => {
    if (!req.session.paymentIntentId) {
        return res.redirect('/');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(req.session.paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
            res.sendFile(path.join(__dirname, 'paid.html'));
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.redirect('/');
    }
});

// Payment success route with verification
app.get('/payment-success', async (req, res) => {
    const { payment_intent } = req.query;
    
    if (!payment_intent) {
        return res.redirect('/');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
        if (paymentIntent.status === 'succeeded') {
            req.session.paymentIntentId = payment_intent;
            res.redirect('/paid.html');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.redirect('/');
    }
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