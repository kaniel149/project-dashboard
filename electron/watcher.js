const chokidar = require('chokidar');
const path = require('path');

// Category folders that contain projects (not projects themselves)
const CATEGORY_FOLDERS = ['business-projects', 'personal-projects', 'archive'];

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
    depth: 4, // Increased depth to support nested projects
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
      try {
        onChange(Array.from(changedProjects));
      } catch (e) {}
      changedProjects.clear();
    }, 500);
  };

  const handleChange = (filePath) => {
    try {
      const relativePath = path.relative(projectsDir, filePath);
      const parts = relativePath.split(path.sep);

      if (parts.length === 0) return;

      let projectPath;

      // Check if first part is a category folder
      if (CATEGORY_FOLDERS.includes(parts[0]) && parts.length >= 2) {
        // Project is inside a category folder (e.g., business-projects/my-project)
        projectPath = path.join(projectsDir, parts[0], parts[1]);
      } else {
        // Project is directly in projects folder
        projectPath = path.join(projectsDir, parts[0]);
      }

      if (projectPath) {
        changedProjects.add(projectPath);
        triggerUpdate();
      }
    } catch (e) {}
  };

  watcher
    .on('add', handleChange)
    .on('change', handleChange)
    .on('unlink', handleChange)
    .on('error', () => {});

  return watcher;
}

module.exports = { createWatcher };
