const sessions = {}; // { [projectPath]: { openedAt, lastFocused, focusCount } }

function trackProjectOpen(projectPath) {
  if (!sessions[projectPath]) {
    sessions[projectPath] = {
      openedAt: new Date().toISOString(),
      lastFocused: new Date().toISOString(),
      focusCount: 1,
    };
  } else {
    sessions[projectPath].lastFocused = new Date().toISOString();
    sessions[projectPath].focusCount++;
  }
  return sessions[projectPath];
}

function trackProjectFocus(projectPath) {
  if (!sessions[projectPath]) {
    return trackProjectOpen(projectPath);
  }
  sessions[projectPath].lastFocused = new Date().toISOString();
  sessions[projectPath].focusCount++;
  return sessions[projectPath];
}

function getSessionData() {
  return sessions;
}

function getProjectSession(projectPath) {
  return sessions[projectPath] || null;
}

module.exports = { trackProjectOpen, trackProjectFocus, getSessionData, getProjectSession };
