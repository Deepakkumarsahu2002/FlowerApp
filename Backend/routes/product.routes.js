const router = require('express').Router();
const c = require('../controllers/product.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', auth, admin, c.create);
router.put('/:id', auth, admin, c.update);
router.delete('/:id', auth, admin, c.remove);

module.exports = router;
