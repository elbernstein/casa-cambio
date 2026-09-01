const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, unique: true },
    montoEntrega: { type: String, default: "0" },
    montoRecibe: { type: String, default: "0" },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TransactionState', transactionSchema);
