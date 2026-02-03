/**
 * Project Scanner - סורק פרויקטים וחילוץ מידע למפה
 *
 * סורק קומפוננטות, מסכים, routes, TODOs ומידע נוסף
 */

const fs = require('fs').promises;
const path = require('path');

// Regular expressions for parsing
const PATTERNS = {
  // React components
  componentExport: /export\s+(?:default\s+)?(?:function|class|const)\s+(\w+)/g,
  componentImport: /import\s+(?:\{[^}]+\}|\w+)\s+from\s+['"]([^'"]+)['"]/g,

  // TODOs and comments
  todo: /\/\/\s*(TODO|FIXME|BUG|HACK|NOTE|XXX):\s*(.+)$/gm,

  // Routes (React Router, Next.js)
  routePath: /path:\s*['"]([^'"]+)['"]/g,
  routeElement: /element:\s*<(\w+)/g,
  nextPage: /export\s+default/,

  // Hebrew detection
  hebrew: /[\u0590-\u05FF]/,
};

// Directories to scan for different types
const SCAN_DIRS = {
  components: [
    'src/components', 'components', 'src/ui', 'app/components',
    'src/lib', 'lib', 'src/shared', 'shared', 'src/common',
    'core', 'modules', 'src/modules'
  ],
  pages: [
    'src/pages', 'pages', 'src/screens', 'screens', 'app', 'src/app',
    'src/views', 'views', 'src/routes', 'routes',
    // Next.js App Router patterns
    'src/app/(dashboard)', 'src/app/(auth)', 'app/(dashboard)', 'app/(auth)'
  ],
  routes: ['src/routes', 'src/router', 'app', 'src/app'],
  // Additional patterns for different project types
  modules: ['src', 'lib', 'core', 'modules'],
};

// File extensions to scan by language
const CODE_EXTENSIONS_BY_TYPE = {
  javascript: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'],
  python: ['.py'],
  all: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.py'],
};

// File extensions to scan (used as default)
const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.py'];

/**
 * Scan a single file for components and exports
 */
async function scanFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath, ext);
    const isPython = ext === '.py';

    const result = {
      path: filePath,
      name: fileName,
      type: 'file',
      exports: [],
      imports: [],
      todos: [],
      functions: [],
      hooks: [],
      classes: [],
      lines: content.split('\n').length,
      language: isPython ? 'python' : 'javascript',
    };

    if (isPython) {
      // Extract Python functions
      const pyFuncRegex = /^(?:async\s+)?def\s+(\w+)/gm;
      let funcMatch;
      while ((funcMatch = pyFuncRegex.exec(content)) !== null) {
        if (!funcMatch[1].startsWith('_')) { // Skip private functions
          result.functions.push(funcMatch[1]);
        }
      }

      // Extract Python classes
      const pyClassRegex = /^class\s+(\w+)/gm;
      while ((funcMatch = pyClassRegex.exec(content)) !== null) {
        result.classes.push(funcMatch[1]);
        result.exports.push(funcMatch[1]);
      }

      // Extract Python imports
      const pyImportRegex = /^(?:from\s+(\S+)\s+)?import\s+(.+)$/gm;
      let match;
      while ((match = pyImportRegex.exec(content)) !== null) {
        const fromModule = match[1];
        const imports = match[2].split(',').map(s => s.trim().split(' as ')[0]);
        if (fromModule && !fromModule.startsWith('.')) continue; // Skip external
        result.imports.push({
          names: imports,
          from: fromModule || imports[0],
        });
      }

      // Add main module as export
      if (result.functions.length > 0) {
        result.exports.push(fileName);
      }
    } else {
      // JavaScript/TypeScript parsing
      // Extract functions/components defined in file
      const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
      let funcMatch;
      while ((funcMatch = funcRegex.exec(content)) !== null) {
        result.functions.push(funcMatch[1]);
      }

      // Extract arrow function components
      const arrowRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>/g;
      while ((funcMatch = arrowRegex.exec(content)) !== null) {
        if (funcMatch[1][0] === funcMatch[1][0].toUpperCase()) {
          result.functions.push(funcMatch[1]);
        }
      }

      // Extract React hooks usage
      const hookRegex = /use(\w+)\s*\(/g;
      while ((funcMatch = hookRegex.exec(content)) !== null) {
        const hookName = 'use' + funcMatch[1];
        if (!result.hooks.includes(hookName)) {
          result.hooks.push(hookName);
        }
      }

      // Extract exports (component names)
      let match;
      const exportRegex = /export\s+(?:default\s+)?(?:function|class|const)\s+(\w+)/g;
      while ((match = exportRegex.exec(content)) !== null) {
        if (match[1] && !['default'].includes(match[1].toLowerCase())) {
          result.exports.push(match[1]);
        }
      }

      // Also check for: export default ComponentName
      const defaultExport = content.match(/export\s+default\s+(\w+)\s*;?\s*$/m);
      if (defaultExport && defaultExport[1]) {
        if (!result.exports.includes(defaultExport[1])) {
          result.exports.push(defaultExport[1]);
        }
      }

      // Extract imports
      const importRegex = /import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[3];
        if (importPath && !importPath.startsWith('.') && !importPath.startsWith('@/')) {
          continue; // Skip external packages
        }
        result.imports.push({
          names: match[1] ? match[1].split(',').map(s => s.trim()) : [match[2]],
          from: importPath,
        });
      }
    }

    // Extract TODOs (works for both JS and Python)
    let lineNum = 0;
    for (const line of content.split('\n')) {
      lineNum++;
      // Match both // and # comments
      const todoMatch = line.match(/(?:\/\/|#)\s*(TODO|FIXME|BUG|HACK|NOTE):\s*(.+)$/);
      if (todoMatch) {
        result.todos.push({
          type: todoMatch[1],
          text: todoMatch[2].trim(),
          line: lineNum,
        });
      }
    }

    return result;
  } catch (e) {
    return null;
  }
}

/**
 * Scan a directory recursively for code files
 */
async function scanDirectory(dirPath, baseDir = null) {
  const results = [];
  baseDir = baseDir || dirPath;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip hidden files and node_modules
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        const subResults = await scanDirectory(fullPath, baseDir);
        results.push(...subResults);
      } else if (CODE_EXTENSIONS.includes(path.extname(entry.name))) {
        const fileInfo = await scanFile(fullPath);
        if (fileInfo) {
          fileInfo.relativePath = path.relative(baseDir, fullPath);
          results.push(fileInfo);
        }
      }
    }
  } catch (e) {
    // Directory doesn't exist or not accessible
  }

  return results;
}

/**
 * Detect project type and structure
 */
async function detectProjectType(projectPath) {
  const result = {
    type: 'unknown',
    framework: null,
    hasTypeScript: false,
    isPython: false,
    isMCP: false,
    isBackend: false,
    structure: {},
    language: 'javascript',
  };

  // Check for Python project
  try {
    await fs.access(path.join(projectPath, 'requirements.txt'));
    result.isPython = true;
    result.language = 'python';
    result.type = 'python';
  } catch (e) {}

  try {
    await fs.access(path.join(projectPath, 'pyproject.toml'));
    result.isPython = true;
    result.language = 'python';
    result.type = 'python';
  } catch (e) {}

  try {
    // Check package.json
    const pkgPath = path.join(projectPath, 'package.json');
    const pkgContent = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Detect MCP server
    if (deps['@modelcontextprotocol/sdk'] || pkg.name?.includes('mcp')) {
      result.isMCP = true;
      result.type = 'mcp-server';
    }

    // Detect framework
    if (deps['next']) result.framework = 'nextjs';
    else if (deps['gatsby']) result.framework = 'gatsby';
    else if (deps['react-native'] || deps['expo']) result.framework = 'react-native';
    else if (deps['react']) result.framework = 'react';
    else if (deps['vue']) result.framework = 'vue';
    else if (deps['svelte']) result.framework = 'svelte';
    else if (deps['electron']) result.framework = 'electron';
    else if (deps['express'] || deps['fastify'] || deps['koa']) {
      result.isBackend = true;
      result.type = 'backend';
    }

    result.hasTypeScript = !!deps['typescript'];
    if (!result.isMCP && !result.isBackend) {
      result.type = result.framework || 'javascript';
    }

  } catch (e) {
    // No package.json
  }

  // Check for common directories - collect all matches
  for (const [type, dirs] of Object.entries(SCAN_DIRS)) {
    result.structure[type] = [];
    for (const dir of dirs) {
      const fullPath = path.join(projectPath, dir);
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          result.structure[type].push(dir);
        }
      } catch (e) {
        // Dir doesn't exist
      }
    }
    // Use first match as primary
    result.structure[type] = result.structure[type][0] || null;
  }

  return result;
}

/**
 * Extract screens/pages from the project
 */
async function extractScreens(projectPath, projectType) {
  const screens = [];

  // Try multiple page directories
  const pageDirs = [];
  if (projectType.structure.pages) {
    pageDirs.push(projectType.structure.pages);
  }

  // Also check app directory for Next.js App Router
  if (projectType.framework === 'nextjs') {
    for (const appDir of ['src/app', 'app']) {
      const fullPath = path.join(projectPath, appDir);
      try {
        await fs.access(fullPath);
        pageDirs.push(appDir);
      } catch (e) {}
    }
  }

  if (pageDirs.length === 0) return screens;

  // Scan all found directories
  for (const pagesDir of [...new Set(pageDirs)]) {
    const fullPath = path.join(projectPath, pagesDir);
    let files = [];
    try {
      files = await scanDirectory(fullPath);
    } catch (e) {
      continue;
    }

    for (const file of files) {
      // Skip layout files, error pages, etc.
      if (['layout', 'error', 'loading', '_app', '_document', 'not-found', 'global-error'].some(
        skip => file.name.toLowerCase().includes(skip)
      )) {
        continue;
      }

      // Skip API routes
      if (file.relativePath.includes('/api/') || file.relativePath.startsWith('api/')) {
        continue;
      }

      // Only include page.tsx/js files for App Router, or any file for Pages Router
      const isAppRouter = pagesDir.includes('app');
      if (isAppRouter && file.name !== 'page') {
        continue;
      }

      // Determine route from file path
      let route = '/' + file.relativePath
        .replace(/\\/g, '/')
        .replace(/\.(jsx?|tsx?)$/, '')
        .replace(/\/index$/, '')
        .replace(/\/page$/, '')
        // Remove route groups like (dashboard)
        .replace(/\/\([^)]+\)/g, '');

      if (route === '/') route = '/';

      // Clean route name for display
      let displayName = file.name;
      if (file.name === 'page') {
        // Use parent folder name for App Router pages
        const parts = file.relativePath.split('/');
        const parentDir = parts[parts.length - 2] || 'home';
        displayName = parentDir.replace(/^\(.*\)$/, '') || 'home';
      }

      // Extract component imports from this screen
      const componentImports = file.imports
        .filter(imp => imp.from.includes('component') || imp.from.startsWith('./') || imp.from.startsWith('../'))
        .flatMap(imp => imp.names)
        .filter(name => name && name[0] === name[0].toUpperCase());

      // Avoid duplicate screens
      const screenId = `screen-${route.replace(/\//g, '-') || 'home'}`;
      if (screens.some(s => s.id === screenId)) continue;

      screens.push({
        id: screenId,
        type: 'screen',
        name: displayName,
        displayName: formatDisplayName(displayName),
        route,
        filePath: file.path,
        relativePath: file.relativePath,
        exports: file.exports,
        imports: file.imports,
        todos: file.todos,
        functions: file.functions || [],
        hooks: file.hooks || [],
        usedComponents: componentImports,
        lines: file.lines,
      });
    }
  }

  return screens;
}

/**
 * Extract components from the project
 */
async function extractComponents(projectPath, projectType) {
  const components = [];

  // Determine directories to scan based on project type
  let dirsToScan = [];

  if (projectType.structure.components) {
    dirsToScan.push(projectType.structure.components);
  }

  // For MCP servers or backend, scan src and core directories
  if (projectType.isMCP || projectType.isBackend || !projectType.structure.components) {
    for (const dir of ['src', 'lib', 'core', 'modules']) {
      const fullPath = path.join(projectPath, dir);
      try {
        await fs.access(fullPath);
        dirsToScan.push(dir);
      } catch (e) {}
    }
  }

  if (dirsToScan.length === 0) return components;

  // Scan all found directories
  for (const componentsDir of [...new Set(dirsToScan)]) {
    const fullPath = path.join(projectPath, componentsDir);
    let files = [];
    try {
      files = await scanDirectory(fullPath);
    } catch (e) {
      continue;
    }

    for (const file of files) {
      // Skip index files and test files
      if (file.name === 'index' || file.name.includes('.test') || file.name.includes('.spec')) {
        continue;
      }

      // Skip page files (they're screens)
      if (file.name === 'page' || file.name === 'layout') {
        continue;
      }

      const componentName = file.exports[0] || file.name;

      // Avoid duplicates
      const componentId = `component-${componentName}`;
      if (components.some(c => c.id === componentId)) continue;

      // Determine component type for non-React projects
      let componentType = 'component';
      if (projectType.isMCP) componentType = 'module';
      if (projectType.isBackend) componentType = 'module';
      if (projectType.isPython) componentType = 'module';

      components.push({
        id: componentId,
        type: componentType,
        name: componentName,
        displayName: formatDisplayName(componentName),
        filePath: file.path,
        relativePath: file.relativePath,
        exports: file.exports,
        imports: file.imports,
        todos: file.todos,
        functions: file.functions || [],
        hooks: file.hooks || [],
        lines: file.lines,
      });
    }
  }

  return components;
}

/**
 * Extract all TODOs from the project
 */
async function extractAllTodos(projectPath) {
  const todos = [];
  const srcPath = path.join(projectPath, 'src');

  let files = [];
  try {
    files = await scanDirectory(srcPath);
  } catch (e) {
    // Try root if no src
    files = await scanDirectory(projectPath);
  }

  for (const file of files) {
    for (const todo of file.todos) {
      todos.push({
        id: `todo-${file.name}-${todo.line}`,
        type: 'todo',
        todoType: todo.type,
        text: todo.text,
        filePath: file.path,
        relativePath: file.relativePath,
        line: todo.line,
        priority: todo.type === 'BUG' ? 'high' :
                  todo.type === 'FIXME' ? 'medium' : 'low',
      });
    }
  }

  return todos;
}

/**
 * Read CLAUDE_STATE.md if exists
 */
async function readClaudeState(projectPath) {
  try {
    const statePath = path.join(projectPath, 'CLAUDE_STATE.md');
    const content = await fs.readFile(statePath, 'utf-8');

    const result = {
      exists: true,
      summary: null,
      status: {},
      goals: [],
      issues: [],
    };

    // Extract summary
    const summaryMatch = content.match(/##\s*.*Project Overview.*\n\n([^\n#]+)/i);
    if (summaryMatch) {
      result.summary = summaryMatch[1].trim();
    }

    // Extract current status table
    const statusSection = content.match(/##\s*.*Current Status[\s\S]*?\n\n([\s\S]*?)(?=\n##|\n---|\n$)/i);
    if (statusSection) {
      const rows = statusSection[1].matchAll(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g);
      for (const row of rows) {
        const area = row[1].trim();
        const status = row[2].trim();
        if (area && !area.includes('---') && area !== 'Area') {
          result.status[area] = status.includes('✅') ? 'done' :
                                status.includes('🔄') ? 'in_progress' :
                                status.includes('📝') ? 'planned' : 'unknown';
        }
      }
    }

    // Extract goals
    const goalsSection = content.match(/##\s*.*Immediate Goals[\s\S]*?\n\n([\s\S]*?)(?=\n##|\n---|\n$)/i);
    if (goalsSection) {
      const goals = goalsSection[1].matchAll(/^\d+\.\s*(.+)$/gm);
      for (const goal of goals) {
        result.goals.push(goal[1].trim());
      }
    }

    // Extract issues
    const issuesSection = content.match(/##\s*.*Known Issues[\s\S]*?\n\n([\s\S]*?)(?=\n##|\n---|\n$)/i);
    if (issuesSection) {
      const issues = issuesSection[1].matchAll(/[-*]\s*(.+)/g);
      for (const issue of issues) {
        const text = issue[1].trim();
        if (text && text !== 'None currently tracked') {
          result.issues.push(text);
        }
      }
    }

    return result;
  } catch (e) {
    return { exists: false };
  }
}

/**
 * Format component/screen name for display
 */
function formatDisplayName(name) {
  // Convert PascalCase or kebab-case to readable format
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Main function: Scan entire project and return structured data
 */
async function scanProjectForMap(projectPath) {
  const projectName = path.basename(projectPath);

  // Detect project type
  const projectType = await detectProjectType(projectPath);

  // Extract all data in parallel
  const [screens, components, todos, claudeState] = await Promise.all([
    extractScreens(projectPath, projectType),
    extractComponents(projectPath, projectType),
    extractAllTodos(projectPath),
    readClaudeState(projectPath),
  ]);

  // Build connections between components and screens
  const connections = [];

  // Connect components to screens that import them
  for (const screen of screens) {
    // This would require analyzing imports - simplified for now
  }

  return {
    meta: {
      name: projectName,
      path: projectPath,
      scannedAt: new Date().toISOString(),
      projectType: projectType.type,
      framework: projectType.framework,
    },
    layers: {
      screens,
      components,
      todos,
      features: claudeState.goals?.map((goal, i) => ({
        id: `feature-${i}`,
        type: 'feature',
        name: goal,
        status: 'planned',
      })) || [],
    },
    claudeState,
    connections,
    stats: {
      totalScreens: screens.length,
      totalComponents: components.length,
      totalTodos: todos.length,
      todosByType: todos.reduce((acc, t) => {
        acc[t.todoType] = (acc[t.todoType] || 0) + 1;
        return acc;
      }, {}),
    },
  };
}

/**
 * Update CLAUDE_STATE.md with work session changes
 * @param {string} projectPath - Path to project
 * @param {Object} changes - Changes made during the session
 */
async function updateClaudeState(projectPath, changes) {
  const statePath = path.join(projectPath, 'CLAUDE_STATE.md');
  let content;

  try {
    content = await fs.readFile(statePath, 'utf-8');
  } catch (e) {
    // Create new CLAUDE_STATE.md if doesn't exist
    content = `# ${path.basename(projectPath)}

## Project Overview
Project managed via Project Dashboard.

## Current Status
| Area | Status |
|------|--------|

## Work Session Log

## Immediate Goals

## Known Issues

---
*Last updated: ${new Date().toISOString()}*
`;
  }

  // Add work session log entry
  const timestamp = new Date().toLocaleString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sessionEntry = generateSessionEntry(timestamp, changes);

  // Insert session entry after "## Work Session Log" header
  if (content.includes('## Work Session Log')) {
    content = content.replace(
      /(## Work Session Log\n)/,
      `$1\n### ${timestamp}\n${sessionEntry}\n`
    );
  } else {
    // Add section if it doesn't exist
    const insertPoint = content.indexOf('## Immediate Goals');
    if (insertPoint > -1) {
      content = content.slice(0, insertPoint) +
        `## Work Session Log\n\n### ${timestamp}\n${sessionEntry}\n\n` +
        content.slice(insertPoint);
    } else {
      content += `\n## Work Session Log\n\n### ${timestamp}\n${sessionEntry}\n`;
    }
  }

  // Update status table if feature status changed
  if (changes.features && changes.features.length > 0) {
    content = updateStatusTable(content, changes.features);
  }

  // Update timestamp
  content = content.replace(
    /\*Last updated:.*\*/,
    `*Last updated: ${new Date().toISOString()}*`
  );

  await fs.writeFile(statePath, content);
  return { success: true, path: statePath };
}

/**
 * Generate session entry text
 */
function generateSessionEntry(timestamp, changes) {
  const lines = [];

  if (changes.summary) {
    lines.push(changes.summary);
    lines.push('');
  }

  if (changes.features && changes.features.length > 0) {
    lines.push('**פיצ׳רים:**');
    for (const feature of changes.features) {
      const statusEmoji = feature.status === 'done' ? '✅' :
                          feature.status === 'in_progress' ? '🔄' :
                          feature.status === 'blocked' ? '🚫' : '📝';
      lines.push(`- ${statusEmoji} ${feature.name}`);
    }
    lines.push('');
  }

  if (changes.todos && changes.todos.length > 0) {
    lines.push('**משימות שהושלמו:**');
    for (const todo of changes.todos) {
      lines.push(`- ✅ ${todo.text}`);
    }
    lines.push('');
  }

  if (changes.notes) {
    lines.push('**הערות:**');
    lines.push(changes.notes);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Update status table in CLAUDE_STATE.md
 */
function updateStatusTable(content, features) {
  for (const feature of features) {
    const statusText = feature.status === 'done' ? '✅ הושלם' :
                       feature.status === 'in_progress' ? '🔄 בעבודה' :
                       feature.status === 'blocked' ? '🚫 חסום' : '📝 מתוכנן';

    // Try to update existing row
    const rowRegex = new RegExp(`\\|\\s*${escapeRegex(feature.name)}\\s*\\|[^|]*\\|`, 'g');
    if (rowRegex.test(content)) {
      content = content.replace(rowRegex, `| ${feature.name} | ${statusText} |`);
    } else {
      // Add new row to table
      const tableEnd = content.indexOf('\n\n', content.indexOf('| Area | Status |'));
      if (tableEnd > -1) {
        content = content.slice(0, tableEnd) +
          `\n| ${feature.name} | ${statusText} |` +
          content.slice(tableEnd);
      }
    }
  }

  return content;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  scanProjectForMap,
  scanFile,
  scanDirectory,
  detectProjectType,
  extractScreens,
  extractComponents,
  extractAllTodos,
  readClaudeState,
  updateClaudeState,
};
