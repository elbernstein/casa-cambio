const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, clipboard } = require('electron');
const path = require('path');
const axios = require('axios');

const storeId = "6a975d0648d3ed28b3dbd255"; // From user's previous logs
const API_URL = "https://api.cambioseurodolar.com";

let mainWindow;

// Enable Autostart
app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 70,
        height: 70,
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

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    
    // IPC listener para redimensionar la ventana cuando se abre el menú
    ipcMain.on('resize-window', (event, { width, height }) => {
        mainWindow.setSize(width, height);
    });

    // Ctrl+Shift+1 for "Usted entrega"
    globalShortcut.register('CommandOrControl+Shift+1', async () => {
        const text = clipboard.readText().trim();
        const cleanText = text.replace(/[^0-9,.-]/g, '').replace(/,/g, '.');
        if (cleanText && !isNaN(cleanText)) {
            try {
                await axios.put(`${API_URL}/api/stores/${storeId}/amounts`, {
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
                await axios.put(`${API_URL}/api/stores/${storeId}/amounts`, {
                    montoRecibe: cleanText
                });
                mainWindow.webContents.send('notification', `Recibe: ${cleanText}`);
            } catch (error) {
                console.error("Error updating amount:", error);
            }
        }
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
