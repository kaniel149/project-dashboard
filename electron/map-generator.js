/**
 * Map Generator - יצירת מבנה נתונים למפה
 *
 * לוקח נתונים מהסורק ויוצר מפה עם מיקומים וקשרים
 */

const fs = require('fs').promises;
const path = require('path');

// Layer colors - extended for different project types
const LAYER_COLORS = {
  screen: { bg: '#e9d5ff', border: '#a855f7', text: '#7c3aed' },      // Purple
  component: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },   // Blue
  feature: { bg: '#d1fae5', border: '#10b981', text: '#059669' },     // Green
  todo: { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' },        // Orange
  module: { bg: '#e0e7ff', border: '#6366f1', text: '#4f46e5' },      // Indigo (for MCP/backend)
  function: { bg: '#fce7f3', border: '#ec4899', text: '#db2777' },    // Pink
  api: { bg: '#ccfbf1', border: '#14b8a6', text: '#0d9488' },         // Teal
};

// Status colors
const STATUS_COLORS = {
  planned: { bg: '#f3f4f6', border: '#9ca3af' },
  in_progress: { bg: '#dbeafe', border: '#3b82f6' },
  done: { bg: '#d1fae5', border: '#10b981' },
  bug: { bg: '#fee2e2', border: '#ef4444' },
  blocked: { bg: '#ffedd5', border: '#f97316' },
};

// TODO type icons
const TODO_ICONS = {
  TODO: '📝',
  FIXME: '🔧',
  BUG: '🐛',
  HACK: '⚠️',
  NOTE: '📌',
};

/**
 * Calculate node positions in a grid layout
 */
function calculatePositions(nodes, startX = 100, startY = 100, nodeWidth = 200, nodeHeight = 120, gap = 40) {
  const positioned = [];
  const cols = 4;

  nodes.forEach((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    positioned.push({
      ...node,
      x: startX + col * (nodeWidth + gap),
      y: startY + row * (nodeHeight + gap),
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  return positioned;
}

/**
 * Generate map structure from scanned data
 */
function generateMapStructure(scanData, existingMap = null) {
  const nodes = [];
  let yOffset = 100;

  // Determine project type for appropriate labels
  const projectType = scanData.meta?.projectType || 'unknown';
  const isMCP = projectType === 'mcp-server';
  const isBackend = projectType === 'backend';
  const isPython = projectType === 'python';
  const isNonFrontend = isMCP || isBackend || isPython;

  // Section: Screens (or API endpoints for backend)
  if (scanData.layers.screens.length > 0) {
    const headerName = isNonFrontend ? '🔌 API / Endpoints' : '📱 מסכים';

    // Add section header
    nodes.push({
      id: 'header-screens',
      type: 'header',
      layer: 'screen',
      name: headerName,
      x: 50,
      y: yOffset,
      width: 800,
      height: 30,
    });

    yOffset += 50;

    const screenNodes = scanData.layers.screens.map(screen => ({
      id: screen.id,
      type: 'node',
      layer: 'screen',
      name: screen.displayName,
      subtitle: screen.route,
      filePath: screen.filePath,
      relativePath: screen.relativePath,
      status: 'done',
      todoCount: screen.todos?.length || 0,
      colors: LAYER_COLORS.screen,
    }));

    const positioned = calculatePositions(screenNodes, 50, yOffset);
    nodes.push(...positioned);

    yOffset += Math.ceil(screenNodes.length / 4) * 160 + 60;
  }

  // Section: Components (or Modules for non-frontend)
  if (scanData.layers.components.length > 0) {
    let headerName = '🧩 קומפוננטות';
    let layerType = 'component';
    let colors = LAYER_COLORS.component;

    if (isMCP) {
      headerName = '📦 מודולים';
      layerType = 'module';
      colors = LAYER_COLORS.module;
    } else if (isBackend || isPython) {
      headerName = '🔧 מודולים';
      layerType = 'module';
      colors = LAYER_COLORS.module;
    }

    nodes.push({
      id: 'header-components',
      type: 'header',
      layer: layerType,
      name: headerName,
      x: 50,
      y: yOffset,
      width: 800,
      height: 30,
    });

    yOffset += 50;

    const componentNodes = scanData.layers.components.map(comp => ({
      id: comp.id,
      type: 'node',
      layer: comp.type === 'module' ? 'module' : layerType,
      name: comp.displayName,
      subtitle: `${comp.lines} שורות${comp.functions?.length ? ` • ${comp.functions.length} פונקציות` : ''}`,
      filePath: comp.filePath,
      relativePath: comp.relativePath,
      status: 'done',
      todoCount: comp.todos?.length || 0,
      functions: comp.functions || [],
      colors: comp.type === 'module' ? LAYER_COLORS.module : colors,
    }));

    const positioned = calculatePositions(componentNodes, 50, yOffset);
    nodes.push(...positioned);

    yOffset += Math.ceil(componentNodes.length / 4) * 160 + 60;
  }

  // Section: Features (from goals)
  if (scanData.layers.features.length > 0) {
    nodes.push({
      id: 'header-features',
      type: 'header',
      layer: 'feature',
      name: '✨ פיצ\'רים ויעדים',
      x: 50,
      y: yOffset,
      width: 800,
      height: 30,
    });

    yOffset += 50;

    const featureNodes = scanData.layers.features.map(feature => ({
      id: feature.id,
      type: 'node',
      layer: 'feature',
      name: feature.name,
      subtitle: '',
      status: feature.status || 'planned',
      colors: LAYER_COLORS.feature,
    }));

    const positioned = calculatePositions(featureNodes, 50, yOffset, 250, 80);
    nodes.push(...positioned);

    yOffset += Math.ceil(featureNodes.length / 4) * 140 + 60;
  }

  // Section: TODOs
  if (scanData.layers.todos.length > 0) {
    nodes.push({
      id: 'header-todos',
      type: 'header',
      layer: 'todo',
      name: `⚠️ TODOs (${scanData.layers.todos.length})`,
      x: 50,
      y: yOffset,
      width: 800,
      height: 30,
    });

    yOffset += 50;

    const todoNodes = scanData.layers.todos.slice(0, 20).map(todo => ({
      id: todo.id,
      type: 'node',
      layer: 'todo',
      name: `${TODO_ICONS[todo.todoType] || '📝'} ${todo.text}`,
      subtitle: `${todo.relativePath}:${todo.line}`,
      filePath: todo.filePath,
      line: todo.line,
      priority: todo.priority,
      status: todo.todoType === 'BUG' ? 'bug' : 'planned',
      colors: LAYER_COLORS.todo,
    }));

    const positioned = calculatePositions(todoNodes, 50, yOffset, 280, 80);
    nodes.push(...positioned);
  }

  // Merge with existing positions if available
  if (existingMap && existingMap.nodes) {
    for (const node of nodes) {
      const existing = existingMap.nodes.find(n => n.id === node.id);
      if (existing) {
        node.x = existing.x;
        node.y = existing.y;
        node.status = existing.status || node.status;
        node.notes = existing.notes;
      }
    }
  }

  return {
    version: 1,
    meta: scanData.meta,
    nodes,
    connections: [],
    customNodes: existingMap?.customNodes || [],
    settings: {
      layers: {
        screen: { visible: true, label: 'מסכים' },
        component: { visible: true, label: 'קומפוננטות' },
        feature: { visible: true, label: 'פיצ\'רים' },
        todo: { visible: true, label: 'TODOs' },
      },
    },
    stats: scanData.stats,
    claudeState: scanData.claudeState,
    // Include raw screen data for drill-down
    rawScreens: scanData.layers.screens,
  };
}

/**
 * Load existing map data
 */
async function loadMapData(projectPath) {
  const mapDir = path.join(projectPath, '.project-map');
  const mapFile = path.join(mapDir, 'map.json');

  try {
    const content = await fs.readFile(mapFile, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

/**
 * Save map data
 */
async function saveMapData(projectPath, mapData) {
  const mapDir = path.join(projectPath, '.project-map');

  try {
    await fs.mkdir(mapDir, { recursive: true });
  } catch (e) {}

  const mapFile = path.join(mapDir, 'map.json');
  await fs.writeFile(mapFile, JSON.stringify(mapData, null, 2));

  return mapFile;
}

/**
 * Add custom node to map
 */
function addCustomNode(mapData, node) {
  const id = `custom-${Date.now()}`;

  mapData.customNodes.push({
    id,
    type: 'custom',
    layer: node.layer || 'feature',
    name: node.name,
    subtitle: node.subtitle || '',
    x: node.x || 100,
    y: node.y || 100,
    width: node.width || 200,
    height: node.height || 100,
    status: node.status || 'planned',
    notes: node.notes || '',
    colors: LAYER_COLORS[node.layer] || LAYER_COLORS.feature,
    createdAt: new Date().toISOString(),
  });

  return id;
}

/**
 * Update node status
 */
function updateNodeStatus(mapData, nodeId, status) {
  const node = mapData.nodes.find(n => n.id === nodeId);
  if (node) {
    node.status = status;
    node.updatedAt = new Date().toISOString();
  }

  const customNode = mapData.customNodes.find(n => n.id === nodeId);
  if (customNode) {
    customNode.status = status;
    customNode.updatedAt = new Date().toISOString();
  }
}

/**
 * Update node position
 */
function updateNodePosition(mapData, nodeId, x, y) {
  const node = mapData.nodes.find(n => n.id === nodeId) ||
               mapData.customNodes.find(n => n.id === nodeId);

  if (node) {
    node.x = x;
    node.y = y;
  }
}

module.exports = {
  generateMapStructure,
  loadMapData,
  saveMapData,
  addCustomNode,
  updateNodeStatus,
  updateNodePosition,
  LAYER_COLORS,
  STATUS_COLORS,
  TODO_ICONS,
};
