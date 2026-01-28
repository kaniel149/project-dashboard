const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { scanAllProjects } = require('./scanner');
const { createWatcher } = require('./watcher');

let mainWindow;
let isCollapsed = false;
let watcher;

const PROJECTS_DIR = path.join(process.env.HOME, 'Desktop', 'projects');
const EXPANDED_WIDTH = 420;
const EXPANDED_HEIGHT = 550;
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
    resizable: true,
    movable: true,
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
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Initial scan
  scanAndSend();

  // Setup file watcher
  watcher = createWatcher(PROJECTS_DIR, async (changedPaths) => {
    console.log('Changes detected in:', changedPaths);
    scanAndSend();
  });
}

async function scanAndSend() {
  const projects = await scanAllProjects(PROJECTS_DIR);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('projects-update', projects);
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
ipcMain.handle('refresh-projects', scanAndSend);

ipcMain.handle('open-terminal', (_, projectPath) => {
  // Open Terminal.app in the project directory
  exec(`open -a Terminal "${projectPath}"`, (err) => {
    if (err) {
      console.error('Failed to open terminal:', err);
    }
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (watcher) watcher.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
