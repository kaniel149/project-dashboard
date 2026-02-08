const fs = require('fs').promises;
const path = require('path');

// Cache: { [projectPath]: { stats, mtime } }
const statsCache = {};
const CACHE_TTL = 300000; // 5 minutes

const COUNTED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.py', '.css', '.html', '.json', '.md', '.sql', '.sh'
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '__pycache__', '.vercel', 'coverage'
]);

async function walkDir(dirPath, results) {
  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch (e) {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walkDir(fullPath, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (COUNTED_EXTENSIONS.has(ext)) {
        results.push({ path: fullPath, ext });
      }
    }
  }
}

async function countLines(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (e) {
    return 0;
  }
}

async function getCodeStats(projectPath) {
  const now = Date.now();
  const cached = statsCache[projectPath];
  if (cached && (now - cached.mtime) < CACHE_TTL) {
    return cached.stats;
  }

  const files = [];
  await walkDir(projectPath, files);

  const languages = {};
  let totalFiles = 0;
  let totalLines = 0;

  // Process files in batches of 20 for performance
  const BATCH_SIZE = 20;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const lineCounts = await Promise.all(batch.map(f => countLines(f.path)));

    for (let j = 0; j < batch.length; j++) {
      const ext = batch[j].ext.slice(1); // remove leading dot
      const lines = lineCounts[j];
      totalFiles++;
      totalLines += lines;
      languages[ext] = (languages[ext] || 0) + lines;
    }
  }

  const stats = {
    totalFiles,
    totalLines,
    languages,
    lastScanned: new Date().toISOString(),
  };

  statsCache[projectPath] = { stats, mtime: now };
  return stats;
}

module.exports = { getCodeStats };
