require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced rate limiting with more granular controls
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// More secure session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    sameSite: 'strict', // Helps prevent CSRF
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
};

// Use memory store in production, consider Redis/MongoDB for scaling
if (process.env.NODE_ENV === 'production') {
  const RedisStore = require('connect-redis')(session);
  const redis = require('redis');
  const redisClient = redis.createClient();
  sessionConfig.store = new RedisStore({ client: redisClient });
}

app.use(session(sessionConfig));

// Middleware for parsing JSON with size limit
app.use(express.json({ 
  limit: '10kb',  // Prevent large payload attacks
  strict: true    // Only accept arrays and objects
}));

// Helmet for additional security headers
const helmet = require('helmet');
app.use(helmet());

// Create test checkout session
app.post('/create-test-checkout', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_TEST_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/paid.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/`,
      metadata: {
        isTest: 'true'
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout Session Error:', err);
    res.status(500).json({ error: 'Checkout failed', details: err.message });
  }
});

// Handle test payment success with enhanced validation
app.get('/test-payment-success', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) {
    return res.redirect('/?error=invalid_session');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Strict payment verification
    if (session.payment_status === 'paid' && session.metadata?.isTest === 'true') {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.redirect('/?error=session_error');
        }
        req.session.paymentVerified = true;
        req.session.testPayment = true;
        res.redirect('/paid.html');
      });
    } else {
      res.redirect('/?error=payment_invalid');
    }
  } catch (err) {
    console.error('Payment Verification Error:', err);
    res.redirect('/?error=verification_failed');
  }
});

// Stripe webhook for production-level validation
app.post('/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Log and process successful payments
        console.log('Payment successful:', session.id);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({received: true});
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Enhanced payment verification middleware
const verifyPayment = (req, res, next) => {
  if (!req.session.paymentVerified) {
    console.warn('Unauthorized access attempt');
    return res.status(403).redirect('/');
  }
  
  // Add additional security headers
  res.setHeader('X-Payment-Verified', 'true');
  
  if (req.session.testPayment) {
    res.setHeader('X-Test-Payment', 'true');
  }
  
  next();
};

// Serve static files with security headers
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net");
    }
  }
}));

// Routes with clear separation
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Store QR data with validation
app.post('/store-qr', (req, res) => {
  const { qrDataURL, qrText } = req.body;
  
  // Strict validation of input
  if (!qrDataURL || !qrText || qrDataURL.length > 10000) {
    return res.status(400).json({ error: 'Invalid QR data' });
  }
  
  req.session.qrDataURL = qrDataURL;
  req.session.qrText = qrText;
  res.status(200).json({ message: 'QR code saved' });
});

// Protected QR data retrieval
app.get('/get-qr', verifyPayment, (req, res) => {
  if (!req.session.qrDataURL || !req.session.qrText) {
    return res.status(404).json({ error: 'QR data expired' });
  }
  
  res.json({ 
    qrDataURL: req.session.qrDataURL,
    qrText: req.session.qrText
  });
});

// Protect paid page with strict verification
app.get('/paid.html', verifyPayment, (req, res) => {
  if (!req.session.qrDataURL) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'paid.html'));
});

// Session cleanup endpoint
app.post('/cleanup-session', verifyPayment, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session cleanup error:', err);
      return res.status(500).json({ error: 'Cleanup failed' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ message: 'Session cleared' });
  });
});

// Comprehensive error handling
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Server error', 
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
});

// Graceful server startup and shutdown
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});