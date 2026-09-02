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

// Asegurar que la carpeta uploads existe para multer
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

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

// Fallback para Vue Router
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'admin-panel/dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.keepAliveTimeout = 120000; // 120 segundos para evitar error -1005 en iOS
server.headersTimeout = 120000;
server.listen(PORT, () => console.log(`🚀 Servidor MVC corriendo en http://localhost:${PORT}`));