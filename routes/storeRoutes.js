const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.post('/', storeController.createStore);
router.get('/', storeController.getStores);
router.get('/:id/users', storeController.getUsersByStore);
router.put('/:id/users', storeController.updateStoreCredentials);
router.put('/:id/amounts', storeController.updateStoreAmounts);
router.put('/:id/currencies', storeController.updateDefaultCurrencies);

module.exports = router;
