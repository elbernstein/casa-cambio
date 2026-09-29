const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    fromCurrency: { type: String, required: true },
    toCurrency: { type: String, required: true },
    rateCompra: { type: Number, default: 0 },
    rateVenta: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

// Ensure a store only has one rate per currency pair direction
exchangeRateSchema.index({ storeId: 1, fromCurrency: 1, toCurrency: 1 }, { unique: true });

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
