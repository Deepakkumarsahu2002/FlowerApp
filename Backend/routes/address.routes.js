const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const c = require('../controllers/address.controller');

router.post('/', auth, c.addAddress);
router.put('/:id', auth, c.updateAddress);
router.delete('/:id', auth, c.deleteAddress);
router.patch('/:id/default', auth, c.setDefaultAddress);

module.exports = router;
