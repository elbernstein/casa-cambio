const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');

router.get('/:storeId', rateController.getRate);
router.put('/:storeId', rateController.updateRate);

module.exports = router;
