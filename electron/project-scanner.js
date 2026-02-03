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
  components: ['src/components', 'components', 'src/ui', 'app/components'],
  pages: ['src/pages', 'pages', 'src/screens', 'screens', 'app', 'src/app', 'src/views'],
  routes: ['src/routes', 'src/router', 'app'],
};

// File extensions to scan
const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];

/**
 * Scan a single file for components and exports
 */
async function scanFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath, ext);

    const result = {
      path: filePath,
      name: fileName,
      type: 'file',
      exports: [],
      imports: [],
      todos: [],
      functions: [],
      hooks: [],
      lines: content.split('\n').length,
    };

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

    // Extract TODOs
    const todoRegex = /\/\/\s*(TODO|FIXME|BUG|HACK|NOTE):\s*(.+)$/gm;
    let lineNum = 0;
    for (const line of content.split('\n')) {
      lineNum++;
      const todoMatch = line.match(/\/\/\s*(TODO|FIXME|BUG|HACK|NOTE):\s*(.+)$/);
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
    structure: {},
  };

  try {
    // Check package.json
    const pkgPath = path.join(projectPath, 'package.json');
    const pkgContent = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Detect framework
    if (deps['next']) result.framework = 'nextjs';
    else if (deps['gatsby']) result.framework = 'gatsby';
    else if (deps['react-native'] || deps['expo']) result.framework = 'react-native';
    else if (deps['react']) result.framework = 'react';
    else if (deps['vue']) result.framework = 'vue';
    else if (deps['svelte']) result.framework = 'svelte';
    else if (deps['electron']) result.framework = 'electron';

    result.hasTypeScript = !!deps['typescript'];
    result.type = result.framework || 'javascript';

  } catch (e) {
    // No package.json
  }

  // Check for common directories
  for (const [type, dirs] of Object.entries(SCAN_DIRS)) {
    for (const dir of dirs) {
      const fullPath = path.join(projectPath, dir);
      try {
        await fs.access(fullPath);
        result.structure[type] = dir;
        break;
      } catch (e) {
        // Dir doesn't exist
      }
    }
  }

  return result;
}

/**
 * Extract screens/pages from the project
 */
async function extractScreens(projectPath, projectType) {
  const screens = [];
  const pagesDir = projectType.structure.pages;

  if (!pagesDir) return screens;

  const fullPath = path.join(projectPath, pagesDir);
  const files = await scanDirectory(fullPath);

  for (const file of files) {
    // Skip layout files, error pages, etc.
    if (['layout', 'error', 'loading', '_app', '_document'].some(
      skip => file.name.toLowerCase().includes(skip)
    )) {
      continue;
    }

    // Determine route from file path
    let route = '/' + file.relativePath
      .replace(/\\/g, '/')
      .replace(/\.(jsx?|tsx?)$/, '')
      .replace(/\/index$/, '')
      .replace(/\/page$/, '');

    if (route === '/') route = '/';

    // Extract component imports from this screen
    const componentImports = file.imports
      .filter(imp => imp.from.includes('component') || imp.from.startsWith('./') || imp.from.startsWith('../'))
      .flatMap(imp => imp.names)
      .filter(name => name && name[0] === name[0].toUpperCase());

    screens.push({
      id: `screen-${file.name}`,
      type: 'screen',
      name: file.name,
      displayName: formatDisplayName(file.name),
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

  return screens;
}

/**
 * Extract components from the project
 */
async function extractComponents(projectPath, projectType) {
  const components = [];
  const componentsDir = projectType.structure.components;

  if (!componentsDir) return components;

  const fullPath = path.join(projectPath, componentsDir);
  const files = await scanDirectory(fullPath);

  for (const file of files) {
    // Skip index files and test files
    if (file.name === 'index' || file.name.includes('.test') || file.name.includes('.spec')) {
      continue;
    }

    const componentName = file.exports[0] || file.name;

    components.push({
      id: `component-${componentName}`,
      type: 'component',
      name: componentName,
      displayName: formatDisplayName(componentName),
      filePath: file.path,
      relativePath: file.relativePath,
      exports: file.exports,
      imports: file.imports,
      todos: file.todos,
      lines: file.lines,
    });
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

module.exports = {
  scanProjectForMap,
  scanFile,
  scanDirectory,
  detectProjectType,
  extractScreens,
  extractComponents,
  extractAllTodos,
  readClaudeState,
};
