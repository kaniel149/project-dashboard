// Fix EPIPE errors when running without terminal (launched from Finder/Login Items)
// This MUST be at the very top, before any requires

// Suppress all errors FIRST - before anything else can fail
process.on('uncaughtException', (err) => {
  // Silently ignore EPIPE errors and similar pipe/socket issues
  if (err && (err.code === 'EPIPE' || err.code === 'ERR_STREAM_DESTROYED')) return;
});
process.on('unhandledRejection', () => {});

// Safely check if we have a TTY
let hasTTY = false;
try {
  hasTTY = process.stdout && process.stdout.isTTY;
} catch (e) {
  hasTTY = false;
}

// Completely replace stdout/stderr with no-op streams to prevent EPIPE
if (!hasTTY) {
  const { Writable } = require('stream');
  const nullStream = new Writable({
    write(chunk, encoding, callback) {
      callback();
    }
  });

  try {
    process.stdout = nullStream;
    process.stderr = nullStream;
  } catch (e) {
    // Can't replace streams, that's ok
  }
}

// Override console methods - always do this to prevent any output
const noop = () => {};
console.log = noop;
console.error = noop;
console.warn = noop;
console.info = noop;
console.debug = noop;
console.trace = noop;

const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');

// Prevent Electron from showing error dialogs
dialog.showErrorBox = noop;
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('no-sandbox');
const path = require('path');
const { exec } = require('child_process');
const { scanAllProjects } = require('./scanner');
const { createWatcher } = require('./watcher');
const { generateProjectMap } = require('./excalidraw-generator');
const { generateMapEditor, saveProjectMap: saveProjectMapFile } = require('./project-map-editor');
const { generateInteractiveMap } = require('./interactive-map');
const { updateClaudeState } = require('./project-scanner');
const { getCodeStats } = require('./code-stats');
const { trackProjectOpen, trackProjectFocus, getSessionData } = require('./session-tracker');

let mainWindow;
let isCollapsed = false;
let watcher;

const PROJECTS_DIR = path.join(process.env.HOME, 'Desktop', 'projects');
const EXPANDED_WIDTH = 1200;
const EXPANDED_HEIGHT = 800;
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
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
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
  watcher = createWatcher(PROJECTS_DIR, async () => {
    try { scanAndSend(); } catch (e) {}
  });
}

async function scanAndSend() {
  try {
    const projects = await scanAllProjects(PROJECTS_DIR);
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      try {
        mainWindow.webContents.send('projects-update', projects);
      } catch (e) {
        // Ignore send errors
      }
    }
  } catch (e) {
    // Ignore scan errors
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

ipcMain.handle('set-window-size', (_, width, height) => {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setSize(width, height);
  mainWindow.setPosition(screenWidth - width - 20, screenHeight - height - 20);
  return { success: true };
});
ipcMain.handle('refresh-projects', async () => {
  try {
    await scanAndSend();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-terminal', (_, projectPath) => {
  // Escape quotes in path to prevent shell injection
  const safePath = projectPath.replace(/"/g, '\\"');
  exec(`open -a Terminal "${safePath}"`);
  return { success: true };
});

ipcMain.handle('open-claude', (_, projectPath) => {
  // Open terminal and run cx command in the project directory
  const safePath = projectPath.replace(/"/g, '\\"');
  // Use osascript to open Terminal, cd to directory, and run cx
  const script = `
    tell application "Terminal"
      activate
      do script "cd \\"${safePath}\\" && cx"
    end tell
  `;
  exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
  return { success: true };
});

ipcMain.handle('generate-project-map', async () => {
  try {
    const projects = await scanAllProjects(PROJECTS_DIR);
    const outputPath = path.join(PROJECTS_DIR, 'project-map.excalidraw');
    const { htmlPath } = await generateProjectMap(projects, outputPath);

    // Open HTML file in default browser
    exec(`open "${htmlPath}"`);

    return { success: true, path: htmlPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-vscode', (_, projectPath) => {
  // Escape quotes in path to prevent shell injection
  const safePath = projectPath.replace(/"/g, '\\"');
  exec(`code "${safePath}"`);
  return { success: true };
});

ipcMain.handle('open-project-map', async (_, projectPath, projectData) => {
  try {
    // Use the new interactive map generator
    const { htmlPath, mapData } = await generateInteractiveMap(projectPath);

    // Open in default browser
    const safePath = htmlPath.replace(/"/g, '\\"');
    exec(`open "${safePath}"`);

    return { success: true, path: htmlPath, stats: mapData.stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-project-map', async (_, projectPath, mapData) => {
  try {
    await saveProjectMapFile(projectPath, mapData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-project-state', async (_, projectPath, changes) => {
  try {
    const result = await updateClaudeState(projectPath, changes);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-code-stats', async (_, projectPath) => {
  try {
    return await getCodeStats(projectPath);
  } catch (error) {
    return { totalFiles: 0, totalLines: 0, languages: {}, lastScanned: null, error: error.message };
  }
});

ipcMain.handle('track-project-open', async (_, projectPath) => {
  try {
    return trackProjectOpen(projectPath);
  } catch (error) {
    return null;
  }
});

ipcMain.handle('get-session-data', async () => {
  try {
    return getSessionData();
  } catch (error) {
    return {};
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (watcher) watcher.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
