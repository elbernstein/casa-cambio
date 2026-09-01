const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, unique: true },
    idleTimeoutSeconds: { type: Number, default: 15 },
    maxAdsLimit: { type: Number, default: 10 }
});

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
