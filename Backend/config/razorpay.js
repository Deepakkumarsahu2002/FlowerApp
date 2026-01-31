const Razorpay = require('razorpay');

// Validate Razorpay configuration
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  WARNING: Razorpay keys are not configured in environment variables!');
  console.warn('   Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpayInstance;
