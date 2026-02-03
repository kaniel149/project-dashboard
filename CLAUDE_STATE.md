# CLAUDE_STATE.md - Project Dashboard

> **Last Updated:** 2026-02-03
> **Branch:** main

---

## 📋 Project Overview

**Project Dashboard** is a desktop application built with Electron that provides a unified view of all projects. It tracks Git activity, displays project status, and helps manage development across multiple repositories.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Electron | 40.x | Desktop Framework |
| Vite | 7.3.1 | Build Tool |
| React | 19.2.4 | UI Framework |
| Tailwind CSS | 4.1.18 | Styling |
| Motion | 12.29.2 | Animations |
| simple-git | 3.30.0 | Git Integration |
| chokidar | 5.0.0 | File Watching |

---

## 📁 Project Structure

```
project-dashboard/
├── electron/
│   └── main.js        # Electron main process
├── src/               # React frontend
├── dist/              # Built app
├── docs/              # Documentation
├── scripts/
│   ├── install.sh     # Install to Applications
│   └── uninstall.sh   # Remove from Applications
└── skills/            # Claude skills
```

---

## 🚀 Commands

```bash
npm run dev            # Start Electron + Vite dev
npm run build          # Build production app
npm run start          # Start Electron
npm run install-app    # Install to /Applications
npm run uninstall-app  # Remove from /Applications
```

---

## 📊 Current Status

| Area | Status | Notes |
|------|--------|-------|
| Electron Shell | ✅ | Working |
| React UI | ✅ | Basic layout with animations |
| Git Integration | ✅ | Full status, commits, changed files |
| File Watching | ✅ | Monitoring with debounce |
| Subdirectory Scanning | ✅ | business-projects/, personal-projects/ |
| CLAUDE_STATE.md Parsing | ✅ | Extracts summary, tech stack, issues |
| task_plan.md Parsing | ✅ | Extracts remaining tasks |
| progress.md Parsing | ✅ | Extracts completed tasks |
| Task Management | 📝 | Planned |
| Notifications | 📝 | Planned |
| Quick Actions (VS Code, dev) | 📝 | Planned |
| תכונה בדיקה | 🔄 בעבודה |

**Legend:** ✅ Complete | 🔄 In Progress | 📝 Planned

---

## 🎯 Immediate Goals

1. ~~Complete Git status display for all projects~~ ✅
2. Add real-time file change notifications (toast)
3. ~~Integrate with CLAUDE_STATE.md files~~ ✅
4. Add quick-launch for project dev servers

---

## 🖥️ App Info

- **App ID:** `com.kaniel.project-dashboard`
- **Category:** Developer Tools
- **Platform:** macOS

---

## ⚠️ Known Issues

- None currently tracked

---

## 📝 Notes

- Designed for macOS (no code signing)
- Watches `/Users/kanieltordjman/Desktop/projects`
- Uses concurrent Vite + Electron for dev

---

## 🔄 Recent Changes (2026-02-03)

### Scanner Improvements
- **Subdirectory scanning**: Now scans `business-projects/` and `personal-projects/` folders
- **CLAUDE_STATE.md parsing**: Extracts project overview, tech stack, current status, immediate goals, known issues
- **task_plan.md parsing**: Extracts remaining tasks (unchecked checkboxes)
- **progress.md parsing**: Extracts completed tasks (checked checkboxes)
- **Category display**: Shows "עסקי" or "אישי" badge on project cards

### Watcher Improvements
- Increased depth to 4 for nested projects
- Fixed project path detection for categorized projects

### UI Improvements
- Added tech stack display in expanded view
- Added known issues section in expanded view
- Added category badge on project cards

---

*Update this file at the end of each development session.*

## Work Session Log

### 03.02.2026, 19:36
בדיקת פונקציית שמירת סשן

**פיצ׳רים:**
- 🔄 תכונה בדיקה

**משימות שהושלמו:**
- ✅ משימה שהושלמה

**הערות:**
הערות לבדיקה

