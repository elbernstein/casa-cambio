const mongoose = require('mongoose');

const adPlaylistSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    order: { type: Number, required: true },
    durationSeconds: { type: Number, default: 10 }, // Solo aplica a imágenes (los videos usan su propia duración si se quiere, o un máximo)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdPlaylist', adPlaylistSchema);
