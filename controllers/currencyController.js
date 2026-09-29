const Currency = require('../models/Currency');

exports.getAllCurrencies = async (req, res) => {
    try {
        let currencies = await Currency.find().sort({ strength: -1 });
        const defaultCurrencies = [
            { code: 'USD', name: 'DÓLAR AMERICANO (USD)', flagUrl: 'https://flagcdn.com/w160/us.webp', strength: 70 },
            { code: 'EUR', name: 'EURO (EUR)', flagUrl: 'https://flagcdn.com/w160/eu.webp', strength: 90 },
            { code: 'COP', name: 'Peso Colombiano (COP)', flagUrl: 'https://flagcdn.com/w160/co.webp', strength: 20 },
            { code: 'CAD', name: 'Dólar Canadiense (CAD)', flagUrl: 'https://flagcdn.com/w160/ca.webp', strength: 60 },
            { code: 'MXN', name: 'Peso Mexicano (MXN)', flagUrl: 'https://flagcdn.com/w160/mx.webp', strength: 40 },
            { code: 'GBP', name: 'Libra Esterlina (GBP)', flagUrl: 'https://flagcdn.com/w160/gb.webp', strength: 100 },
            { code: 'BSD', name: 'Dólar Bahamas (BSD)', flagUrl: 'https://flagcdn.com/w160/bs.webp', strength: 65 },
            { code: 'NZD', name: 'Dólar Nueva Zelanda (NZD)', flagUrl: 'https://flagcdn.com/w160/nz.webp', strength: 55 },
            { code: 'CLP', name: 'Peso Chileno (CLP)', flagUrl: 'https://flagcdn.com/w160/cl.webp', strength: 10 },
            { code: 'JPY', name: 'Yen Japonés (JPY)', flagUrl: 'https://flagcdn.com/w160/jp.webp', strength: 45 },
            { code: 'PEN', name: 'Nuevo Sol Perú (PEN)', flagUrl: 'https://flagcdn.com/w160/pe.webp', strength: 25 },
            { code: 'AUD', name: 'Dólar Australiano (AUD)', flagUrl: 'https://flagcdn.com/w160/au.webp', strength: 58 },
            { code: 'BRL', name: 'Real Brasileño (BRL)', flagUrl: 'https://flagcdn.com/w160/br.webp', strength: 50 },
            { code: 'CHF', name: 'Franco Suizo (CHF)', flagUrl: 'https://flagcdn.com/w160/ch.webp', strength: 80 },
            { code: 'ARS', name: 'Peso Argentino (ARS)', flagUrl: 'https://flagcdn.com/w160/ar.webp', strength: 30 },
            { code: 'GTQ', name: 'Quetzal Guatemala (GTQ)', flagUrl: 'https://flagcdn.com/w160/gt.webp', strength: 15 },
            { code: 'NIO', name: 'Cordoba Nicaragua (NIO)', flagUrl: 'https://flagcdn.com/w160/ni.webp', strength: 12 },
            { code: 'DOP', name: 'Peso Dominicano (DOP)', flagUrl: 'https://flagcdn.com/w160/do.webp', strength: 18 },
            { code: 'CNY', name: 'Yuan Chino (CNY)', flagUrl: 'https://flagcdn.com/w160/cn.webp', strength: 68 },
            { code: 'AWG', name: 'Florin Aruba (AWG)', flagUrl: 'https://flagcdn.com/w160/aw.webp', strength: 22 },
            { code: 'DKK', name: 'Corona Danesa (DKK)', flagUrl: 'https://flagcdn.com/w160/dk.webp', strength: 75 },
            { code: 'ANG', name: 'Florin Caribeño (ANG)', flagUrl: 'https://flagcdn.com/w160/cw.webp', strength: 24 },
            { code: 'BOB', name: 'Peso Bolivia (BOB)', flagUrl: 'https://flagcdn.com/w160/bo.webp', strength: 16 },
            { code: 'TRY', name: 'Lira Turca (TRY)', flagUrl: 'https://flagcdn.com/w160/tr.webp', strength: 35 },
            { code: 'SEK', name: 'Corona Sueca (SEK)', flagUrl: 'https://flagcdn.com/w160/se.webp', strength: 72 },
            { code: 'THB', name: 'Baht Tailandia (THB)', flagUrl: 'https://flagcdn.com/w160/th.webp', strength: 42 },
            { code: 'CRC', name: 'Colón Costa Rica (CRC)', flagUrl: 'https://flagcdn.com/w160/cr.webp', strength: 19 },
            { code: 'KRW', name: 'Won Corea del Sur (KRW)', flagUrl: 'https://flagcdn.com/w160/kr.webp', strength: 48 },
            { code: 'UYU', name: 'Peso Uruguay (UYU)', flagUrl: 'https://flagcdn.com/w160/uy.webp', strength: 28 },
            { code: 'AED', name: 'Dirham Emiratos (AED)', flagUrl: 'https://flagcdn.com/w160/ae.webp', strength: 62 },
            { code: 'HKD', name: 'Dólar Hong Kong (HKD)', flagUrl: 'https://flagcdn.com/w160/hk.webp', strength: 64 },
            { code: 'NOK', name: 'Corona Noruega (NOK)', flagUrl: 'https://flagcdn.com/w160/no.webp', strength: 74 },
            { code: 'HNL', name: 'Lempira Honduras (HNL)', flagUrl: 'https://flagcdn.com/w160/hn.webp', strength: 14 },
            { code: 'INR', name: 'Rupia India (INR)', flagUrl: 'https://flagcdn.com/w160/in.png', strength: 38 },
            { code: 'JMD', name: 'Dólar Jamaica (JMD)', flagUrl: 'https://flagcdn.com/w160/jm.png', strength: 26 },
            { code: 'TTD', name: 'Dólar Trinidad y Tobago (TTD)', flagUrl: 'https://flagcdn.com/w160/tt.png', strength: 27 },
            { code: 'HUF', name: 'Forinto Hungria (HUF)', flagUrl: 'https://flagcdn.com/w160/hu.png', strength: 32 },
            { code: 'EGP', name: 'Libra Egipto (EGP)', flagUrl: 'https://flagcdn.com/w160/eg.png', strength: 34 },
            { code: 'MYR', name: 'Ringgit Malaysia (MYR)', flagUrl: 'https://flagcdn.com/w160/my.png', strength: 46 },
            { code: 'RUB', name: 'Rublo Rusia (RUB)', flagUrl: 'https://flagcdn.com/w160/ru.png', strength: 36 },
            { code: 'SRD', name: 'Dólar Surinam (SRD)', flagUrl: 'https://flagcdn.com/w160/sr.png', strength: 17 },
            { code: 'KYD', name: 'Dólar Isla Caiman (KYD)', flagUrl: 'https://flagcdn.com/w160/ky.png', strength: 66 },
            { code: 'GYD', name: 'Dólar Guyana (GYD)', flagUrl: 'https://flagcdn.com/w160/gy.png', strength: 13 },
            { code: 'IDR', name: 'Rupia Indonesia (IDR)', flagUrl: 'https://flagcdn.com/w160/id.png', strength: 29 },
            { code: 'ILS', name: 'Sequel Israel (ILS)', flagUrl: 'https://flagcdn.com/w160/il.png', strength: 52 },
            { code: 'MAD', name: 'Dirham Marruecos (MAD)', flagUrl: 'https://flagcdn.com/w160/ma.png', strength: 33 },
            { code: 'PYG', name: 'Guarani Paraguay (PYG)', flagUrl: 'https://flagcdn.com/w160/py.png', strength: 9 },
            { code: 'SGD', name: 'Dólar Singapur (SGD)', flagUrl: 'https://flagcdn.com/w160/sg.png', strength: 69 },
            { code: 'TWD', name: 'Dólar Taiwan (TWD)', flagUrl: 'https://flagcdn.com/w160/tw.png', strength: 49 },
            { code: 'VES', name: 'Bolivar Venezuela (VES)', flagUrl: 'https://flagcdn.com/w160/ve.webp', strength: 1 }
        ];

        const existingCodes = currencies.map(c => c.code);
        const missingCurrencies = defaultCurrencies.filter(c => !existingCodes.includes(c.code));
        
        if (missingCurrencies.length > 0) {
            await Currency.insertMany(missingCurrencies);
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
