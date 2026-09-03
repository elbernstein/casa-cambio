const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, clipboard } = require('electron');
const path = require('path');
const axios = require('axios');

const Store = require('electron-store');
const store = new Store();

// const storeId = "6a975d0648d3ed28b3dbd255"; // REMOVED HARDCODED
const API_URL = "https://api.cambioseurodolar.com";

let mainWindow;
let currentStoreId = store.get('storeId') || null;

// Enable Autostart
app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 350,
        height: 400,
        x: 50, // Initial position
        y: 50,
        type: 'toolbar', // Ensures it acts like a toolbar
        frame: false,
        transparent: true,
        hasShadow: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    if (currentStoreId) {
        // Si ya está logueado, cargar app principal con tamaño de botón
        mainWindow.setSize(70, 70);
        mainWindow.loadFile('index.html');
        registerShortcuts();
    } else {
        // Cargar login
        mainWindow.loadFile('login.html');
    }
}

function registerShortcuts() {
    if (!currentStoreId) return;
    
    // Unregister first to avoid duplicates
    globalShortcut.unregisterAll();
    
    // Ctrl+Shift+1 for "Usted entrega"
    globalShortcut.register('CommandOrControl+Shift+1', async () => {
        const text = clipboard.readText().trim();
        const cleanText = text.replace(/[^0-9,.-]/g, '').replace(/,/g, '.');
        if (cleanText && !isNaN(cleanText)) {
            try {
                await axios.put(`${API_URL}/api/stores/${currentStoreId}/amounts`, {
                    montoEntrega: cleanText
                });
                mainWindow.webContents.send('notification', `Entrega: ${cleanText}`);
            } catch (error) {
                console.error("Error updating amount:", error);
            }
        }
    });

    // Ctrl+Shift+2 for "Usted recibe"
    globalShortcut.register('CommandOrControl+Shift+2', async () => {
        const text = clipboard.readText().trim();
        const cleanText = text.replace(/[^0-9,.-]/g, '').replace(/,/g, '.');
        if (cleanText && !isNaN(cleanText)) {
            try {
                await axios.put(`${API_URL}/api/stores/${currentStoreId}/amounts`, {
                    montoRecibe: cleanText
                });
                mainWindow.webContents.send('notification', `Recibe: ${cleanText}`);
            } catch (error) {
                console.error("Error updating amount:", error);
            }
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    
    // IPC listener para redimensionar la ventana cuando se abre el menú
    ipcMain.on('resize-window', (event, { width, height }) => {
        mainWindow.setSize(width, height);
    });

    ipcMain.on('login-success', (event, { token, storeId }) => {
        currentStoreId = storeId;
        store.set('storeId', storeId);
        store.set('token', token);
        
        mainWindow.setSize(70, 70); // Volver al tamaño del botón
        mainWindow.loadFile('index.html');
        registerShortcuts();
    });
    
    ipcMain.handle('get-store-id', () => {
        return currentStoreId;
    });

    ipcMain.on('logout', () => {
        currentStoreId = null;
        store.delete('storeId');
        store.delete('token');
        globalShortcut.unregisterAll();
        mainWindow.setSize(350, 400);
        mainWindow.loadFile('login.html');
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

ipcMain.on('close-app', () => {
    app.quit();
});
