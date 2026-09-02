const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, unique: true },
    defaultMonedaEntrega: {
        code: { type: String, default: "COP" },
        flagUrl: { type: String, default: "https://flagcdn.com/w160/co.webp" }
    },
    defaultMonedaRecibe: {
        code: { type: String, default: "USD" },
        flagUrl: { type: String, default: "https://flagcdn.com/w160/us.webp" }
    },
    idleTimeoutSeconds: { type: Number, default: 15 },
    maxAdsLimit: { type: Number, default: 10 }
});

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
