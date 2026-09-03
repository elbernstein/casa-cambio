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
            res.json({ success: true, rate: rateData.rate });
        } else {
            res.json({ success: true, rate: null }); // No rate set yet
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRate = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const { fromCurrency, toCurrency, rate } = req.body;

        if (!fromCurrency || !toCurrency || rate == null) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const updatedRate = await ExchangeRate.findOneAndUpdate(
            { storeId, fromCurrency, toCurrency },
            { rate, updatedAt: Date.now() },
            { upsert: true, new: true }
        );

        res.json({ success: true, rate: updatedRate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
