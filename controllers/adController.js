const AdPlaylist = require('../models/AdPlaylist');
const StoreSettings = require('../models/StoreSettings');
const fs = require('fs');
const path = require('path');

const emitPlaylistUpdate = async (storeId, io) => {
    const playlist = await AdPlaylist.find({ storeId }).sort('order');
    if (io) {
        io.to(storeId.toString()).emit('playlist_updated', playlist);
    }
};

exports.getPlaylist = async (req, res) => {
    try {
        const { storeId } = req.params;
        const playlist = await AdPlaylist.find({ storeId }).sort('order');
        res.json({ success: true, playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadAd = async (req, res) => {
    const { storeId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    try {
        // Validar límite de anuncios
        let settings = await StoreSettings.findOne({ storeId });
        if (!settings) settings = await StoreSettings.create({ storeId });
        
        const currentAdsCount = await AdPlaylist.countDocuments({ storeId });
        if (currentAdsCount >= settings.maxAdsLimit) {
            // Eliminar archivo recién subido para no ocupar espacio inútil
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: `Límite de publicidades alcanzado (${settings.maxAdsLimit})` });
        }

        const isVideo = req.file.mimetype.startsWith('video/');
        const type = isVideo ? 'video' : 'image';
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        // Ponerlo de último en el orden
        const lastAd = await AdPlaylist.findOne({ storeId }).sort('-order');
        const nextOrder = lastAd ? lastAd.order + 1 : 1;

        const newAd = await AdPlaylist.create({
            storeId,
            url,
            type,
            order: nextOrder
        });
        
        await emitPlaylistUpdate(storeId, req.app.get('io'));
        res.json({ success: true, ad: newAd });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

exports.deleteAd = async (req, res) => {
    try {
        const { storeId, adId } = req.params;
        const ad = await AdPlaylist.findOneAndDelete({ _id: adId, storeId });
        
        if (ad) {
            // Intentar borrar archivo físico
            try {
                const filename = ad.url.split('/').pop();
                const filePath = path.join(__dirname, '../uploads/', filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
                console.error("Error deleting physical file:", err);
            }
        }
        
        await emitPlaylistUpdate(storeId, req.app.get('io'));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { orderedIds } = req.body; // Array de IDs en el nuevo orden
        
        for (let i = 0; i < orderedIds.length; i++) {
            await AdPlaylist.findByIdAndUpdate(orderedIds[i], { order: i + 1 });
        }
        
        await emitPlaylistUpdate(storeId, req.app.get('io'));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
