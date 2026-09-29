const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // e.g. USD, COP, EUR
    flagUrl: { type: String, required: true }, // URL de la bandera
    strength: { type: Number, required: true, default: 0 }, // Jerarquía de la moneda (mayor número = más fuerte)
});

module.exports = mongoose.model('Currency', currencySchema);
