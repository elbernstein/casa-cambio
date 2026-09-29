const ExchangeRate = require('../models/ExchangeRate');

exports.getRate = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ error: "Missing from or to query parameters" });
        }

        const rateData = await ExchangeRate.findOne({ storeId, fromCurrency: from, toCurrency: to });
        
        if (rateData) {
            res.json({ success: true, rateCompra: rateData.rateCompra, rateVenta: rateData.rateVenta });
        } else {
            res.json({ success: true, rateCompra: null, rateVenta: null }); // No rate set yet
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRate = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const { fromCurrency, toCurrency, rateCompra, rateVenta } = req.body;

        if (!fromCurrency || !toCurrency) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const updateFields = { updatedAt: Date.now() };
        if (rateCompra != null) updateFields.rateCompra = rateCompra;
        if (rateVenta != null) updateFields.rateVenta = rateVenta;

        const updatedRate = await ExchangeRate.findOneAndUpdate(
            { storeId, fromCurrency, toCurrency },
            updateFields,
            { upsert: true, new: true }
        );

        res.json({ success: true, rate: updatedRate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
