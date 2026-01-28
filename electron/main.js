const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let isCollapsed = false;

const EXPANDED_WIDTH = 380;
const EXPANDED_HEIGHT = 500;
const COLLAPSED_WIDTH = 60;
const COLLAPSED_HEIGHT = 60;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: EXPANDED_WIDTH,
    height: EXPANDED_HEIGHT,
    x: screenWidth - EXPANDED_WIDTH - 20,
    y: screenHeight - EXPANDED_HEIGHT - 20,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setVisibleOnAllWorkspaces(true);

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.handle('toggle-collapse', () => {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  isCollapsed = !isCollapsed;

  if (isCollapsed) {
    mainWindow.setSize(COLLAPSED_WIDTH, COLLAPSED_HEIGHT);
    mainWindow.setPosition(screenWidth - COLLAPSED_WIDTH - 20, screenHeight - COLLAPSED_HEIGHT - 20);
  } else {
    mainWindow.setSize(EXPANDED_WIDTH, EXPANDED_HEIGHT);
    mainWindow.setPosition(screenWidth - EXPANDED_WIDTH - 20, screenHeight - EXPANDED_HEIGHT - 20);
  }

  return isCollapsed;
});

ipcMain.handle('get-collapsed-state', () => isCollapsed);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
