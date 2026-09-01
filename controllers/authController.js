const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'super_secret_key_123'; // En producción, usar variables de entorno

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const token = jwt.sign({ id: user._id, role: user.role, storeId: user.storeId }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token, role: user.role, storeId: user.storeId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
