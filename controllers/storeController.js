const bcrypt = require('bcrypt');
const Store = require('../models/Store');
const User = require('../models/User');
const TransactionState = require('../models/TransactionState');

exports.createStore = async (req, res) => {
    try {
        const { name } = req.body;
        const newStore = await Store.create({ name });
        
        // Crear usuarios automáticos para esta tienda
        const emisorUser = `emisor_${newStore._id.toString().substring(18)}`;
        const receptorUser = `receptor_${newStore._id.toString().substring(18)}`;
        const plainPassword = Math.random().toString(36).slice(-6); // Contraseña aleatoria de 6 caracteres
        
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        await User.create({ username: emisorUser, password: hashedPassword, role: 'emisor', storeId: newStore._id });
        await User.create({ username: receptorUser, password: hashedPassword, role: 'receptor', storeId: newStore._id });
        
        // Inicializar estado de transacción
        await TransactionState.create({ storeId: newStore._id });
        
        res.json({ 
            success: true, 
            store: newStore, 
            credentials: {
                emisor: emisorUser,
                receptor: receptorUser,
                password: plainPassword // Solo se muestra una vez al crear
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStores = async (req, res) => {
    try {
        const stores = await Store.find();
        const states = await TransactionState.find();
        
        const storesData = stores.map(store => {
            const state = states.find(s => s.storeId.toString() === store._id.toString()) || {};
            return {
                _id: store._id,
                name: store.name,
                montoEntrega: state.montoEntrega || "0",
                montoRecibe: state.montoRecibe || "0",
                adUrl: state.adUrl || null,
                adType: state.adType || null
            };
        });
        res.json(storesData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsersByStore = async (req, res) => {
    try {
        const users = await User.find({ storeId: req.params.id }).select('username role');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStoreCredentials = async (req, res) => {
    try {
        const { emisorUsername, receptorUsername, newPassword } = req.body;
        const storeId = req.params.id;

        // Si se provee una contraseña nueva, la hasheamos y se la ponemos a ambos
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updateMany({ storeId }, { password: hashedPassword });
        }

        // Actualizar nombres si se proveen
        if (emisorUsername) {
            await User.findOneAndUpdate({ storeId, role: 'emisor' }, { username: emisorUsername });
        }
        if (receptorUsername) {
            await User.findOneAndUpdate({ storeId, role: 'receptor' }, { username: receptorUsername });
        }

        res.json({ success: true });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Ese nombre de usuario ya está en uso." });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateStoreAmounts = async (req, res) => {
    try {
        const { montoEntrega, montoRecibe } = req.body;
        const storeId = req.params.id;
        
        console.log(`\n[REST API] Recibido PUT /api/stores/${storeId}/amounts`);
        console.log(`[REST API] Montos a guardar: Entrega=${montoEntrega}, Recibe=${montoRecibe}`);

        // Actualizar en base de datos
        await TransactionState.findOneAndUpdate(
            { storeId }, 
            { montoEntrega: montoEntrega.toString(), montoRecibe: montoRecibe.toString() },
            { upsert: true }
        );
        console.log(`[REST API] Base de datos actualizada con éxito.`);

        // Emitir el evento de Socket al cuarto de la tienda
        const io = req.app.get('io');
        if (io) {
            console.log(`[SOCKET EMIT] Emitiendo 'nuevo_monto' a la sala: ${storeId}`);
            io.to(storeId).emit('nuevo_monto', { montoEntrega: montoEntrega.toString(), montoRecibe: montoRecibe.toString() });
            console.log(`[SOCKET EMIT] Evento disparado exitosamente.`);
        } else {
            console.error(`[SOCKET ERROR] No se encontró la instancia global 'io'`);
        }

        res.json({ success: true, montoEntrega, montoRecibe });
    } catch (error) {
        console.error("[REST ERROR] Fallo al procesar updateStoreAmounts:", error);
        res.status(500).json({ error: error.message });
    }
};
