/**
 * Interactive Map Generator - יוצר את קובץ ה-HTML האינטראקטיבי
 */

const fs = require('fs').promises;
const path = require('path');
const { scanProjectForMap } = require('./project-scanner');
const { generateMapStructure, loadMapData, saveMapData } = require('./map-generator');

/**
 * Generate the interactive HTML map
 */
async function generateInteractiveMap(projectPath) {
  // Scan the project
  const scanData = await scanProjectForMap(projectPath);

  // Load existing map data (for positions/custom nodes)
  const existingMap = await loadMapData(projectPath);

  // Generate map structure
  const mapData = generateMapStructure(scanData, existingMap);

  // Save the map data
  await saveMapData(projectPath, mapData);

  // Generate HTML
  const html = generateMapHtml(mapData, projectPath);

  // Save HTML file
  const mapDir = path.join(projectPath, '.project-map');
  try {
    await fs.mkdir(mapDir, { recursive: true });
  } catch (e) {}

  const htmlPath = path.join(mapDir, 'map.html');
  await fs.writeFile(htmlPath, html);

  return { htmlPath, mapData };
}

/**
 * Generate the HTML content for the map
 */
function generateMapHtml(mapData, projectPath) {
  const projectName = mapData.meta.name;
  const mapDataJson = JSON.stringify(mapData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
  const escapedProjectPath = projectPath.replace(/\\/g, '/').replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🗺️ ${projectName} - מפת פרויקט</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

    /* Toolbar */
    .toolbar {
      position: fixed; top: 0; left: 0; right: 0; height: 56px; z-index: 1000;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .toolbar-right { display: flex; align-items: center; gap: 16px; }
    .toolbar-title {
      display: flex; align-items: center; gap: 12px;
      color: white; font-weight: 600; font-size: 1.1em;
    }
    .toolbar-title .icon { font-size: 1.4em; }
    .toolbar-stats {
      display: flex; gap: 16px; color: rgba(255,255,255,0.6); font-size: 0.85em;
    }
    .toolbar-stat { display: flex; align-items: center; gap: 6px; }

    /* Layer toggles */
    .layers {
      display: flex; align-items: center; gap: 8px;
    }
    .layer-toggle {
      padding: 6px 12px; border-radius: 20px; border: none;
      font-size: 0.8em; font-weight: 500; cursor: pointer;
      transition: all 0.2s; display: flex; align-items: center; gap: 6px;
    }
    .layer-toggle.active { opacity: 1; }
    .layer-toggle:not(.active) { opacity: 0.4; filter: grayscale(100%); }
    .layer-screen { background: #e9d5ff; color: #7c3aed; }
    .layer-component { background: #dbeafe; color: #1d4ed8; }
    .layer-feature { background: #d1fae5; color: #059669; }
    .layer-todo { background: #fef3c7; color: #d97706; }

    /* Actions */
    .toolbar-actions { display: flex; gap: 8px; }
    .btn {
      padding: 8px 16px; border-radius: 8px; border: none;
      font-size: 0.85em; font-weight: 500; cursor: pointer;
      transition: all 0.2s; display: flex; align-items: center; gap: 6px;
    }
    .btn-secondary { background: rgba(255,255,255,0.1); color: white; }
    .btn-secondary:hover { background: rgba(255,255,255,0.2); }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }

    /* Canvas */
    .canvas-container {
      position: fixed; top: 56px; left: 0; right: 0; bottom: 0;
      background: #0f172a; overflow: hidden; cursor: grab;
    }
    .canvas-container.dragging { cursor: grabbing; }
    .canvas {
      position: absolute; transform-origin: 0 0;
      min-width: 3000px; min-height: 2000px;
      background-image:
        radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    /* Nodes */
    .node {
      position: absolute; border-radius: 12px; cursor: move;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: box-shadow 0.2s, transform 0.1s;
      user-select: none; overflow: hidden;
    }
    .node:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      transform: translateY(-2px);
    }
    .node.dragging { opacity: 0.8; z-index: 1000; cursor: grabbing; }
    .node.selected { box-shadow: 0 0 0 3px #3b82f6, 0 8px 30px rgba(0,0,0,0.4); }
    .node-header {
      padding: 12px 14px; font-weight: 600; font-size: 0.9em;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .node-body { padding: 10px 14px; background: rgba(255,255,255,0.5); }
    .node-subtitle { font-size: 0.75em; opacity: 0.7; font-family: monospace; }
    .node-badges { display: flex; gap: 6px; margin-top: 8px; }
    .node-badge {
      font-size: 0.7em; padding: 2px 8px; border-radius: 10px;
      background: rgba(0,0,0,0.1);
    }
    .node-badge.todo { background: #fef3c7; color: #d97706; }
    .node-badge.status { background: #d1fae5; color: #059669; }
    .node-menu {
      width: 24px; height: 24px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1.2em; opacity: 0.5;
    }
    .node-menu:hover { background: rgba(0,0,0,0.1); opacity: 1; }

    /* Section headers */
    .section-header {
      position: absolute; font-size: 1.2em; font-weight: 700;
      color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 10px;
    }
    .section-header::after {
      content: ''; flex: 1; height: 2px; background: rgba(255,255,255,0.1);
      margin-right: 20px;
    }

    /* Context menu */
    .context-menu {
      position: fixed; background: #1e293b; border-radius: 12px;
      padding: 8px 0; min-width: 180px; z-index: 2000;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: none;
    }
    .context-menu.show { display: block; }
    .context-menu-item {
      padding: 10px 16px; cursor: pointer; font-size: 0.9em;
      color: white; display: flex; align-items: center; gap: 10px;
      transition: background 0.1s;
    }
    .context-menu-item:hover { background: rgba(255,255,255,0.1); }
    .context-menu-item.danger { color: #f87171; }
    .context-menu-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 6px 0; }

    /* Status submenu */
    .status-menu { position: relative; }
    .status-submenu {
      position: absolute; right: 100%; top: 0; background: #1e293b;
      border-radius: 8px; padding: 6px 0; min-width: 140px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: none;
    }
    .status-menu:hover .status-submenu { display: block; }

    /* Toast */
    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      padding: 12px 24px; background: rgba(0,0,0,0.9); color: white;
      border-radius: 8px; font-size: 0.9em; z-index: 3000;
      opacity: 0; transition: opacity 0.3s;
    }
    .toast.show { opacity: 1; }

    /* Minimap */
    .minimap {
      position: fixed; bottom: 20px; right: 20px; width: 200px; height: 150px;
      background: rgba(0,0,0,0.5); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
      overflow: hidden; z-index: 999;
    }
    .minimap-viewport {
      position: absolute; border: 2px solid #3b82f6; background: rgba(59,130,246,0.1);
      pointer-events: none;
    }

    /* Hidden layers */
    .layer-hidden { display: none !important; }

    /* Keyboard hint */
    .keyboard-hint {
      position: fixed; bottom: 20px; left: 20px; color: rgba(255,255,255,0.3);
      font-size: 0.75em; z-index: 999;
    }
    .keyboard-hint kbd {
      background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;
      margin: 0 2px;
    }

    /* Breadcrumb */
    .breadcrumb {
      display: flex; align-items: center; gap: 8px; color: white;
    }
    .breadcrumb-item {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 6px; cursor: pointer;
      transition: background 0.2s;
    }
    .breadcrumb-item:hover { background: rgba(255,255,255,0.1); }
    .breadcrumb-item.active { background: rgba(255,255,255,0.15); cursor: default; }
    .breadcrumb-sep { color: rgba(255,255,255,0.3); }

    /* Drill-down view */
    .drilldown-header {
      position: absolute; font-size: 1.5em; font-weight: 700;
      color: white; display: flex; flex-direction: column; gap: 8px;
    }
    .drilldown-header .title { display: flex; align-items: center; gap: 12px; }
    .drilldown-header .subtitle {
      font-size: 0.5em; font-weight: 400; color: rgba(255,255,255,0.5);
      font-family: monospace;
    }
    .drilldown-header .file-link {
      font-size: 0.4em; color: #60a5fa; cursor: pointer;
      text-decoration: underline;
    }
    .drilldown-section {
      position: absolute; color: rgba(255,255,255,0.6);
      font-size: 0.9em; font-weight: 600;
    }

    /* Drillable node indicator */
    .node.drillable::after {
      content: '🔍';
      position: absolute; top: 8px; left: 8px;
      font-size: 0.7em; opacity: 0.5;
    }
    .node.drillable:hover::after { opacity: 1; }
  </style>
</head>
<body>
  <!-- Toolbar -->
  <div class="toolbar">
    <div class="toolbar-right">
      <div class="toolbar-title">
        <span class="icon">🗺️</span>
        <span>${projectName}</span>
      </div>
      <div class="toolbar-stats">
        <span class="toolbar-stat">📱 <span id="stat-screens">${mapData.stats.totalScreens}</span></span>
        <span class="toolbar-stat">🧩 <span id="stat-components">${mapData.stats.totalComponents}</span></span>
        <span class="toolbar-stat">⚠️ <span id="stat-todos">${mapData.stats.totalTodos}</span></span>
      </div>
    </div>

    <div class="layers">
      <button class="layer-toggle layer-screen active" data-layer="screen" onclick="toggleLayer('screen')">
        📱 מסכים
      </button>
      <button class="layer-toggle layer-component active" data-layer="component" onclick="toggleLayer('component')">
        🧩 קומפוננטות
      </button>
      <button class="layer-toggle layer-feature active" data-layer="feature" onclick="toggleLayer('feature')">
        ✨ פיצ'רים
      </button>
      <button class="layer-toggle layer-todo active" data-layer="todo" onclick="toggleLayer('todo')">
        ⚠️ TODOs
      </button>
    </div>

    <div class="toolbar-actions">
      <button class="btn btn-secondary" onclick="addNode()">➕ הוסף</button>
      <button class="btn btn-secondary" onclick="refresh()">🔄 רענן</button>
      <button class="btn btn-primary" onclick="save()">💾 שמור</button>
    </div>
  </div>

  <!-- Canvas -->
  <div class="canvas-container" id="container">
    <div class="canvas" id="canvas"></div>
  </div>

  <!-- Context Menu -->
  <div class="context-menu" id="contextMenu">
    <div class="context-menu-item" onclick="openInVSCode()">
      <span>💻</span> פתח ב-VS Code
    </div>
    <div class="context-menu-item" onclick="openInTerminal()">
      <span>⬛</span> פתח טרמינל
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item status-menu">
      <span>📊</span> שנה סטטוס
      <div class="status-submenu">
        <div class="context-menu-item" onclick="setStatus('planned')">📝 מתוכנן</div>
        <div class="context-menu-item" onclick="setStatus('in_progress')">🔄 בעבודה</div>
        <div class="context-menu-item" onclick="setStatus('done')">✅ הושלם</div>
        <div class="context-menu-item" onclick="setStatus('blocked')">⏸️ תקוע</div>
      </div>
    </div>
    <div class="context-menu-item" onclick="addNote()">
      <span>📝</span> הוסף הערה
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item danger" onclick="deleteNode()">
      <span>🗑️</span> מחק
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <!-- Keyboard hints -->
  <div class="keyboard-hint">
    <kbd>דאבל קליק</kbd> על מסך = drill down &nbsp;|&nbsp;
    <kbd>Esc</kbd> חזור &nbsp;|&nbsp;
    <kbd>Cmd</kbd>+קליק = VS Code &nbsp;|&nbsp;
    <kbd>Space</kbd>+גרירה = הזזה &nbsp;|&nbsp;
    <kbd>Cmd+S</kbd> שמירה
  </div>

  <script>
    // Map data
    let mapData = ${mapDataJson};
    const projectPath = '${escapedProjectPath}';

    // Canvas state
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let isDraggingCanvas = false;
    let isDraggingNode = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let selectedNode = null;
    let draggedNode = null;

    // Layer visibility
    const layerVisibility = {
      screen: true,
      component: true,
      feature: true,
      todo: true,
    };

    // Drill-down state
    let currentView = 'main'; // 'main' or screen id
    let drilldownNode = null;

    // Initialize
    function init() {
      renderNodes();
      setupEventListeners();
    }

    // Go back to main view
    function goBack() {
      currentView = 'main';
      drilldownNode = null;
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      renderNodes();
      updateBreadcrumb();
    }

    // Drill down into a node
    function drillDown(nodeId) {
      const node = mapData.nodes.find(n => n.id === nodeId);
      if (!node || node.layer !== 'screen') return;

      // Find the original screen data with components
      const screenData = mapData.rawScreens?.find(s => s.id === nodeId);

      currentView = nodeId;
      drilldownNode = { ...node, screenData };
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      renderDrilldownView();
      updateBreadcrumb();
    }

    // Update breadcrumb
    function updateBreadcrumb() {
      const titleEl = document.querySelector('.toolbar-title');
      if (currentView === 'main') {
        titleEl.innerHTML = '<span class="icon">🗺️</span><span>' + mapData.meta.name + '</span>';
      } else {
        titleEl.innerHTML =
          '<div class="breadcrumb">' +
            '<span class="breadcrumb-item" onclick="goBack()">🗺️ ' + mapData.meta.name + '</span>' +
            '<span class="breadcrumb-sep">›</span>' +
            '<span class="breadcrumb-item active">📱 ' + (drilldownNode?.name || '') + '</span>' +
          '</div>';
      }
    }

    // Render drilldown view
    function renderDrilldownView() {
      const canvas = document.getElementById('canvas');
      canvas.innerHTML = '';

      if (!drilldownNode) return;

      const screenData = drilldownNode.screenData || {};

      // Header with screen name
      const header = document.createElement('div');
      header.className = 'drilldown-header';
      header.style.cssText = 'left:50px;top:50px;';
      header.innerHTML =
        '<div class="title">📱 ' + drilldownNode.name + '</div>' +
        '<div class="subtitle">' + (drilldownNode.subtitle || '') + '</div>' +
        (drilldownNode.filePath ? '<div class="file-link" onclick="openFileInVSCode(\\'' + drilldownNode.filePath.replace(/'/g, "\\\\'") + '\\')">פתח ב-VS Code →</div>' : '');
      canvas.appendChild(header);

      let yOffset = 180;

      // Used components section
      const usedComponents = screenData.usedComponents || [];
      if (usedComponents.length > 0) {
        const sectionLabel = document.createElement('div');
        sectionLabel.className = 'drilldown-section';
        sectionLabel.style.cssText = 'left:50px;top:' + yOffset + 'px;';
        sectionLabel.textContent = '🧩 קומפוננטות בשימוש (' + usedComponents.length + ')';
        canvas.appendChild(sectionLabel);
        yOffset += 40;

        usedComponents.forEach((comp, i) => {
          const compNode = createDrilldownNode({
            id: 'used-comp-' + i,
            name: comp,
            layer: 'component',
            x: 50 + (i % 4) * 220,
            y: yOffset + Math.floor(i / 4) * 100,
            width: 200,
            height: 70,
            colors: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
          });
          canvas.appendChild(compNode);
        });
        yOffset += Math.ceil(usedComponents.length / 4) * 100 + 40;
      }

      // Functions in this file
      const functions = screenData.functions || [];
      if (functions.length > 0) {
        const sectionLabel = document.createElement('div');
        sectionLabel.className = 'drilldown-section';
        sectionLabel.style.cssText = 'left:50px;top:' + yOffset + 'px;';
        sectionLabel.textContent = '⚡ פונקציות (' + functions.length + ')';
        canvas.appendChild(sectionLabel);
        yOffset += 40;

        functions.forEach((func, i) => {
          const funcNode = createDrilldownNode({
            id: 'func-' + i,
            name: func,
            layer: 'feature',
            x: 50 + (i % 4) * 220,
            y: yOffset + Math.floor(i / 4) * 80,
            width: 200,
            height: 50,
            colors: { bg: '#d1fae5', border: '#10b981', text: '#059669' },
          });
          canvas.appendChild(funcNode);
        });
        yOffset += Math.ceil(functions.length / 4) * 80 + 40;
      }

      // TODOs in this file
      const todos = screenData.todos || drilldownNode.todos || [];
      if (todos.length > 0) {
        const sectionLabel = document.createElement('div');
        sectionLabel.className = 'drilldown-section';
        sectionLabel.style.cssText = 'left:50px;top:' + yOffset + 'px;';
        sectionLabel.textContent = '⚠️ TODOs (' + todos.length + ')';
        canvas.appendChild(sectionLabel);
        yOffset += 40;

        todos.forEach((todo, i) => {
          const todoText = typeof todo === 'string' ? todo : todo.text;
          const todoLine = typeof todo === 'object' ? todo.line : null;
          const todoNode = createDrilldownNode({
            id: 'todo-' + i,
            name: todoText,
            subtitle: todoLine ? 'שורה ' + todoLine : '',
            layer: 'todo',
            x: 50,
            y: yOffset + i * 70,
            width: 500,
            height: 55,
            colors: { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' },
            filePath: drilldownNode.filePath,
            line: todoLine,
          });
          canvas.appendChild(todoNode);
        });
        yOffset += todos.length * 70 + 40;
      }

      // Hooks used
      const hooks = screenData.hooks || [];
      if (hooks.length > 0) {
        const sectionLabel = document.createElement('div');
        sectionLabel.className = 'drilldown-section';
        sectionLabel.style.cssText = 'left:50px;top:' + yOffset + 'px;';
        sectionLabel.textContent = '🪝 Hooks (' + hooks.length + ')';
        canvas.appendChild(sectionLabel);
        yOffset += 40;

        hooks.forEach((hook, i) => {
          const hookNode = createDrilldownNode({
            id: 'hook-' + i,
            name: hook,
            layer: 'component',
            x: 50 + (i % 5) * 160,
            y: yOffset + Math.floor(i / 5) * 60,
            width: 140,
            height: 40,
            colors: { bg: '#fae8ff', border: '#d946ef', text: '#a21caf' },
          });
          canvas.appendChild(hookNode);
        });
      }

      updateCanvasTransform();
    }

    // Create drilldown node element
    function createDrilldownNode(node) {
      const el = document.createElement('div');
      el.className = 'node layer-' + node.layer;
      el.style.cssText =
        'left:' + node.x + 'px;' +
        'top:' + node.y + 'px;' +
        'width:' + (node.width || 200) + 'px;' +
        'height:' + (node.height || 70) + 'px;' +
        'background:' + node.colors.bg + ';' +
        'border:2px solid ' + node.colors.border + ';' +
        'display:flex;flex-direction:column;justify-content:center;padding:10px;';

      el.innerHTML =
        '<div style="color:' + node.colors.text + ';font-weight:600;font-size:0.85em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          node.name +
        '</div>' +
        (node.subtitle ? '<div style="font-size:0.7em;opacity:0.6;margin-top:4px;">' + node.subtitle + '</div>' : '');

      if (node.filePath) {
        el.ondblclick = () => openFileInVSCode(node.filePath, node.line);
        el.style.cursor = 'pointer';
      }

      return el;
    }

    // Render all nodes
    function renderNodes() {
      // If in drill-down view, use that renderer
      if (currentView !== 'main') {
        renderDrilldownView();
        return;
      }

      const canvas = document.getElementById('canvas');
      canvas.innerHTML = '';

      // Render headers
      mapData.nodes.filter(n => n.type === 'header').forEach(node => {
        if (!layerVisibility[node.layer]) return;
        const el = createHeaderElement(node);
        canvas.appendChild(el);
      });

      // Render nodes
      mapData.nodes.filter(n => n.type === 'node').forEach(node => {
        if (!layerVisibility[node.layer]) return;
        const el = createNodeElement(node);
        canvas.appendChild(el);
      });

      // Render custom nodes
      mapData.customNodes.forEach(node => {
        if (!layerVisibility[node.layer]) return;
        const el = createNodeElement(node);
        canvas.appendChild(el);
      });

      updateCanvasTransform();
    }

    // Create header element
    function createHeaderElement(node) {
      const el = document.createElement('div');
      el.className = 'section-header layer-' + node.layer;
      el.style.cssText = 'left:' + node.x + 'px;top:' + node.y + 'px;width:' + node.width + 'px;';
      el.textContent = node.name;
      return el;
    }

    // Create node element
    function createNodeElement(node) {
      const el = document.createElement('div');
      el.className = 'node layer-' + node.layer;
      el.id = node.id;
      el.style.cssText =
        'left:' + node.x + 'px;' +
        'top:' + node.y + 'px;' +
        'width:' + (node.width || 200) + 'px;' +
        'background:' + node.colors.bg + ';' +
        'border:2px solid ' + node.colors.border + ';';

      el.innerHTML =
        '<div class="node-header" style="color:' + node.colors.text + '">' +
          '<span>' + node.name + '</span>' +
          '<span class="node-menu" onclick="event.stopPropagation();showContextMenu(event,\\'' + node.id + '\\')">⋮</span>' +
        '</div>' +
        '<div class="node-body">' +
          (node.subtitle ? '<div class="node-subtitle">' + node.subtitle + '</div>' : '') +
          '<div class="node-badges">' +
            (node.todoCount ? '<span class="node-badge todo">⚠️ ' + node.todoCount + '</span>' : '') +
            '<span class="node-badge status">' + getStatusLabel(node.status) + '</span>' +
          '</div>' +
        '</div>';

      // Drag events
      el.onmousedown = (e) => startNodeDrag(e, node);

      // Double click - drill down for screens, open VS Code for others
      el.ondblclick = () => {
        if (node.layer === 'screen') {
          drillDown(node.id);
        } else if (node.filePath) {
          openFileInVSCode(node.filePath, node.line);
        }
      };

      // Add drillable indicator for screens
      if (node.layer === 'screen') {
        el.classList.add('drillable');
      }

      return el;
    }

    // Get status label
    function getStatusLabel(status) {
      const labels = {
        planned: '📝 מתוכנן',
        in_progress: '🔄 בעבודה',
        done: '✅ הושלם',
        blocked: '⏸️ תקוע',
        bug: '🐛 באג',
      };
      return labels[status] || status;
    }

    // Setup event listeners
    function setupEventListeners() {
      const container = document.getElementById('container');

      // Pan with space + drag or middle mouse
      container.onmousedown = (e) => {
        if (e.target === container || e.target.id === 'canvas') {
          if (e.button === 1 || spacePressed) {
            isDraggingCanvas = true;
            dragStartX = e.clientX - offsetX;
            dragStartY = e.clientY - offsetY;
            container.classList.add('dragging');
          }
        }
      };

      document.onmousemove = (e) => {
        if (isDraggingCanvas) {
          offsetX = e.clientX - dragStartX;
          offsetY = e.clientY - dragStartY;
          updateCanvasTransform();
        }
        if (isDraggingNode && draggedNode) {
          const x = (e.clientX - dragStartX) / scale;
          const y = (e.clientY - dragStartY) / scale;
          updateNodePosition(draggedNode.id, x, y);
        }
      };

      document.onmouseup = () => {
        isDraggingCanvas = false;
        isDraggingNode = false;
        draggedNode = null;
        container.classList.remove('dragging');
        document.querySelectorAll('.node.dragging').forEach(n => n.classList.remove('dragging'));
      };

      // Zoom with scroll
      container.onwheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(scale * delta, 0.25), 3);

        // Zoom toward cursor
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        offsetX = x - (x - offsetX) * (newScale / scale);
        offsetY = y - (y - offsetY) * (newScale / scale);
        scale = newScale;

        updateCanvasTransform();
      };

      // Keyboard
      let spacePressed = false;
      document.onkeydown = (e) => {
        if (e.code === 'Space') {
          spacePressed = true;
          container.style.cursor = 'grab';
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
          e.preventDefault();
          save();
        }
        if (e.key === 'Escape') {
          hideContextMenu();
          if (currentView !== 'main') {
            goBack();
          }
        }
        if (e.key === 'Backspace' && currentView !== 'main') {
          goBack();
        }
      };
      document.onkeyup = (e) => {
        if (e.code === 'Space') {
          spacePressed = false;
          container.style.cursor = '';
        }
      };

      // Click to deselect
      document.onclick = (e) => {
        if (!e.target.closest('.context-menu')) {
          hideContextMenu();
        }
        if (!e.target.closest('.node')) {
          deselectAll();
        }
      };

      // Prevent context menu
      container.oncontextmenu = (e) => e.preventDefault();
    }

    // Node drag
    function startNodeDrag(e, node) {
      if (e.button !== 0) return;

      // Cmd+click to open in VS Code
      if (e.metaKey || e.ctrlKey) {
        if (node.filePath) {
          openFileInVSCode(node.filePath, node.line);
        }
        return;
      }

      isDraggingNode = true;
      draggedNode = node;
      dragStartX = e.clientX - node.x * scale;
      dragStartY = e.clientY - node.y * scale;

      const el = document.getElementById(node.id);
      el.classList.add('dragging');
      selectNode(node.id);
    }

    // Update node position
    function updateNodePosition(nodeId, x, y) {
      const node = mapData.nodes.find(n => n.id === nodeId) ||
                   mapData.customNodes.find(n => n.id === nodeId);
      if (node) {
        node.x = Math.round(x);
        node.y = Math.round(y);
        const el = document.getElementById(nodeId);
        if (el) {
          el.style.left = node.x + 'px';
          el.style.top = node.y + 'px';
        }
      }
    }

    // Update canvas transform
    function updateCanvasTransform() {
      const canvas = document.getElementById('canvas');
      canvas.style.transform = 'translate(' + offsetX + 'px,' + offsetY + 'px) scale(' + scale + ')';
    }

    // Toggle layer
    function toggleLayer(layer) {
      layerVisibility[layer] = !layerVisibility[layer];
      const btn = document.querySelector('[data-layer="' + layer + '"]');
      btn.classList.toggle('active', layerVisibility[layer]);

      // Hide/show nodes
      document.querySelectorAll('.layer-' + layer).forEach(el => {
        el.classList.toggle('layer-hidden', !layerVisibility[layer]);
      });
    }

    // Context menu
    function showContextMenu(e, nodeId) {
      selectedNode = nodeId;
      selectNode(nodeId);

      const menu = document.getElementById('contextMenu');
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      menu.classList.add('show');
    }

    function hideContextMenu() {
      document.getElementById('contextMenu').classList.remove('show');
    }

    // Selection
    function selectNode(nodeId) {
      deselectAll();
      const el = document.getElementById(nodeId);
      if (el) el.classList.add('selected');
      selectedNode = nodeId;
    }

    function deselectAll() {
      document.querySelectorAll('.node.selected').forEach(n => n.classList.remove('selected'));
      selectedNode = null;
    }

    // Actions
    function openInVSCode() {
      const node = findNode(selectedNode);
      if (node && node.filePath) {
        openFileInVSCode(node.filePath, node.line);
      }
      hideContextMenu();
    }

    function openFileInVSCode(filePath, line) {
      const lineArg = line ? ':' + line : '';
      // Using URL scheme for VS Code
      window.location.href = 'vscode://file' + filePath + lineArg;
      showToast('פותח ב-VS Code...');
    }

    function openInTerminal() {
      const node = findNode(selectedNode);
      if (node && node.filePath) {
        const dir = node.filePath.substring(0, node.filePath.lastIndexOf('/'));
        // This won't work directly from browser, but we show the intent
        showToast('פתח טרמינל ב: ' + dir);
      }
      hideContextMenu();
    }

    function setStatus(status) {
      const node = findNode(selectedNode);
      if (node) {
        node.status = status;
        renderNodes();
        showToast('סטטוס עודכן: ' + getStatusLabel(status));
      }
      hideContextMenu();
    }

    function addNote() {
      const note = prompt('הערה:');
      if (note) {
        const node = findNode(selectedNode);
        if (node) {
          node.notes = (node.notes || '') + '\\n' + note;
          showToast('הערה נוספה');
        }
      }
      hideContextMenu();
    }

    function deleteNode() {
      if (selectedNode && selectedNode.startsWith('custom-')) {
        mapData.customNodes = mapData.customNodes.filter(n => n.id !== selectedNode);
        renderNodes();
        showToast('נמחק');
      } else {
        showToast('לא ניתן למחוק - רק בלוקים ידניים');
      }
      hideContextMenu();
    }

    function findNode(nodeId) {
      return mapData.nodes.find(n => n.id === nodeId) ||
             mapData.customNodes.find(n => n.id === nodeId);
    }

    // Add new node
    function addNode() {
      const name = prompt('שם הבלוק:');
      if (!name) return;

      const id = 'custom-' + Date.now();
      mapData.customNodes.push({
        id,
        type: 'custom',
        layer: 'feature',
        name,
        subtitle: '',
        x: (-offsetX + 400) / scale,
        y: (-offsetY + 300) / scale,
        width: 200,
        height: 100,
        status: 'planned',
        colors: { bg: '#d1fae5', border: '#10b981', text: '#059669' },
      });

      renderNodes();
      showToast('בלוק נוסף');
    }

    // Refresh
    function refresh() {
      showToast('מרענן...');
      location.reload();
    }

    // Save
    function save() {
      // Save to localStorage for now
      localStorage.setItem('projectMap_' + projectPath, JSON.stringify(mapData));
      showToast('✅ נשמר!');
    }

    // Toast
    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // Init on load
    init();
  </script>
</body>
</html>`;
}

module.exports = { generateInteractiveMap };
