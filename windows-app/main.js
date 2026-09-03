const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// ============================================================
// SIMPLE JSON CONFIG (no electron-store dependency)
// ============================================================
const configPath = path.join(app.getPath('userData'), 'config.json');

function readConfig() {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    } catch (e) { /* ignore */ }
    return {};
}

function writeConfig(data) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
    } catch (e) { /* ignore */ }
}

function getConfig(key) {
    const config = readConfig();
    return config[key] || null;
}

function setConfig(key, value) {
    const config = readConfig();
    config[key] = value;
    writeConfig(config);
}

function deleteConfig(key) {
    const config = readConfig();
    delete config[key];
    writeConfig(config);
}

// ============================================================
// APP
// ============================================================
const API_URL = "https://api.cambioseurodolar.com";

let mainWindow;
let currentStoreId = null;

// Disable GPU to avoid transparency bugs on Windows
app.disableHardwareAcceleration();

function createWindow() {
    // Read saved storeId
    currentStoreId = getConfig('storeId');

    mainWindow = new BrowserWindow({
        width: 350,
        height: 400,
        x: 50,
        y: 50,
        alwaysOnTop: true,
        skipTaskbar: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    if (currentStoreId) {
        mainWindow.setSize(70, 70);
        mainWindow.setSkipTaskbar(true);
        mainWindow.loadFile('index.html');
        registerShortcuts();
    } else {
        mainWindow.loadFile('login.html');
    }
}

function registerShortcuts() {
    if (!currentStoreId) return;

    globalShortcut.unregisterAll();

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

    ipcMain.on('resize-window', (event, { width, height }) => {
        mainWindow.setSize(width, height);
    });

    ipcMain.on('login-success', (event, { token, storeId }) => {
        currentStoreId = storeId;
        setConfig('storeId', storeId);
        setConfig('token', token);

        mainWindow.setSkipTaskbar(true);
        mainWindow.setSize(70, 70);
        mainWindow.loadFile('index.html');
        registerShortcuts();
    });

    ipcMain.handle('get-store-id', () => {
        return currentStoreId;
    });

    ipcMain.on('logout', () => {
        currentStoreId = null;
        deleteConfig('storeId');
        deleteConfig('token');
        globalShortcut.unregisterAll();

        mainWindow.setSkipTaskbar(false);
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
