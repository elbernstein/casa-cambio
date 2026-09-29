const Currency = require('../models/Currency');

exports.getAllCurrencies = async (req, res) => {
    try {
        let currencies = await Currency.find().sort({ strength: -1 });
        if (currencies.length === 0) {
            const defaultCurrencies = [
                { code: 'USD', flagUrl: 'https://flagcdn.com/w160/us.webp', strength: 70 },
                { code: 'EUR', flagUrl: 'https://flagcdn.com/w160/eu.webp', strength: 90 },
                { code: 'COP', flagUrl: 'https://flagcdn.com/w160/co.webp', strength: 20 },
                { code: 'CAD', flagUrl: 'https://flagcdn.com/w160/ca.webp', strength: 60 },
                { code: 'MXN', flagUrl: 'https://flagcdn.com/w160/mx.webp', strength: 40 },
                { code: 'GBP', flagUrl: 'https://flagcdn.com/w160/gb.webp', strength: 100 },
                { code: 'BRL', flagUrl: 'https://flagcdn.com/w160/br.webp', strength: 50 },
                { code: 'CHF', flagUrl: 'https://flagcdn.com/w160/ch.webp', strength: 80 },
                { code: 'ARS', flagUrl: 'https://flagcdn.com/w160/ar.webp', strength: 30 },
                { code: 'CLP', flagUrl: 'https://flagcdn.com/w160/cl.webp', strength: 10 },
                { code: 'VES', flagUrl: 'https://flagcdn.com/w160/ve.webp', strength: 1 }
            ];
            await Currency.insertMany(defaultCurrencies);
            currencies = await Currency.find().sort({ strength: -1 });
        }
        res.json(currencies);
    } catch (err) {
        console.error('Error getting currencies:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.addCurrency = async (req, res) => {
    try {
        const { code, flagUrl, strength } = req.body;
        if (!code || !flagUrl) {
            return res.status(400).json({ error: 'Code and flagUrl are required' });
        }
        
        const existing = await Currency.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ error: 'Currency code already exists' });
        }

        const newCurrency = new Currency({
            code: code.toUpperCase(),
            flagUrl,
            strength: strength || 0
        });

        await newCurrency.save();
        res.status(201).json(newCurrency);
    } catch (err) {
        console.error('Error adding currency:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteCurrency = async (req, res) => {
    try {
        const { id } = req.params;
        await Currency.findByIdAndDelete(id);
        res.json({ message: 'Currency deleted successfully' });
    } catch (err) {
        console.error('Error deleting currency:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
