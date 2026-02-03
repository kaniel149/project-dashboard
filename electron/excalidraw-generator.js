const fs = require('fs').promises;
const path = require('path');

// Generate unique ID for Excalidraw elements
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Status colors
const STATUS_COLORS = {
  active: { bg: '#a5d8ff', stroke: '#1c7ed6' },
  stable: { bg: '#b2f2bb', stroke: '#2f9e44' },
  warning: { bg: '#ffec99', stroke: '#f59f00' },
  urgent: { bg: '#ffc9c9', stroke: '#e03131' },
  archived: { bg: '#e9ecef', stroke: '#868e96' },
};

const CATEGORY_COLORS = {
  'business-projects': '#228be6',
  'personal-projects': '#be4bdb',
  default: '#495057',
};

function getProjectStatus(project) {
  if (project.uncommittedChanges > 5) return 'urgent';
  if (project.uncommittedChanges > 0) return 'warning';
  if (project.remainingTasks?.length > 5) return 'warning';
  if (!project.lastCommit) return 'archived';
  const lastActivity = new Date(project.lastActivity);
  const daysSinceActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
  if (daysSinceActivity > 30) return 'archived';
  return 'active';
}

function getStatusInfo(project) {
  if (project.uncommittedChanges > 5) return { bg: '#ffc9c9', border: '#e03131', text: 'דחוף' };
  if (project.uncommittedChanges > 0) return { bg: '#ffec99', border: '#f59f00', text: 'שינויים' };
  if (project.remainingTasks?.length > 5) return { bg: '#ffec99', border: '#f59f00', text: 'משימות' };
  return { bg: '#b2f2bb', border: '#2f9e44', text: 'מעודכן' };
}

// Generate standalone HTML viewer
async function generateHtmlViewer(projects, outputPath) {
  const htmlPath = outputPath.replace('.excalidraw', '.html');

  const categories = { 'business-projects': [], 'personal-projects': [], 'root': [] };
  projects.forEach(p => {
    const cat = p.category || 'root';
    (categories[cat] || categories.root).push(p);
  });

  const categoryNames = {
    'business-projects': '💼 פרויקטים עסקיים',
    'personal-projects': '👤 פרויקטים אישיים',
    'root': '📁 פרויקטים'
  };

  const categoryColorsMap = {
    'business-projects': '#228be6',
    'personal-projects': '#be4bdb',
    'root': '#495057'
  };

  let cardsHtml = '';
  Object.entries(categories).forEach(([cat, projs]) => {
    if (projs.length === 0) return;

    cardsHtml += '<div class="category">';
    cardsHtml += '<h2 style="color: ' + categoryColorsMap[cat] + '">' + categoryNames[cat] + ' (' + projs.length + ')</h2>';
    cardsHtml += '<div class="projects">';

    projs.forEach(p => {
      const status = getStatusInfo(p);
      let statusText = '✅ מעודכן';
      if (p.uncommittedChanges > 0) {
        statusText = '⚠️ ' + p.uncommittedChanges + ' שינויים';
      } else if (p.remainingTasks?.length > 0) {
        statusText = '📝 ' + p.remainingTasks.length + ' משימות';
      }

      cardsHtml += '<div class="card" style="border-color: ' + status.border + '; background: ' + status.bg + '20">';
      cardsHtml += '<div class="card-header">';
      cardsHtml += '<span class="name">' + p.name + '</span>';
      cardsHtml += '<span class="branch">📌 ' + p.branch + '</span>';
      cardsHtml += '</div>';
      cardsHtml += '<div class="card-status" style="color: ' + status.border + '">' + statusText + '</div>';
      if (p.summary) {
        cardsHtml += '<div class="summary">' + p.summary.substring(0, 100) + '...</div>';
      }
      cardsHtml += '</div>';
    });

    cardsHtml += '</div></div>';
  });

  const timestamp = new Date().toLocaleString('he-IL');

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🗺️ Project Map - מפת פרויקטים</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white; min-height: 100vh; padding: 40px;
    }
    h1 { text-align: center; margin-bottom: 40px; font-size: 2.5em;
         background: linear-gradient(90deg, #a5d8ff, #be4bdb);
         -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .category { margin-bottom: 40px; }
    .category h2 { margin-bottom: 20px; font-size: 1.4em; }
    .projects { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .card {
      background: rgba(255,255,255,0.05); border: 2px solid; border-radius: 16px;
      padding: 20px; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer;
    }
    .card:hover { transform: translateY(-4px); box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .name { font-weight: 600; font-size: 1.1em; }
    .branch { font-size: 0.8em; color: rgba(255,255,255,0.5); font-family: monospace; }
    .card-status { font-size: 0.9em; font-weight: 500; margin-bottom: 8px; }
    .summary { font-size: 0.85em; color: rgba(255,255,255,0.6); line-height: 1.4; }
    .legend { display: flex; gap: 20px; justify-content: center; margin-top: 40px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.9em; }
    .legend-color { width: 20px; height: 20px; border-radius: 6px; border: 2px solid; }
    .footer { text-align: center; margin-top: 40px; color: rgba(255,255,255,0.4); font-size: 0.85em; }
    .stats { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; }
    .stat { text-align: center; }
    .stat-value { font-size: 2em; font-weight: 700; color: #a5d8ff; }
    .stat-label { font-size: 0.9em; color: rgba(255,255,255,0.6); }
  </style>
</head>
<body>
  <h1>🗺️ מפת פרויקטים</h1>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${projects.length}</div>
      <div class="stat-label">פרויקטים</div>
    </div>
    <div class="stat">
      <div class="stat-value">${projects.filter(p => p.uncommittedChanges > 0).length}</div>
      <div class="stat-label">עם שינויים</div>
    </div>
    <div class="stat">
      <div class="stat-value">${projects.reduce((sum, p) => sum + (p.remainingTasks?.length || 0), 0)}</div>
      <div class="stat-label">משימות פתוחות</div>
    </div>
  </div>

  ${cardsHtml}

  <div class="legend">
    <div class="legend-item"><div class="legend-color" style="background:#b2f2bb20;border-color:#2f9e44"></div>מעודכן</div>
    <div class="legend-item"><div class="legend-color" style="background:#ffec9920;border-color:#f59f00"></div>צריך תשומת לב</div>
    <div class="legend-item"><div class="legend-color" style="background:#ffc9c920;border-color:#e03131"></div>דחוף</div>
  </div>

  <div class="footer">נוצר אוטומטית ב-${timestamp} | Project Dashboard</div>
</body>
</html>`;

  await fs.writeFile(htmlPath, html);
  return htmlPath;
}

function createRectangle(id, x, y, width, height, colors, text, fontSize = 16) {
  return {
    id, type: 'rectangle', x, y, width, height, angle: 0,
    strokeColor: colors.stroke, backgroundColor: colors.bg,
    fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'solid', roughness: 1,
    opacity: 100, groupIds: [], frameId: null, roundness: { type: 3 },
    seed: Math.floor(Math.random() * 100000), version: 1,
    versionNonce: Math.floor(Math.random() * 100000), isDeleted: false,
    boundElements: [], updated: Date.now(), link: null, locked: false,
  };
}

function createText(id, x, y, text, fontSize = 16, color = '#1e1e1e') {
  return {
    id, type: 'text', x, y, width: text.length * fontSize * 0.6,
    height: fontSize * 1.4, angle: 0, strokeColor: color,
    backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1,
    strokeStyle: 'solid', roughness: 1, opacity: 100, groupIds: [],
    frameId: null, roundness: null, seed: Math.floor(Math.random() * 100000),
    version: 1, versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false, boundElements: null, updated: Date.now(),
    link: null, locked: false, text, fontSize, fontFamily: 1,
    textAlign: 'center', verticalAlign: 'middle', baseline: fontSize,
    containerId: null, originalText: text, lineHeight: 1.25,
  };
}

async function generateProjectMap(projects, outputPath) {
  const elements = [];
  const categories = { 'business-projects': [], 'personal-projects': [], 'root': [] };

  projects.forEach(project => {
    const cat = project.category || 'root';
    if (categories[cat]) categories[cat].push(project);
    else categories.root.push(project);
  });

  const cardWidth = 200, cardHeight = 80, cardSpacingX = 50, cardSpacingY = 30;
  const categorySpacingY = 150, startX = 100;
  let currentY = 100;

  const titleId = generateId();
  elements.push(createText(titleId, startX, 30, '🗺️ Project Map - מפת פרויקטים', 28, '#1e1e1e'));

  const categoryNames = {
    'business-projects': '💼 פרויקטים עסקיים',
    'personal-projects': '👤 פרויקטים אישיים',
    'root': '📁 פרויקטים',
  };

  Object.entries(categories).forEach(([category, categoryProjects]) => {
    if (categoryProjects.length === 0) return;

    const headerId = generateId();
    elements.push(createText(headerId, startX, currentY, categoryNames[category] || category, 20,
      CATEGORY_COLORS[category] || CATEGORY_COLORS.default));
    currentY += 40;

    const cols = 3;
    categoryProjects.forEach((project, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + cardSpacingX);
      const y = currentY + row * (cardHeight + cardSpacingY);
      const status = getProjectStatus(project);
      const colors = STATUS_COLORS[status];

      elements.push(createRectangle(generateId(), x, y, cardWidth, cardHeight, colors));
      elements.push(createText(generateId(), x + 10, y + 10, project.name, 14, colors.stroke));
      elements.push(createText(generateId(), x + 10, y + 35, '📌 ' + project.branch, 11, '#666666'));

      const statusText = project.uncommittedChanges > 0
        ? '⚠️ ' + project.uncommittedChanges + ' changes'
        : project.remainingTasks?.length > 0
          ? '📝 ' + project.remainingTasks.length + ' tasks' : '✅ Up to date';
      elements.push(createText(generateId(), x + 10, y + 55, statusText, 10, '#888888'));
    });

    const rowCount = Math.ceil(categoryProjects.length / cols);
    currentY += rowCount * (cardHeight + cardSpacingY) + categorySpacingY;
  });

  const excalidrawData = {
    type: 'excalidraw', version: 2, source: 'project-dashboard',
    elements, appState: { gridSize: null, viewBackgroundColor: '#ffffff' }, files: {},
  };

  await fs.writeFile(outputPath, JSON.stringify(excalidrawData, null, 2));
  const htmlPath = await generateHtmlViewer(projects, outputPath);

  return { excalidrawPath: outputPath, htmlPath };
}

module.exports = { generateProjectMap, generateHtmlViewer };
