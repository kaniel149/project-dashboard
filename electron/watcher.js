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
