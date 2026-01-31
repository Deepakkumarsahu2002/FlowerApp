const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

exports.createRazorpayOrder = async (req, res) => {
  try {
    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        message: 'Razorpay is not configured on the server. Please contact administrator.',
        code: 'RAZORPAY_NOT_CONFIGURED'
      });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const options = {
      amount: order.total_amount * 100,
      currency: "INR",
      receipt: order.order_number
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.razorpay_order_id = razorpayOrder.id;
    await order.save();

    res.json(razorpayOrder);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    // Handle specific Razorpay API errors
    if (error.statusCode === 401 || error.error?.code === 'BAD_REQUEST_ERROR') {
      return res.status(401).json({ 
        message: 'Invalid Razorpay API credentials. Please check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env file.',
        code: 'RAZORPAY_AUTH_ERROR',
        details: error.error?.description || error.message
      });
    }
    
    if (error.statusCode === 400) {
      return res.status(400).json({ 
        message: error.error?.description || error.message || 'Invalid request to Razorpay',
        code: 'RAZORPAY_BAD_REQUEST'
      });
    }

    res.status(400).json({ 
      message: error.message || 'Error creating Razorpay order',
      code: 'RAZORPAY_ERROR'
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.payment_status = "paid";
    order.razorpay_payment_id = razorpay_payment_id;
    order.order_status = "confirmed";
    await order.save();

    res.json({ message: "Payment verified" });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(400).json({ message: error.message || 'Error verifying payment' });
  }
};

