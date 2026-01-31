const router = require('express').Router();
const c = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.post('/', auth, c.createOrder);
router.get('/my', auth, c.myOrders);
router.get('/', auth, admin, c.getAllOrders);
router.patch('/:id/status', auth, admin, c.updateStatus);
router.patch(
  '/:id/cod-payment',
  auth,
  admin,
  c.updatePaymentStatus
);


module.exports = router;
