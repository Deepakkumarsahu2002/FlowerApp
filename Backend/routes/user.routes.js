const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const c = require('../controllers/user.controller');

router.get('/me', auth, c.getMyProfile);
router.put('/me', auth, c.updateMyProfile);

module.exports = router;
