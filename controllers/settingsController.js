const StoreSettings = require('../models/StoreSettings');

exports.getSettings = async (req, res) => {
    try {
        const { storeId } = req.params;
        let settings = await StoreSettings.findOne({ storeId });
        if (!settings) {
            settings = await StoreSettings.create({ storeId }); // Default settings
        }
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { idleTimeoutSeconds, maxAdsLimit } = req.body;
        
        const settings = await StoreSettings.findOneAndUpdate(
            { storeId }, 
            { idleTimeoutSeconds, maxAdsLimit }, 
            { new: true, upsert: true }
        );
        
        // Notificar a la pantalla receptora (iPad) que la configuración cambió
        const io = req.app.get('io');
        if (io) {
            io.to(storeId).emit('settings_updated', settings);
        }
        
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
