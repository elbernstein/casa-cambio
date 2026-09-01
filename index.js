const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Rutas y Controladores
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');
const adRoutes = require('./routes/adRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const socketHandler = require('./sockets/socketHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/casa_cambio')
    .then(() => console.log('📦 Conectado a MongoDB local'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// ================= SOCKET.IO =================
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
app.set('io', io); // Pasar instancia a los controladores
socketHandler(io); // Inicializar sockets

// ================= API REST (RUTAS) =================
app.use('/api/stores', storeRoutes);
app.use('/api/login', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/settings', settingsRoutes);

// Servir la aplicación Vue (Admin Panel) en producción
app.use(express.static(path.join(__dirname, 'admin-panel/dist')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-panel/dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Servidor MVC corriendo en http://localhost:${PORT}`));