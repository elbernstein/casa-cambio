const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, unique: true },
    montoEntrega: { type: String, default: "0" },
    monedaEntrega: {
        code: { type: String, default: "COP" },
        flagUrl: { type: String, default: "https://flagcdn.com/w160/co.webp" }
    },
    montoRecibe: { type: String, default: "0" },
    monedaRecibe: {
        code: { type: String, default: "USD" },
        flagUrl: { type: String, default: "https://flagcdn.com/w160/us.webp" }
    },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TransactionState', transactionSchema);
