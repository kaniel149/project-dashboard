# Task Plan / תוכנית משימות
## Project Dashboard

> **Last Updated / עודכן לאחרונה:** 2026-02-03

---

## Project Goals / מטרות הפרויקט

### Primary Goal / מטרה ראשית
Create a desktop dashboard application that provides a unified view of all development projects, tracking Git activity, displaying project status, and helping manage development across multiple repositories.

יצירת אפליקציית דשבורד שולחנית שמספקת תצוגה אחודה של כל פרויקטי הפיתוח, מעקב אחרי פעילות Git, הצגת סטטוס פרויקטים ועזרה בניהול פיתוח מרובה מאגרים.

---

## Tasks / משימות

### Phase 1: Core Features (Current) / שלב 1: פיצ'רים מרכזיים (נוכחי)

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 1.1 | **Complete Git status display** / השלמת תצוגת סטטוס Git | In Progress / בתהליך | High / גבוה | Shows uncommitted changes, branch, commits |
| 1.2 | **Real-time file change notifications** / התראות בזמן אמת על שינויי קבצים | In Progress / בתהליך | High / גבוה | Using chokidar watcher |
| 1.3 | **Integrate with CLAUDE_STATE.md files** / אינטגרציה עם קבצי CLAUDE_STATE.md | Planned / מתוכנן | Medium / בינוני | Read project summaries and tasks |
| 1.4 | **Quick-launch for project dev servers** / הפעלה מהירה של שרתי פיתוח | Planned / מתוכנן | Medium / בינוני | One-click to start dev server |

### Phase 2: Enhanced Features / שלב 2: פיצ'רים מתקדמים

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.1 | **Task management integration** / אינטגרציית ניהול משימות | Planned / מתוכנן | Medium / בינוני | TODO.md parsing, task checkboxes |
| 2.2 | **Native notifications** / התראות מערכת | Planned / מתוכנן | Medium / בינוני | macOS notification center |
| 2.3 | **Project search & filter** / חיפוש וסינון פרויקטים | Planned / מתוכנן | Low / נמוך | Search by name, filter by status |
| 2.4 | **Settings panel** / פאנל הגדרות | Planned / מתוכנן | Low / נמוך | Configure watched directories |

### Phase 3: Polish & Distribution / שלב 3: ליטוש והפצה

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 3.1 | **Code signing** / חתימת קוד | Planned / מתוכנן | Low / נמוך | For distribution outside App Store |
| 3.2 | **Auto-update mechanism** / מנגנון עדכון אוטומטי | Planned / מתוכנן | Low / נמוך | Check for new versions |
| 3.3 | **Performance optimization** / אופטימיזציית ביצועים | Planned / מתוכנן | Low / נמוך | Reduce memory usage |

---

## Commands / פקודות

```bash
# Development / פיתוח
npm run dev            # Start Electron + Vite dev

# Build / בניה
npm run build          # Build production app

# Installation / התקנה
npm run install-app    # Install to /Applications
npm run uninstall-app  # Remove from /Applications
```

---

## Technical Requirements / דרישות טכניות

### Must Have / חובה
- [ ] Electron app runs without crashes / אפליקציית Electron רצה בלי קריסות
- [ ] Git status updates in real-time / עדכוני סטטוס Git בזמן אמת
- [ ] Works in always-on-top mode / עובד במצב always-on-top
- [ ] Supports Hebrew RTL text / תומך בטקסט עברי RTL

### Nice to Have / רצוי
- [ ] Keyboard shortcuts / קיצורי מקלדת
- [ ] Dark/Light mode toggle / החלפת מצב כהה/בהיר
- [ ] Multiple project directories / מספר תיקיות פרויקטים

---

## Timeline Estimate / הערכת לוח זמנים

| Phase | Estimated Duration | Status |
|-------|-------------------|--------|
| Phase 1 | 1-2 weeks / שבוע-שבועיים | In Progress |
| Phase 2 | 2-3 weeks / 2-3 שבועות | Not Started |
| Phase 3 | 1 week / שבוע | Not Started |

---

*Update this file as tasks are completed.*
*עדכן קובץ זה כאשר משימות מושלמות.*
