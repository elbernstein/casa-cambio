const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adController = require('../controllers/adController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/:storeId', adController.getPlaylist);
router.post('/:storeId', upload.single('ad_file'), adController.uploadAd);
router.put('/:storeId/reorder', adController.updateOrder);
router.delete('/:storeId/:adId', adController.deleteAd);

module.exports = router;
