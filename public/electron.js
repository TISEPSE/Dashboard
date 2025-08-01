const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Initialisation de la base de données
const Database = require('./database/sqlite-manager');

let mainWindow;

function createWindow() {
  // Créer la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  // URL de démarrage
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // DevTools en développement uniquement
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Gestion de la fermeture
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Événements de l'application
app.whenReady().then(() => {
  createWindow();

  // Gestion des mises à jour (pas en développement)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers pour la base de données
ipcMain.handle('db:get-crypto-favorites', async () => {
  try {
    return await Database.getCryptoFavorites();
  } catch (error) {
    console.error('Erreur récupération favoris crypto:', error);
    return [];
  }
});

ipcMain.handle('db:add-crypto-favorite', async (event, crypto) => {
  try {
    return await Database.addCryptoFavorite(crypto);
  } catch (error) {
    console.error('Erreur ajout favori crypto:', error);
    throw error;
  }
});

ipcMain.handle('db:remove-crypto-favorite', async (event, id) => {
  try {
    return await Database.removeCryptoFavorite(id);
  } catch (error) {
    console.error('Erreur suppression favori crypto:', error);
    throw error;
  }
});

ipcMain.handle('db:get-calendar-events', async (event, timeMin, timeMax) => {
  try {
    return await Database.getCalendarEvents(timeMin, timeMax);
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    return [];
  }
});

ipcMain.handle('db:add-calendar-event', async (event, eventData) => {
  try {
    return await Database.addCalendarEvent(eventData);
  } catch (error) {
    console.error('Erreur ajout événement:', error);
    throw error;
  }
});

ipcMain.handle('db:update-calendar-event', async (event, id, eventData) => {
  try {
    return await Database.updateCalendarEvent(id, eventData);
  } catch (error) {
    console.error('Erreur mise à jour événement:', error);
    throw error;
  }
});

ipcMain.handle('db:delete-calendar-event', async (event, id) => {
  try {
    return await Database.deleteCalendarEvent(id);
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    throw error;
  }
});

// Gestion des mises à jour
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Mise à jour disponible',
    message: 'Une nouvelle version est disponible. Elle sera téléchargée en arrière-plan.',
    buttons: ['OK']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Mise à jour prête',
    message: 'La mise à jour a été téléchargée. Redémarrez l\'application pour l\'appliquer.',
    buttons: ['Redémarrer', 'Plus tard']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});