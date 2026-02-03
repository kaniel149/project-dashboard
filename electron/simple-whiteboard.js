const fs = require('fs').promises;
const path = require('path');

async function getOrCreateProjectMap(projectPath, projectData) {
  const mapPath = path.join(projectPath, 'project-map.json');
  const projectName = path.basename(projectPath);

  let mapData;
  try {
    const content = await fs.readFile(mapPath, 'utf-8');
    mapData = JSON.parse(content);
    return { mapPath, data: mapData, isNew: false };
  } catch (e) {
    // Create default map
    mapData = {
      version: 1,
      name: projectName,
      createdAt: new Date().toISOString(),
      nodes: [
        { id: '1', type: 'section', x: 50, y: 50, w: 250, h: 180, title: 'יעדים', color: '#228be6', items: [] },
        { id: '2', type: 'section', x: 320, y: 50, w: 250, h: 180, title: 'משימות', color: '#f59f00', items: projectData?.remainingTasks?.slice(0, 5) || [] },
        { id: '3', type: 'section', x: 590, y: 50, w: 250, h: 180, title: 'רעיונות', color: '#be4bdb', items: [] },
        { id: '4', type: 'section', x: 50, y: 260, w: 250, h: 180, title: 'הערות', color: '#2f9e44', items: [] },
        { id: '5', type: 'section', x: 320, y: 260, w: 250, h: 180, title: 'חסימות', color: '#e03131', items: [] },
        { id: '6', type: 'section', x: 590, y: 260, w: 250, h: 180, title: 'הושלם', color: '#868e96', items: projectData?.completedTasks?.slice(0, 5) || [] },
      ],
      notes: [],
    };
    await fs.writeFile(mapPath, JSON.stringify(mapData, null, 2));
    return { mapPath, data: mapData, isNew: true };
  }
}

async function generateWhiteboardHtml(projectPath, projectData) {
  const { mapPath, data: mapData, isNew } = await getOrCreateProjectMap(projectPath, projectData);
  const projectName = path.basename(projectPath);
  const htmlPath = path.join(projectPath, 'project-map.html');

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - מפת פרויקט</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e; color: white; overflow: hidden;
    }
    .toolbar {
      position: fixed; top: 0; left: 0; right: 0; height: 50px; z-index: 100;
      background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .toolbar-title { display: flex; align-items: center; gap: 10px; font-weight: 600; }
    .toolbar-actions { display: flex; gap: 8px; }
    .btn {
      padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
      font-size: 13px; font-weight: 500; transition: all 0.2s; font-family: inherit;
    }
    .btn-primary { background: #228be6; color: white; }
    .btn-primary:hover { background: #1c7ed6; transform: translateY(-1px); }
    .btn-secondary { background: rgba(255,255,255,0.1); color: white; }
    .btn-secondary:hover { background: rgba(255,255,255,0.2); }

    #canvas {
      position: fixed; top: 50px; left: 0; right: 0; bottom: 0;
      background: #0d1117; overflow: auto;
    }
    .board {
      position: relative; min-width: 2000px; min-height: 1500px;
      background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    .card {
      position: absolute; border-radius: 12px; cursor: move;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: box-shadow 0.2s;
      user-select: none;
    }
    .card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
    .card.dragging { opacity: 0.8; z-index: 1000; }
    .card-header {
      padding: 12px 15px; font-weight: 600; font-size: 14px;
      border-radius: 12px 12px 0 0; display: flex; justify-content: space-between;
    }
    .card-body {
      padding: 10px 15px; background: rgba(0,0,0,0.3); border-radius: 0 0 12px 12px;
      min-height: 100px; font-size: 13px;
    }
    .card-item {
      padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; gap: 8px;
    }
    .card-item:last-child { border-bottom: none; }
    .card-item input[type="checkbox"] { accent-color: currentColor; }
    .add-item {
      margin-top: 8px; padding: 6px; border: 1px dashed rgba(255,255,255,0.2);
      border-radius: 6px; text-align: center; cursor: pointer; font-size: 12px;
      color: rgba(255,255,255,0.5); transition: all 0.2s;
    }
    .add-item:hover { border-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.8); }

    .note {
      position: absolute; width: 200px; min-height: 150px;
      background: #fff8dc; border-radius: 4px; padding: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2); cursor: move; color: #333;
    }
    .note textarea {
      width: 100%; height: 100%; border: none; background: transparent;
      font-size: 13px; resize: none; font-family: inherit; color: #333;
    }
    .note .delete-note {
      position: absolute; top: 5px; left: 5px; width: 20px; height: 20px;
      border: none; background: #e03131; color: white; border-radius: 50%;
      cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.2s;
    }
    .note:hover .delete-note { opacity: 1; }

    .status {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      padding: 10px 20px; background: rgba(0,0,0,0.8); border-radius: 8px;
      font-size: 13px; opacity: 0; transition: opacity 0.3s; z-index: 1000;
    }
    .status.show { opacity: 1; }

    .context-menu {
      position: fixed; background: #2d2d2d; border-radius: 8px;
      padding: 8px 0; min-width: 150px; z-index: 1000;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5); display: none;
    }
    .context-menu.show { display: block; }
    .context-menu-item {
      padding: 8px 15px; cursor: pointer; font-size: 13px;
      display: flex; align-items: center; gap: 10px;
    }
    .context-menu-item:hover { background: rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      <span style="font-size: 20px;">🗺️</span>
      <span>${projectName}</span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-secondary" onclick="addNote()">📝 הערה</button>
      <button class="btn btn-secondary" onclick="addSection()">➕ קטגוריה</button>
      <button class="btn btn-primary" onclick="saveBoard()">💾 שמור</button>
    </div>
  </div>

  <div id="canvas">
    <div class="board" id="board"></div>
  </div>

  <div class="status" id="status"></div>

  <div class="context-menu" id="contextMenu">
    <div class="context-menu-item" onclick="deleteSelected()">🗑️ מחק</div>
    <div class="context-menu-item" onclick="duplicateSelected()">📋 שכפל</div>
  </div>

  <script>
    const projectPath = "${projectPath.replace(/\\/g, '/')}";
    let boardData = ${JSON.stringify(mapData)};
    let selectedElement = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    function showStatus(msg) {
      const el = document.getElementById('status');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2000);
    }

    function renderBoard() {
      const board = document.getElementById('board');
      board.innerHTML = '';

      // Render sections (cards)
      boardData.nodes.forEach(node => {
        if (node.type === 'section') {
          const card = document.createElement('div');
          card.className = 'card';
          card.id = 'node-' + node.id;
          card.style.cssText = 'left:' + node.x + 'px;top:' + node.y + 'px;width:' + node.w + 'px;';
          card.innerHTML =
            '<div class="card-header" style="background:' + node.color + '">' +
              '<span>' + node.title + '</span>' +
              '<span style="cursor:pointer" onclick="editSectionTitle(\\'' + node.id + '\\')">\u270f\ufe0f</span>' +
            '</div>' +
            '<div class="card-body">' +
              (node.items || []).map((item, i) =>
                '<div class="card-item">' +
                  '<input type="checkbox" onchange="toggleItem(\\'' + node.id + '\\',' + i + ')">' +
                  '<span>' + item + '</span>' +
                '</div>'
              ).join('') +
              '<div class="add-item" onclick="addItemToSection(\\'' + node.id + '\\')">+ הוסף פריט</div>' +
            '</div>';
          makeDraggable(card, node);
          board.appendChild(card);
        }
      });

      // Render notes
      (boardData.notes || []).forEach((note, i) => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
        noteEl.id = 'note-' + i;
        noteEl.style.cssText = 'left:' + note.x + 'px;top:' + note.y + 'px;';
        noteEl.innerHTML =
          '<button class="delete-note" onclick="deleteNote(' + i + ')">×</button>' +
          '<textarea oninput="updateNote(' + i + ', this.value)">' + (note.text || '') + '</textarea>';
        makeDraggable(noteEl, note);
        board.appendChild(noteEl);
      });
    }

    function makeDraggable(el, data) {
      el.onmousedown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
        isDragging = true;
        selectedElement = { el, data };
        el.classList.add('dragging');
        dragOffset.x = e.clientX - el.offsetLeft;
        dragOffset.y = e.clientY - el.offsetTop;
      };
    }

    document.onmousemove = (e) => {
      if (!isDragging || !selectedElement) return;
      const x = e.clientX - dragOffset.x + document.getElementById('canvas').scrollLeft;
      const y = e.clientY - dragOffset.y + document.getElementById('canvas').scrollTop - 50;
      selectedElement.el.style.left = x + 'px';
      selectedElement.el.style.top = y + 'px';
      selectedElement.data.x = x;
      selectedElement.data.y = y;
    };

    document.onmouseup = () => {
      if (selectedElement) {
        selectedElement.el.classList.remove('dragging');
      }
      isDragging = false;
      selectedElement = null;
    };

    function addNote() {
      const canvas = document.getElementById('canvas');
      boardData.notes = boardData.notes || [];
      boardData.notes.push({
        x: canvas.scrollLeft + 100 + Math.random() * 200,
        y: canvas.scrollTop + 100 + Math.random() * 100,
        text: ''
      });
      renderBoard();
      showStatus('📝 הערה נוספה');
    }

    function deleteNote(i) {
      boardData.notes.splice(i, 1);
      renderBoard();
      showStatus('🗑️ הערה נמחקה');
    }

    function updateNote(i, text) {
      boardData.notes[i].text = text;
    }

    function addSection() {
      const canvas = document.getElementById('canvas');
      const id = 'section-' + Date.now();
      boardData.nodes.push({
        id,
        type: 'section',
        x: canvas.scrollLeft + 100 + Math.random() * 200,
        y: canvas.scrollTop + 100,
        w: 250,
        h: 180,
        title: 'קטגוריה חדשה',
        color: ['#228be6', '#2f9e44', '#f59f00', '#be4bdb', '#e03131'][Math.floor(Math.random() * 5)],
        items: []
      });
      renderBoard();
      showStatus('➕ קטגוריה נוספה');
    }

    function editSectionTitle(id) {
      const node = boardData.nodes.find(n => n.id === id);
      const newTitle = prompt('שם קטגוריה:', node.title);
      if (newTitle) {
        node.title = newTitle;
        renderBoard();
      }
    }

    function addItemToSection(id) {
      const node = boardData.nodes.find(n => n.id === id);
      const item = prompt('פריט חדש:');
      if (item) {
        node.items = node.items || [];
        node.items.push(item);
        renderBoard();
        showStatus('✅ פריט נוסף');
      }
    }

    function toggleItem(id, i) {
      // Could mark as done
    }

    async function saveBoard() {
      showStatus('💾 שומר...');
      boardData.updatedAt = new Date().toISOString();
      localStorage.setItem('board_' + projectPath, JSON.stringify(boardData));

      // Also try to save to file via fetch to a local endpoint (won't work without server)
      // For now just save to localStorage
      showStatus('✅ נשמר!');
    }

    // Context menu
    document.oncontextmenu = (e) => {
      e.preventDefault();
      const menu = document.getElementById('contextMenu');
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      menu.classList.add('show');
    };

    document.onclick = () => {
      document.getElementById('contextMenu').classList.remove('show');
    };

    // Keyboard shortcuts
    document.onkeydown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveBoard();
      }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        addNote();
      }
    };

    // Load saved data
    const saved = localStorage.getItem('board_' + projectPath);
    if (saved) {
      try {
        boardData = JSON.parse(saved);
      } catch (e) {}
    }

    // Initial render
    renderBoard();
  </script>
</body>
</html>`;

  await fs.writeFile(htmlPath, html);
  return { htmlPath, mapPath, isNew };
}

module.exports = { getOrCreateProjectMap, generateWhiteboardHtml };
