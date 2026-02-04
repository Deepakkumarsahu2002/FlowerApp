const router = require('express').Router();
const c = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/signup', c.signup);
router.post('/login', c.login);
router.post('/request-email-verification', c.requestEmailVerification);
router.post('/verify-email', c.verifyEmail);
router.post('/request-phone-otp', c.requestPhoneOtp);
router.post('/verify-phone-otp', c.verifyPhoneOtp);
router.get('/me', auth, c.me);

module.exports = router;
