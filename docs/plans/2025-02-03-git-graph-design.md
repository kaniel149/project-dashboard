# Git Graph View - Design Document

**Date:** 2025-02-03
**Feature:** Visual Git Graph as new View Mode

## Overview

Add a new "Git" view mode to the Dashboard, displaying a grid of mini git graphs for all projects.

## User Flow

1. User clicks "Git" button in header (alongside List/Grid)
2. Dashboard shows grid of GitCards
3. Each card displays project's git graph with recent commits and branches
4. Status indicators show ahead/behind and uncommitted changes

## Components

### New Files
- `src/components/GitView.jsx` - Grid container for GitCards
- `src/components/GitCard.jsx` - Individual project git visualization
- `electron/git-scanner.js` - Git data extraction utilities

### Modified Files
- `src/components/Dashboard.jsx` - Add Git view mode toggle
- `electron/scanner.js` - Integrate git-scanner data

## Data Structure

```javascript
gitInfo: {
  currentBranch: "main",
  commits: [
    { hash: "abc123", message: "feat: add X", author: "user", date: "2025-02-03", branches: ["main"] }
  ],
  branches: ["main", "feature-x", "dev"],
  status: {
    ahead: 2,
    behind: 0,
    uncommitted: 3
  }
}
```

## Git Commands

- `git branch --show-current` - Current branch
- `git log --oneline --graph --all -n 10 --format="%h|%s|%an|%ai|%D"` - Commits + graph
- `git status --porcelain` - Uncommitted changes
- `git rev-list --left-right --count origin/HEAD...HEAD` - Ahead/behind

## UI Design

```
┌─────────────────────────┐
│ 📁 project-name         │
│ 🌿 main                 │
├─────────────────────────┤
│  ●──●──●                │
│     └──●──● feature     │
│        └──● dev         │
├─────────────────────────┤
│ ↑2 ↓0  ●3 uncommitted   │
└─────────────────────────┘
```

## Dependencies

- `@gitgraph/react` - React git graph visualization library

## Implementation Steps

1. Install `@gitgraph/react`
2. Create `electron/git-scanner.js` with git data extraction
3. Add Git button to Dashboard header
4. Create `GitCard.jsx` component
5. Create `GitView.jsx` grid container
6. Connect Electron data to React components
7. Style with glass design system

## Cache Strategy

- Git data refreshed every 30 seconds
- Cached in scanner to avoid excessive git calls
