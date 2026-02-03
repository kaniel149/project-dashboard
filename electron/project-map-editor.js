const fs = require('fs').promises;
const path = require('path');

// Create a complete Excalidraw element with all required fields
function createElement(type, props) {
  const base = {
    id: props.id || Math.random().toString(36).substr(2, 9),
    type,
    x: props.x || 0,
    y: props.y || 0,
    width: props.width || 100,
    height: props.height || 100,
    angle: 0,
    strokeColor: props.strokeColor || '#1e1e1e',
    backgroundColor: props.backgroundColor || 'transparent',
    fillStyle: props.fillStyle || 'solid',
    strokeWidth: props.strokeWidth || 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: props.roundness || null,
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  };

  if (type === 'text') {
    return {
      ...base,
      text: props.text || '',
      fontSize: props.fontSize || 16,
      fontFamily: 1,
      textAlign: 'left',
      verticalAlign: 'top',
      baseline: props.fontSize || 16,
      containerId: null,
      originalText: props.text || '',
      lineHeight: 1.25,
    };
  }

  if (type === 'rectangle') {
    return {
      ...base,
      roundness: { type: 3 },
    };
  }

  return base;
}

// Default project map template
function createDefaultProjectMap(projectName, projectData) {
  const elements = [];

  // Title
  elements.push(createElement('text', {
    id: 'title',
    x: 350,
    y: 30,
    text: projectName,
    fontSize: 28,
    strokeColor: '#1e1e1e',
  }));

  // Main sections
  const sections = [
    { id: 'goals', title: 'יעדים', x: 50, y: 100, color: '#228be6' },
    { id: 'tasks', title: 'משימות', x: 350, y: 100, color: '#f59f00' },
    { id: 'ideas', title: 'רעיונות', x: 650, y: 100, color: '#be4bdb' },
    { id: 'notes', title: 'הערות', x: 50, y: 350, color: '#2f9e44' },
    { id: 'blockers', title: 'חסימות', x: 350, y: 350, color: '#e03131' },
    { id: 'done', title: 'הושלם', x: 650, y: 350, color: '#868e96' },
  ];

  sections.forEach(section => {
    // Box
    elements.push(createElement('rectangle', {
      id: section.id + '-box',
      x: section.x,
      y: section.y,
      width: 250,
      height: 200,
      strokeColor: section.color,
      backgroundColor: section.color + '20',
    }));

    // Title
    elements.push(createElement('text', {
      id: section.id + '-title',
      x: section.x + 80,
      y: section.y + 10,
      text: section.title,
      fontSize: 18,
      strokeColor: section.color,
    }));
  });

  return {
    type: 'excalidraw',
    version: 2,
    source: 'project-dashboard',
    elements,
    appState: {
      viewBackgroundColor: '#f8f9fa',
      gridSize: null,
    },
    files: {},
  };
}

async function getOrCreateProjectMap(projectPath, projectData) {
  const mapPath = path.join(projectPath, 'project-map.excalidraw');

  try {
    const content = await fs.readFile(mapPath, 'utf-8');
    return { path: mapPath, data: JSON.parse(content), isNew: false };
  } catch (e) {
    // Create new map
    const projectName = path.basename(projectPath);
    const mapData = createDefaultProjectMap(projectName, projectData);
    await fs.writeFile(mapPath, JSON.stringify(mapData, null, 2));
    return { path: mapPath, data: mapData, isNew: true };
  }
}

async function saveProjectMap(projectPath, mapData) {
  const mapPath = path.join(projectPath, 'project-map.excalidraw');
  await fs.writeFile(mapPath, JSON.stringify(mapData, null, 2));
  return mapPath;
}

// Generate interactive HTML editor for a project map
async function generateMapEditor(projectPath, projectData) {
  const { path: mapPath, data: mapData, isNew } = await getOrCreateProjectMap(projectPath, projectData);
  const projectName = path.basename(projectPath);
  const editorPath = path.join(projectPath, 'project-map-editor.html');

  const mapDataJson = JSON.stringify(mapData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🗺️ ${projectName} - Map Editor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow: hidden; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }

    .toolbar {
      position: fixed; top: 0; left: 0; right: 0; height: 50px; z-index: 1000;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .toolbar-title { font-weight: 600; font-size: 1.1em; display: flex; align-items: center; gap: 10px; }
    .toolbar-actions { display: flex; gap: 10px; }
    .btn {
      padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
      font-size: 0.9em; font-weight: 500; transition: all 0.2s;
    }
    .btn-primary { background: #228be6; color: white; }
    .btn-primary:hover { background: #1c7ed6; }
    .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
    .btn-secondary:hover { background: rgba(255,255,255,0.2); }
    .btn-success { background: #2f9e44; color: white; }
    .btn-success:hover { background: #27a844; }

    .canvas-container {
      position: fixed; top: 50px; left: 0; right: 0; bottom: 0;
      background: #f8f9fa;
    }

    .sidebar {
      position: fixed; right: 0; top: 50px; bottom: 0; width: 280px;
      background: white; border-left: 1px solid #dee2e6; padding: 20px;
      overflow-y: auto; transform: translateX(100%); transition: transform 0.3s;
      z-index: 999;
    }
    .sidebar.open { transform: translateX(0); }
    .sidebar h3 { margin-bottom: 15px; color: #1a1a2e; }
    .template-btn {
      width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px;
      border: 2px solid #dee2e6; background: white; cursor: pointer;
      text-align: right; transition: all 0.2s;
    }
    .template-btn:hover { border-color: #228be6; background: #f0f7ff; }

    .status { position: fixed; bottom: 20px; left: 20px; padding: 10px 20px;
      background: rgba(0,0,0,0.8); color: white; border-radius: 8px;
      font-size: 0.85em; opacity: 0; transition: opacity 0.3s; }
    .status.show { opacity: 1; }

    /* Excalidraw container */
    .excalidraw-wrapper { width: 100%; height: 100%; }
    .excalidraw { width: 100% !important; height: 100% !important; }
    .excalidraw .App-menu_top { display: none !important; }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      <span>🗺️</span>
      <span>${projectName}</span>
      <span style="font-size: 0.8em; opacity: 0.7;">מפת פרויקט</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-secondary" onclick="toggleSidebar()">📦 תבניות</button>
      <button class="btn btn-secondary" onclick="exportMap()">📤 ייצוא</button>
      <button class="btn btn-success" onclick="saveMap()">💾 שמור</button>
    </div>
  </div>

  <div class="canvas-container" id="canvas"></div>

  <div class="sidebar" id="sidebar">
    <h3>📦 תבניות מהירות</h3>
    <button class="template-btn" onclick="addTemplate('task')">📝 משימה חדשה</button>
    <button class="template-btn" onclick="addTemplate('idea')">💡 רעיון</button>
    <button class="template-btn" onclick="addTemplate('note')">📌 הערה</button>
    <button class="template-btn" onclick="addTemplate('blocker')">🚧 חסימה</button>
    <button class="template-btn" onclick="addTemplate('milestone')">🏆 אבן דרך</button>
    <button class="template-btn" onclick="addTemplate('arrow')">➡️ חץ חיבור</button>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
    <h3>🎨 צבעים</h3>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button onclick="setColor('#228be6')" style="width:30px;height:30px;background:#228be6;border:none;border-radius:6px;cursor:pointer;"></button>
      <button onclick="setColor('#2f9e44')" style="width:30px;height:30px;background:#2f9e44;border:none;border-radius:6px;cursor:pointer;"></button>
      <button onclick="setColor('#f59f00')" style="width:30px;height:30px;background:#f59f00;border:none;border-radius:6px;cursor:pointer;"></button>
      <button onclick="setColor('#e03131')" style="width:30px;height:30px;background:#e03131;border:none;border-radius:6px;cursor:pointer;"></button>
      <button onclick="setColor('#be4bdb')" style="width:30px;height:30px;background:#be4bdb;border:none;border-radius:6px;cursor:pointer;"></button>
      <button onclick="setColor('#495057')" style="width:30px;height:30px;background:#495057;border:none;border-radius:6px;cursor:pointer;"></button>
    </div>
  </div>

  <div class="status" id="status"></div>

  <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>

  <script>
    const projectPath = "${projectPath.replace(/\\/g, '/')}";
    const initialData = ${mapDataJson};
    let excalidrawAPI = null;

    function showStatus(msg) {
      const el = document.getElementById('status');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2000);
    }

    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
    }

    async function saveMap() {
      showStatus('💾 שומר...');
      // Save to localStorage for now
      const data = { ...initialData, savedAt: new Date().toISOString() };
      localStorage.setItem('map_' + projectPath, JSON.stringify(data));
      showStatus('✅ נשמר!');
    }

    function exportMap() {
      showStatus('📤 מייצא...');
      // Export current view as JSON
      const data = JSON.stringify(initialData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '${projectName}-map.excalidraw';
      a.click();
      showStatus('✅ יוצא!');
    }

    function addTemplate(type) {
      showStatus('הוסף ' + type + ' - גרור מהסרגל');
      toggleSidebar();
    }

    function setColor(color) {
      showStatus('צבע: ' + color);
    }

    // Load Excalidraw dynamically
    async function loadExcalidraw() {
      try {
        // Import Excalidraw from esm.sh (works better for modules)
        const script = document.createElement('script');
        script.type = 'module';
        // Using string concatenation to avoid nested template literal issues
        const moduleCode = [
          "import { Excalidraw } from 'https://esm.sh/@excalidraw/excalidraw@0.17.0?bundle';",
          "",
          "const mapInitialData = " + JSON.stringify(initialData) + ";",
          "",
          "const App = () => {",
          "  const [excalidrawAPI, setExcalidrawAPI] = React.useState(null);",
          "",
          "  return React.createElement(",
          "    'div',",
          "    { style: { width: '100%', height: '100%' } },",
          "    React.createElement(Excalidraw, {",
          "      initialData: {",
          "        elements: mapInitialData.elements || [],",
          "        appState: { viewBackgroundColor: '#f8f9fa' }",
          "      },",
          "      excalidrawAPI: (api) => setExcalidrawAPI(api),",
          "    })",
          "  );",
          "};",
          "",
          "const container = document.getElementById('canvas');",
          "ReactDOM.createRoot(container).render(React.createElement(App));"
        ].join('\\n');
        script.textContent = moduleCode;
        document.body.appendChild(script);
      } catch (err) {
        console.error('Failed to load Excalidraw:', err);
        document.getElementById('canvas').innerHTML = '<div style="color:red;padding:20px;">שגיאה בטעינה: ' + err.message + '</div>';
      }
    }

    window.onload = loadExcalidraw;

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveMap();
      }
    });
  </script>
</body>
</html>`;

  await fs.writeFile(editorPath, html);
  return { editorPath, mapPath, isNew };
}

module.exports = { getOrCreateProjectMap, saveProjectMap, generateMapEditor };
