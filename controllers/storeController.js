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
                id: store._id,
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
