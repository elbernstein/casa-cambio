const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

router.get('/', currencyController.getAllCurrencies);
router.post('/', currencyController.addCurrency);
router.delete('/:id', currencyController.deleteCurrency);
router.put('/:id/toggle', currencyController.toggleCurrencyStatus);

module.exports = router;
