# Findings / ממצאים
## Project Dashboard Analysis

> **Analysis Date / תאריך ניתוח:** 2026-02-03

---

## Project Overview / סקירת הפרויקט

**Project Dashboard** is a macOS desktop application built with Electron that monitors and displays the status of all Git projects in a specified directory (`~/Desktop/projects`). It provides a floating, always-on-top widget with a premium glassmorphism UI.

**Project Dashboard** הוא אפליקציית שולחן עבודה ל-macOS שנבנתה עם Electron ומנטרת ומציגה את סטטוס כל פרויקטי ה-Git בתיקייה מוגדרת (`~/Desktop/projects`). היא מספקת ווידג'ט צף עם ממשק משתמש פרימיום בסגנון glassmorphism.

---

## Tech Stack Summary / סיכום טכנולוגיות

| Category / קטגוריה | Technology / טכנולוגיה | Purpose / מטרה |
|--------------------|------------------------|----------------|
| Desktop Framework | **Electron 40.x** | Cross-platform desktop app |
| Build Tool | **Vite 7.3.1** | Fast bundling and HMR |
| UI Framework | **React 19.2.4** | Component-based UI |
| Styling | **Tailwind CSS 4.1.18** | Utility-first CSS |
| Animations | **Motion (Framer) 12.29.2** | Smooth UI animations |
| Git Operations | **simple-git 3.30.0** | Git repository queries |
| File Watching | **chokidar 5.0.0** | Real-time file monitoring |

---

## Architecture / ארכיטקטורה

### Directory Structure / מבנה תיקיות

```
project-dashboard/
├── electron/                    # Electron main process
│   ├── main.js                  # App entry, window management
│   ├── preload.js               # Context bridge for IPC
│   ├── scanner.js               # Git repository scanner
│   └── watcher.js               # File system watcher
├── src/                         # React frontend
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles + Tailwind
│   ├── components/
│   │   ├── Dashboard.jsx        # Main dashboard view
│   │   ├── ProjectCard.jsx      # Project summary card
│   │   ├── ProjectExpanded.jsx  # Detailed project view
│   │   ├── MiniIcon.jsx         # Collapsed state icon
│   │   └── TaskList.jsx         # Task display component
│   └── utils/
│       └── time.js              # Time formatting utilities
├── scripts/
│   ├── install.sh               # Install to /Applications
│   ├── uninstall.sh             # Remove from /Applications
│   └── launch-wrapper.sh        # Launch helper script
└── dist/                        # Built production files
```

---

## Key Components Analysis / ניתוח רכיבים עיקריים

### 1. Electron Main Process (`electron/main.js`)

**Functionality / פונקציונליות:**
- Creates frameless, transparent, always-on-top window
- Positions window in bottom-right corner of screen
- Handles collapse/expand toggle between mini icon and full dashboard
- Manages IPC communication with React frontend
- Suppresses EPIPE errors for headless operation (when launched from Finder)

**Key Features / פיצ'רים מרכזיים:**
- Window dimensions: 420x550 (expanded), 60x60 (collapsed)
- Visible on all workspaces
- Hot-reloading in development mode via Vite

### 2. Scanner Module (`electron/scanner.js`)

**Functionality / פונקציונליות:**
- Scans all subdirectories of the projects folder
- Identifies Git repositories using `simple-git`
- Extracts: branch name, uncommitted changes, recent commits, last activity
- Reads optional `.claude/project-status.json` for Claude integration
- Parses `TODO.md` files for task lists
- Sorts projects by last activity (most recent first)

**Data Structure Returned / מבנה נתונים מוחזר:**
```javascript
{
  name: 'project-name',
  path: '/full/path/to/project',
  branch: 'main',
  uncommittedChanges: 3,
  changedFiles: [{ status: 'M', path: 'file.js' }],
  lastCommit: { message: 'commit msg', date: 'ISO date' },
  recentCommits: [...],
  lastActivity: 'ISO date',
  summary: 'Project summary from Claude',
  completedTasks: [...],
  remainingTasks: [...],
  nextSteps: 'Next steps from Claude'
}
```

### 3. Watcher Module (`electron/watcher.js`)

**Functionality / פונקציונליות:**
- Uses chokidar to watch file system changes
- Ignores: dotfiles, node_modules, .git internals, dist/build folders
- Debounces updates (500ms) to prevent excessive rescans
- Triggers project rescan on file add/change/delete events

### 4. React Frontend

**Dashboard.jsx:**
- Main layout with header, project list, and close button
- Animated ambient glow effects
- Draggable header region for window movement
- Handles expanded project detail view

**ProjectCard.jsx:**
- Summary card for each project
- Shows: name, branch, last commit message, status badges
- Status indicators: changes (orange), tasks (yellow), up-to-date (green)
- RTL support for Hebrew text detection

**ProjectExpanded.jsx:**
- Detailed view when clicking a project
- Sections: summary, completed tasks, remaining tasks, next steps, recent commits, changed files
- "Open Terminal" button to launch Terminal.app at project path

**MiniIcon.jsx:**
- Collapsed state showing alert badges
- Displays count of projects with changes and total remaining tasks
- Animated pulse effect when alerts exist

---

## UI/UX Findings / ממצאי UI/UX

### Strengths / חוזקות
1. **Premium glassmorphism design** - Modern, visually appealing
2. **Smooth animations** - Using Framer Motion throughout
3. **Hebrew language support** - RTL detection and rendering
4. **Status-based color coding** - Clear visual indicators
5. **Collapsed mode** - Unobtrusive when not in use

### Areas for Improvement / נקודות לשיפור
1. No keyboard navigation / accessibility features
2. No search or filter functionality for many projects
3. No settings UI for configuration
4. Hardcoded project directory path

---

## Integration Points / נקודות אינטגרציה

### Claude Integration
- Reads `.claude/project-status.json` for:
  - `summary` - Work summary text
  - `completedTasks` - Array of completed task strings
  - `remainingTasks` - Array of remaining task strings
  - `nextSteps` - Next steps text

### TODO.md Parsing
- Parses unchecked markdown checkboxes: `- [ ] Task text`
- Used as fallback when Claude status file doesn't exist

---

## Potential Issues / בעיות פוטנציאליות

1. **Memory usage** - Scanning many large repos could be resource-intensive
2. **No error UI** - Errors are silently caught, user sees no feedback
3. **Hardcoded paths** - Projects directory is not configurable
4. **No persistence** - Collapsed state resets on restart
5. **macOS only** - Uses macOS-specific features (Terminal.app launch)

---

## Code Quality / איכות קוד

| Aspect | Rating | Notes |
|--------|--------|-------|
| Modularity | Good | Clear separation of concerns |
| Error Handling | Fair | Errors silently swallowed |
| Type Safety | None | Plain JavaScript, no TypeScript |
| Documentation | Fair | CLAUDE_STATE.md exists, no inline docs |
| Testing | None | No test files found |

---

*This analysis is based on code examination as of 2026-02-03.*
*ניתוח זה מבוסס על בחינת קוד נכון ל-2026-02-03.*
