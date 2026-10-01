const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // e.g. USD, COP, EUR
    name: { type: String, default: '' }, // e.g. Dólar Americano
    flagUrl: { type: String, required: true }, // URL de la bandera
    strength: { type: Number, required: true, default: 0 }, // Jerarquía de la moneda (mayor número = más fuerte)
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Currency', currencySchema);
