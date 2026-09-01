const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/:storeId', settingsController.getSettings);
router.post('/:storeId', settingsController.updateSettings);

module.exports = router;
