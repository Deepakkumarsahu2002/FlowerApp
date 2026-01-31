const router = require('express').Router();
const c = require('../controllers/category.controller');

router.get('/categories', c.getAllCategories);
router.get('/occasions', c.getAllOccasions);

module.exports = router;
