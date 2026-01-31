const router = require('express').Router();
const c = require('../controllers/payment.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/razorpay/create', auth, c.createRazorpayOrder);
router.post('/razorpay/verify', auth, c.verifyPayment);

module.exports = router;
