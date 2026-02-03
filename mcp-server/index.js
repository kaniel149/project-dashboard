#!/usr/bin/env node
/**
 * Project Dashboard MCP Server
 *
 * Allows Claude to report its status to the dashboard
 * Status is stored in ~/.project-dashboard/status.json
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Status file location
const STATUS_DIR = path.join(process.env.HOME, '.project-dashboard');
const STATUS_FILE = path.join(STATUS_DIR, 'status.json');

// Ensure directory exists
if (!fs.existsSync(STATUS_DIR)) {
  fs.mkdirSync(STATUS_DIR, { recursive: true });
}

// Initialize status file if needed
if (!fs.existsSync(STATUS_FILE)) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify({ projects: {} }, null, 2));
}

/**
 * Read current status
 */
function readStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
  } catch (e) {
    return { projects: {} };
  }
}

/**
 * Write status
 */
function writeStatus(status) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}

/**
 * Update project status
 */
function updateProjectStatus(projectPath, statusData) {
  const status = readStatus();
  const projectName = path.basename(projectPath);

  status.projects[projectPath] = {
    name: projectName,
    path: projectPath,
    status: statusData.status || 'idle',
    message: statusData.message || '',
    task: statusData.task || '',
    progress: statusData.progress || null,
    updatedAt: new Date().toISOString(),
  };

  writeStatus(status);
  return status.projects[projectPath];
}

/**
 * Clear project status (when Claude exits)
 */
function clearProjectStatus(projectPath) {
  const status = readStatus();
  if (status.projects[projectPath]) {
    status.projects[projectPath].status = 'idle';
    status.projects[projectPath].message = '';
    status.projects[projectPath].task = '';
    status.projects[projectPath].updatedAt = new Date().toISOString();
  }
  writeStatus(status);
}

/**
 * Get all statuses
 */
function getAllStatuses() {
  return readStatus().projects;
}

// MCP Protocol Implementation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function sendResponse(id, result) {
  const response = {
    jsonrpc: '2.0',
    id,
    result,
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message) {
  const response = {
    jsonrpc: '2.0',
    id,
    error: { code, message },
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

// Handle incoming messages
rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    const { id, method, params } = message;

    switch (method) {
      case 'initialize':
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'project-dashboard-mcp',
            version: '1.0.0',
          },
        });
        break;

      case 'notifications/initialized':
        // No response needed for notifications
        break;

      case 'tools/list':
        sendResponse(id, {
          tools: [
            {
              name: 'report_status',
              description: 'Report current working status to the Project Dashboard. Call this when starting a task, making progress, or completing work.',
              inputSchema: {
                type: 'object',
                properties: {
                  project_path: {
                    type: 'string',
                    description: 'The absolute path to the project directory',
                  },
                  status: {
                    type: 'string',
                    enum: ['idle', 'working', 'waiting', 'done', 'error'],
                    description: 'Current status: idle (not working), working (actively coding), waiting (needs user input), done (task completed), error (encountered an error)',
                  },
                  message: {
                    type: 'string',
                    description: 'Short description of what you are doing (e.g., "Updating login component")',
                  },
                  task: {
                    type: 'string',
                    description: 'The current task or feature being worked on',
                  },
                  progress: {
                    type: 'number',
                    description: 'Optional progress percentage (0-100)',
                  },
                },
                required: ['project_path', 'status'],
              },
            },
            {
              name: 'get_all_statuses',
              description: 'Get status of all tracked projects',
              inputSchema: {
                type: 'object',
                properties: {},
              },
            },
          ],
        });
        break;

      case 'tools/call':
        const toolName = params?.name;
        const args = params?.arguments || {};

        if (toolName === 'report_status') {
          if (!args.project_path || !args.status) {
            sendError(id, -32602, 'Missing required parameters: project_path and status');
            return;
          }

          const result = updateProjectStatus(args.project_path, {
            status: args.status,
            message: args.message,
            task: args.task,
            progress: args.progress,
          });

          sendResponse(id, {
            content: [
              {
                type: 'text',
                text: `Status updated: ${result.status}${result.message ? ' - ' + result.message : ''}`,
              },
            ],
          });
        } else if (toolName === 'get_all_statuses') {
          const statuses = getAllStatuses();
          sendResponse(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify(statuses, null, 2),
              },
            ],
          });
        } else {
          sendError(id, -32601, `Unknown tool: ${toolName}`);
        }
        break;

      default:
        if (id) {
          sendError(id, -32601, `Method not found: ${method}`);
        }
    }
  } catch (e) {
    // Ignore parse errors for non-JSON lines
  }
});

// Handle process signals
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
