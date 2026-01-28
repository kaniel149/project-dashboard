# Project Dashboard - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** בניית דשבורד שקוף למק שמציג את כל הפרויקטים, סטטוס Git, משימות, וסיכומי Claude

**Architecture:** Electron app עם React frontend, Chokidar לזיהוי שינויים בזמן אמת, ו-LaunchAgent להפעלה אוטומטית

**Tech Stack:** Electron, React, Chokidar, simple-git, Tailwind CSS

---

## Task 1: Initialize Project Structure

**Files:**
- Create: `package.json`
- Create: `electron/main.js`
- Create: `electron/preload.js`

**Step 1: Initialize npm project**

```bash
cd /Users/kanieltordjman/Desktop/projects/project-dashboard
npm init -y
```

**Step 2: Install dependencies**

```bash
npm install electron electron-builder react react-dom chokidar simple-git
npm install -D @vitejs/plugin-react vite tailwindcss postcss autoprefixer concurrently wait-on
```

**Step 3: Create package.json scripts**

Update `package.json`:
```json
{
  "name": "project-dashboard",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "build": "vite build && electron-builder",
    "start": "electron ."
  }
}
```

**Step 4: Create electron/main.js**

```javascript
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

  const isDev = process.env.NODE_ENV !== 'production';
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
```

**Step 5: Create electron/preload.js**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleCollapse: () => ipcRenderer.invoke('toggle-collapse'),
  getCollapsedState: () => ipcRenderer.invoke('get-collapsed-state'),
  onProjectsUpdate: (callback) => ipcRenderer.on('projects-update', (_, data) => callback(data)),
});
```

**Step 6: Commit**

```bash
git init
git add -A
git commit -m "feat: initialize Electron project structure"
```

---

## Task 2: Setup React + Vite + Tailwind

**Files:**
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/index.css`

**Step 1: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
});
```

**Step 2: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        glass: 'rgba(30, 30, 30, 0.85)',
        'glass-light': 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
};
```

**Step 3: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Project Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 5: Create src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 6: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: transparent;
  overflow: hidden;
  user-select: none;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: setup React + Vite + Tailwind"
```

---

## Task 3: Create Main App Component

**Files:**
- Create: `src/App.jsx`
- Create: `src/components/Dashboard.jsx`
- Create: `src/components/MiniIcon.jsx`

**Step 1: Create src/App.jsx**

```jsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MiniIcon from './components/MiniIcon';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    window.electronAPI?.getCollapsedState().then(setIsCollapsed);

    window.electronAPI?.onProjectsUpdate((data) => {
      setProjects(data);
    });
  }, []);

  const handleToggle = async () => {
    const newState = await window.electronAPI?.toggleCollapse();
    setIsCollapsed(newState);
  };

  if (isCollapsed) {
    return <MiniIcon projects={projects} onExpand={handleToggle} />;
  }

  return <Dashboard projects={projects} onCollapse={handleToggle} />;
}

export default App;
```

**Step 2: Create src/components/MiniIcon.jsx**

```jsx
import React from 'react';

function MiniIcon({ projects, onExpand }) {
  const changesCount = projects.filter(p => p.uncommittedChanges > 0).length;

  return (
    <div
      onClick={onExpand}
      className="w-[60px] h-[60px] bg-glass rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-glass-light transition-all border border-white/10"
    >
      <span className="text-2xl">📊</span>
      {changesCount > 0 && (
        <span className="text-xs text-yellow-400 font-bold">{changesCount}</span>
      )}
    </div>
  );
}

export default MiniIcon;
```

**Step 3: Create src/components/Dashboard.jsx**

```jsx
import React, { useState } from 'react';
import ProjectCard from './ProjectCard';
import ProjectExpanded from './ProjectExpanded';

function Dashboard({ projects, onCollapse }) {
  const [expandedProject, setExpandedProject] = useState(null);

  return (
    <div className="w-[380px] h-[500px] bg-glass rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h1 className="text-white font-semibold flex items-center gap-2">
          <span>📊</span> Projects
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onCollapse}
            className="text-white/60 hover:text-white transition-colors"
          >
            −
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {expandedProject ? (
          <ProjectExpanded
            project={expandedProject}
            onClose={() => setExpandedProject(null)}
          />
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.path}
              project={project}
              onClick={() => setExpandedProject(project)}
            />
          ))
        )}

        {projects.length === 0 && (
          <div className="text-white/50 text-center py-8">
            סורק פרויקטים...
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: create main App and Dashboard components"
```

---

## Task 4: Create Project Card Components

**Files:**
- Create: `src/components/ProjectCard.jsx`
- Create: `src/components/ProjectExpanded.jsx`
- Create: `src/components/TaskList.jsx`

**Step 1: Create src/components/ProjectCard.jsx**

```jsx
import React from 'react';
import { formatTimeAgo } from '../utils/time';

function ProjectCard({ project, onClick }) {
  const getStatusColor = () => {
    if (project.uncommittedChanges > 0) return 'bg-red-500';
    if (project.remainingTasks?.length > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-all border border-white/5"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-white font-medium">{project.name}</span>
        </div>
        <span className="text-white/50 text-xs">{project.branch}</span>
      </div>

      <div className="text-white/60 text-sm truncate mb-2">
        "{project.lastCommit?.message || 'No commits'}"
      </div>

      <div className="flex items-center gap-4 text-xs text-white/50">
        <span>📝 {project.remainingTasks?.length || 0} משימות</span>
        <span>⚡ {project.uncommittedChanges} שינויים</span>
        <span className="mr-auto">{formatTimeAgo(project.lastActivity)}</span>
      </div>
    </div>
  );
}

export default ProjectCard;
```

**Step 2: Create src/components/ProjectExpanded.jsx**

```jsx
import React from 'react';
import TaskList from './TaskList';
import { formatTimeAgo } from '../utils/time';

function ProjectExpanded({ project, onClose }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            project.uncommittedChanges > 0 ? 'bg-red-500' :
            project.remainingTasks?.length > 0 ? 'bg-yellow-500' : 'bg-green-500'
          }`} />
          <span className="text-white font-medium">{project.name}</span>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
      </div>

      {/* Summary */}
      {project.summary && (
        <div className="p-3 border-b border-white/10">
          <div className="text-white/80 text-sm">💬 {project.summary}</div>
        </div>
      )}

      {/* Completed Tasks */}
      {project.completedTasks?.length > 0 && (
        <div className="p-3 border-b border-white/10">
          <div className="text-white/50 text-xs mb-2">✅ בוצע לאחרונה:</div>
          <TaskList tasks={project.completedTasks} completed />
        </div>
      )}

      {/* Remaining Tasks */}
      {project.remainingTasks?.length > 0 && (
        <div className="p-3 border-b border-white/10">
          <div className="text-white/50 text-xs mb-2">📋 להמשך:</div>
          <TaskList tasks={project.remainingTasks} />
        </div>
      )}

      {/* Recent Commits */}
      <div className="p-3 border-b border-white/10">
        <div className="text-white/50 text-xs mb-2">📝 Commits אחרונים:</div>
        <div className="space-y-1">
          {project.recentCommits?.slice(0, 3).map((commit, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-white/70 truncate flex-1">{commit.message}</span>
              <span className="text-white/40 text-xs mr-2">{formatTimeAgo(commit.date)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Changed Files */}
      {project.changedFiles?.length > 0 && (
        <div className="p-3">
          <div className="text-white/50 text-xs mb-2">📁 קבצים שהשתנו: {project.changedFiles.length}</div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {project.changedFiles.map((file, i) => (
              <div key={i} className="text-white/60 text-xs font-mono">
                <span className="text-yellow-400">{file.status}</span> {file.path}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {project.nextSteps && (
        <div className="p-3 bg-white/5">
          <div className="text-white/80 text-sm">👉 הבא: {project.nextSteps}</div>
        </div>
      )}
    </div>
  );
}

export default ProjectExpanded;
```

**Step 3: Create src/components/TaskList.jsx**

```jsx
import React from 'react';

function TaskList({ tasks, completed = false }) {
  return (
    <div className="space-y-1">
      {tasks.map((task, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className={completed ? 'text-green-400' : 'text-white/40'}>
            {completed ? '☑' : '☐'}
          </span>
          <span className={`${completed ? 'text-white/50 line-through' : 'text-white/70'}`}>
            {task}
          </span>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
```

**Step 4: Create src/utils/time.js**

```javascript
export function formatTimeAgo(date) {
  if (!date) return '';

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `${diffMins} דק'`;
  if (diffHours < 24) return `${diffHours} שעות`;
  if (diffDays === 1) return 'אתמול';
  return `${diffDays} ימים`;
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: create ProjectCard, ProjectExpanded, and TaskList components"
```

---

## Task 5: Create Project Scanner (Git + Files)

**Files:**
- Create: `electron/scanner.js`
- Update: `electron/main.js`

**Step 1: Create electron/scanner.js**

```javascript
const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

async function scanProject(projectPath) {
  const name = path.basename(projectPath);

  try {
    const git = simpleGit(projectPath);
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return null;
    }

    // Get git status
    const status = await git.status();

    // Get recent commits
    const log = await git.log({ maxCount: 5 });

    // Get last activity time
    const lastCommit = log.latest;

    // Read Claude status file if exists
    let claudeStatus = {};
    const claudeStatusPath = path.join(projectPath, '.claude', 'project-status.json');
    try {
      const content = await fs.readFile(claudeStatusPath, 'utf-8');
      claudeStatus = JSON.parse(content);
    } catch (e) {
      // File doesn't exist, that's OK
    }

    // Read TODO.md if exists
    let todoTasks = [];
    const todoPath = path.join(projectPath, 'TODO.md');
    try {
      const content = await fs.readFile(todoPath, 'utf-8');
      todoTasks = parseTodoMd(content);
    } catch (e) {
      // File doesn't exist
    }

    // Merge tasks from Claude status and TODO.md
    const remainingTasks = claudeStatus.remainingTasks || todoTasks;

    return {
      name,
      path: projectPath,
      branch: status.current,
      uncommittedChanges: status.files.length,
      changedFiles: status.files.map(f => ({ status: f.index || f.working_dir, path: f.path })),
      lastCommit: lastCommit ? { message: lastCommit.message, date: lastCommit.date } : null,
      recentCommits: log.all.map(c => ({ message: c.message, date: c.date })),
      lastActivity: lastCommit?.date || new Date().toISOString(),
      summary: claudeStatus.summary || null,
      completedTasks: claudeStatus.completedTasks || [],
      remainingTasks,
      nextSteps: claudeStatus.nextSteps || null,
    };
  } catch (error) {
    console.error(`Error scanning ${projectPath}:`, error.message);
    return null;
  }
}

function parseTodoMd(content) {
  const tasks = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const uncheckedMatch = line.match(/^[\s]*[-*]\s*\[\s*\]\s*(.+)/);
    if (uncheckedMatch) {
      tasks.push(uncheckedMatch[1].trim());
    }
  }

  return tasks;
}

async function scanAllProjects(projectsDir) {
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const projectPath = path.join(projectsDir, entry.name);
        const project = await scanProject(projectPath);
        if (project) {
          projects.push(project);
        }
      }
    }

    // Sort by last activity
    projects.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    return projects;
  } catch (error) {
    console.error('Error scanning projects:', error);
    return [];
  }
}

module.exports = { scanProject, scanAllProjects };
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: create project scanner with Git and Claude status integration"
```

---

## Task 6: Create File Watcher

**Files:**
- Create: `electron/watcher.js`
- Update: `electron/main.js`

**Step 1: Create electron/watcher.js**

```javascript
const chokidar = require('chokidar');
const path = require('path');

function createWatcher(projectsDir, onChange) {
  const watcher = chokidar.watch(projectsDir, {
    ignored: [
      /(^|[\/\\])\../,  // dotfiles
      /node_modules/,
      /\.git\/objects/,
      /\.git\/logs/,
      /dist/,
      /build/,
    ],
    persistent: true,
    ignoreInitial: true,
    depth: 3,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  let debounceTimer = null;
  const changedProjects = new Set();

  const triggerUpdate = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onChange(Array.from(changedProjects));
      changedProjects.clear();
    }, 500);
  };

  const handleChange = (filePath) => {
    // Extract project name from path
    const relativePath = path.relative(projectsDir, filePath);
    const projectName = relativePath.split(path.sep)[0];
    if (projectName) {
      changedProjects.add(path.join(projectsDir, projectName));
      triggerUpdate();
    }
  };

  watcher
    .on('add', handleChange)
    .on('change', handleChange)
    .on('unlink', handleChange);

  return watcher;
}

module.exports = { createWatcher };
```

**Step 2: Update electron/main.js to integrate scanner and watcher**

Replace the entire `electron/main.js` with:

```javascript
const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const { scanAllProjects, scanProject } = require('./scanner');
const { createWatcher } = require('./watcher');

let mainWindow;
let isCollapsed = false;
let watcher;

const PROJECTS_DIR = path.join(process.env.HOME, 'Desktop', 'projects');
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (watcher) watcher.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add file watcher with auto-refresh on changes"
```

---

## Task 7: Create Claude Skill for Status Saving

**Files:**
- Create: `skills/project-status-saver.md`

**Step 1: Create skills/project-status-saver.md**

```markdown
---
name: project-status-saver
description: שומר סטטוס פרויקט - סיכום, משימות שבוצעו, ומה נשאר. הפעל עם /סכם או /save-status
triggers:
  - /סכם
  - /save-status
  - /status
---

# Project Status Saver

## מה לעשות

כשהמשתמש מפעיל את הפקודה, בצע את הפעולות הבאות:

### 1. נתח את השיחה הנוכחית

סרוק את השיחה וזהה:
- **סיכום**: מה נעשה בסשן הזה (1-2 משפטים)
- **משימות שהושלמו**: רשימה של מה בוצע
- **משימות שנשארו**: מה עוד צריך לעשות
- **חסמים**: בעיות או דברים שחוסמים התקדמות
- **הצעד הבא**: המלצה קצרה להמשך

### 2. צור את תיקיית .claude אם לא קיימת

```bash
mkdir -p .claude
```

### 3. כתוב את הקובץ

כתוב לקובץ `.claude/project-status.json`:

```json
{
  "lastUpdated": "<ISO timestamp>",
  "summary": "<סיכום קצר בעברית>",
  "completedTasks": [
    "<משימה 1 שבוצעה>",
    "<משימה 2 שבוצעה>"
  ],
  "remainingTasks": [
    "<משימה 1 שנשארה>",
    "<משימה 2 שנשארה>"
  ],
  "blockers": [],
  "nextSteps": "<הצעד הבא המומלץ>"
}
```

### 4. הצג אישור למשתמש

הצג סיכום קצר:

```
✅ סטטוס נשמר!

📝 סיכום: <הסיכום>
✅ בוצע: <מספר משימות>
📋 נשאר: <מספר משימות>
👉 הבא: <הצעד הבא>
```

## כללים חשובים

- כתוב תמיד בעברית אם השיחה בעברית
- שמור על סיכום קצר וממוקד (לא יותר מ-2 משפטים)
- רשום רק משימות ספציפיות, לא כלליות
- אם אין משימות ברורות, השאר מערך ריק
- הקובץ נקרא אוטומטית על ידי Project Dashboard
```

**Step 2: Create installation script section for skill**

Add to `scripts/install.sh`:

```bash
# Install Claude Skill
mkdir -p ~/.claude/skills
cp skills/project-status-saver.md ~/.claude/skills/
echo "✅ Claude skill installed"
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: create Claude skill for project status saving"
```

---

## Task 8: Create Installation Script & LaunchAgent

**Files:**
- Create: `scripts/install.sh`
- Create: `scripts/uninstall.sh`

**Step 1: Create scripts/install.sh**

```bash
#!/bin/bash

set -e

echo "🚀 Installing Project Dashboard..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build the app
echo "🔨 Building application..."
npm run build

# 3. Copy to Applications (if built with electron-builder)
if [ -d "dist/mac/Project Dashboard.app" ]; then
  echo "📱 Installing to Applications..."
  cp -r "dist/mac/Project Dashboard.app" /Applications/
  APP_PATH="/Applications/Project Dashboard.app/Contents/MacOS/Project Dashboard"
elif [ -d "dist/mac-arm64/Project Dashboard.app" ]; then
  echo "📱 Installing to Applications..."
  cp -r "dist/mac-arm64/Project Dashboard.app" /Applications/
  APP_PATH="/Applications/Project Dashboard.app/Contents/MacOS/Project Dashboard"
else
  echo "⚠️  No built app found, using npm start for LaunchAgent"
  APP_PATH="$PROJECT_DIR/node_modules/.bin/electron"
  APP_ARGS="$PROJECT_DIR"
fi

# 4. Create LaunchAgent
echo "⚙️  Creating LaunchAgent..."
mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kaniel.project-dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>${APP_PATH}</string>
        ${APP_ARGS:+<string>${APP_ARGS}</string>}
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>Crashed</key>
        <true/>
    </dict>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/project-dashboard.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/project-dashboard.err</string>
</dict>
</plist>
EOF

# 5. Load LaunchAgent
echo "🔄 Loading LaunchAgent..."
launchctl unload ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist

# 6. Install Claude Skill
echo "🤖 Installing Claude skill..."
mkdir -p ~/.claude/skills
cp skills/project-status-saver.md ~/.claude/skills/

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Project Dashboard is now running in the bottom-right corner"
echo "🔄 It will start automatically when you log in"
echo "🤖 Use /סכם in Claude to save project status"
```

**Step 2: Create scripts/uninstall.sh**

```bash
#!/bin/bash

echo "🗑️  Uninstalling Project Dashboard..."

# Stop and unload LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist 2>/dev/null || true
rm -f ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist

# Remove from Applications
rm -rf "/Applications/Project Dashboard.app"

# Remove Claude skill
rm -f ~/.claude/skills/project-status-saver.md

echo "✅ Uninstalled successfully"
```

**Step 3: Make scripts executable**

```bash
chmod +x scripts/install.sh scripts/uninstall.sh
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add installation and uninstallation scripts"
```

---

## Task 9: Final Configuration & Testing

**Files:**
- Update: `package.json` (final version)
- Create: `.gitignore`
- Create: `README.md`

**Step 1: Update package.json**

```json
{
  "name": "project-dashboard",
  "version": "1.0.0",
  "description": "Desktop dashboard for tracking project status, Git activity, and tasks",
  "main": "electron/main.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "build": "vite build && electron-builder",
    "start": "electron .",
    "install-app": "bash scripts/install.sh",
    "uninstall-app": "bash scripts/uninstall.sh"
  },
  "build": {
    "appId": "com.kaniel.project-dashboard",
    "productName": "Project Dashboard",
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": "dir"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ]
  },
  "dependencies": {
    "chokidar": "^3.5.3",
    "simple-git": "^3.22.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "concurrently": "^8.2.2",
    "electron": "^28.1.0",
    "electron-builder": "^24.9.1",
    "postcss": "^8.4.33",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.1",
    "vite": "^5.0.12",
    "wait-on": "^7.2.0"
  }
}
```

**Step 2: Create .gitignore**

```
node_modules/
dist/
.DS_Store
*.log
*.err
```

**Step 3: Test the application**

```bash
npm run dev
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: finalize configuration and add README"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Initialize Electron project structure |
| 2 | Setup React + Vite + Tailwind |
| 3 | Create main App component |
| 4 | Create Project Card components |
| 5 | Create Project Scanner |
| 6 | Create File Watcher |
| 7 | Create Claude Skill |
| 8 | Create Installation Scripts |
| 9 | Final Configuration & Testing |

**Total: 9 tasks with frequent commits**
