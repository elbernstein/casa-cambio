const jwt = require('jsonwebtoken');
const TransactionState = require('../models/TransactionState');
const StoreSettings = require('../models/StoreSettings');
const AdPlaylist = require('../models/AdPlaylist');

const JWT_SECRET = 'super_secret_key_123';

module.exports = (io) => {
    // Middleware de Autenticación de Sockets
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) return next(new Error('Authentication error: Token missing'));
        
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error: Invalid token'));
            socket.user = decoded; // Guardar datos del usuario en el socket
            next();
        });
    });

    io.on('connection', async (socket) => {
        const { role, storeId } = socket.user;
        const storeRoom = storeId.toString();
        
        console.log(`🟢 ${role.toUpperCase()} conectado a Tienda: ${storeRoom}`);
        socket.join(storeRoom);

        if (role === 'receptor') {
            const state = await TransactionState.findOne({ storeId: storeRoom }) || {};
            let settings = await StoreSettings.findOne({ storeId: storeRoom });
            if (!settings) settings = await StoreSettings.create({ storeId: storeRoom });
            
            const playlist = await AdPlaylist.find({ storeId: storeRoom }).sort('order');
            
            socket.emit('estado_inicial', { 
                montoEntrega: state.montoEntrega || "0",
                montoRecibe: state.montoRecibe || "0", 
                settings: settings,
                playlist: playlist
            });
        }

        socket.on('enviar_monto', async (data) => {
            if (role !== 'emisor') return;
            const { montoEntrega, montoRecibe } = data;
            
            try {
                await TransactionState.findOneAndUpdate({ storeId: storeRoom }, { montoEntrega, montoRecibe, lastUpdated: Date.now() }, { upsert: true });
                console.log(`💰 [Tienda ${storeRoom}] Montos actualizados: ${montoEntrega} -> ${montoRecibe}`);
                io.to(storeRoom).emit('nuevo_monto', { montoEntrega, montoRecibe });
            } catch (error) {
                console.error("Error al guardar monto:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔴 Cliente desconectado de Tienda: ${storeRoom}`);
        });
    });
};
