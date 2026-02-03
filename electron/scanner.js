const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

// MCP Status file location
const STATUS_FILE = path.join(process.env.HOME, '.project-dashboard', 'status.json');

/**
 * Read Claude live status from MCP status file
 */
async function readClaudeLiveStatus(projectPath) {
  try {
    const content = await fs.readFile(STATUS_FILE, 'utf-8');
    const data = JSON.parse(content);
    return data.projects?.[projectPath] || null;
  } catch (e) {
    return null;
  }
}

// Parse CLAUDE_STATE.md file to extract project info
function parseClaudeStateMd(content) {
  const result = {
    summary: null,
    techStack: [],
    currentStatus: {},
    immediateGoals: [],
    knownIssues: [],
  };

  try {
    // Extract Project Overview section for summary
    const overviewMatch = content.match(/##\s*.*Project Overview.*\n\n([^\n#]+)/i);
    if (overviewMatch) {
      result.summary = overviewMatch[1].trim();
    }

    // Extract Tech Stack
    const techStackSection = content.match(/##\s*.*Tech Stack[\s\S]*?\n\n([\s\S]*?)(?=\n##|\n---|\n$)/i);
    if (techStackSection) {
      const techMatches = techStackSection[1].matchAll(/\|\s*([^|]+)\s*\|/g);
      for (const match of techMatches) {
        const tech = match[1].trim();
        if (tech && !tech.includes('---') && tech !== 'Technology' && tech !== 'Version' && tech !== 'Purpose') {
          result.techStack.push(tech);
        }
      }
    }

    // Extract Current Status section
    const statusSection = content.match(/##\s*.*Current Status[\s\S]*?\n\n([\s\S]*?)(?=\n##|\n---|\n$)/i);
    if (statusSection) {
      const statusMatches = statusSection[1].matchAll(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g);
      for (const match of statusMatches) {
        const area = match[1].trim();
        const status = match[2].trim();
        if (area && !area.includes('---') && area !== 'Area' && area !== 'Status') {
          result.currentStatus[area] = status;
        }
      }
    }

    // Extract Immediate Goals
    const goalsSection = content.match(/##\s*.*Immediate Goals[\s\S]*?\n\n([\s\S]*?)(?=\n##|\n---|\n$)/i);
    if (goalsSection) {
      const goalMatches = goalsSection[1].matchAll(/^\d+\.\s*(.+)$/gm);
      for (const match of goalMatches) {
        result.immediateGoals.push(match[1].trim());
      }
    }

    // Extract Known Issues
    const issuesSection = content.match(/##\s*.*Known Issues[\s\S]*?\n\n([\s\S]*?)(?=\n##|\n---|\n$)/i);
    if (issuesSection) {
      const issueMatches = issuesSection[1].matchAll(/[-*]\s*(.+)/g);
      for (const match of issueMatches) {
        const issue = match[1].trim();
        if (issue && issue !== 'None currently tracked') {
          result.knownIssues.push(issue);
        }
      }
    }
  } catch (e) {
    // Parsing failed, return partial results
  }

  return result;
}

// Parse task_plan.md to extract remaining tasks
function parseTaskPlanMd(content) {
  const tasks = [];
  try {
    // Look for unchecked checkboxes
    const taskMatches = content.matchAll(/[-*]\s*\[\s*\]\s*(.+)/g);
    for (const match of taskMatches) {
      tasks.push(match[1].trim());
    }
  } catch (e) {
    // Parsing failed
  }
  return tasks.slice(0, 10); // Limit to first 10 tasks
}

// Parse progress.md to extract completed tasks
function parseProgressMd(content) {
  const completed = [];
  try {
    // Look for checked checkboxes
    const taskMatches = content.matchAll(/[-*]\s*\[x\]\s*(.+)/gi);
    for (const match of taskMatches) {
      completed.push(match[1].trim());
    }
  } catch (e) {
    // Parsing failed
  }
  return completed.slice(0, 10); // Limit to first 10 tasks
}

async function scanProject(projectPath) {
  const name = path.basename(projectPath);

  try {
    const git = simpleGit(projectPath);
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return null;
    }

    // Get git status
    const status = await git.status();

    // Get recent commits
    const log = await git.log({ maxCount: 5 });

    // Get last activity time
    const lastCommit = log.latest;

    // Read Claude status file if exists (legacy)
    let claudeStatus = {};
    const claudeStatusPath = path.join(projectPath, '.claude', 'project-status.json');
    try {
      const content = await fs.readFile(claudeStatusPath, 'utf-8');
      claudeStatus = JSON.parse(content);
    } catch (e) {
      // File doesn't exist, that's OK
    }

    // Read CLAUDE_STATE.md if exists (new format - priority)
    let claudeStateMd = {};
    const claudeStateMdPath = path.join(projectPath, 'CLAUDE_STATE.md');
    try {
      const content = await fs.readFile(claudeStateMdPath, 'utf-8');
      claudeStateMd = parseClaudeStateMd(content);
    } catch (e) {
      // File doesn't exist
    }

    // Read task_plan.md if exists
    let taskPlanTasks = [];
    const taskPlanPath = path.join(projectPath, 'task_plan.md');
    try {
      const content = await fs.readFile(taskPlanPath, 'utf-8');
      taskPlanTasks = parseTaskPlanMd(content);
    } catch (e) {
      // File doesn't exist
    }

    // Read progress.md if exists
    let progressCompletedTasks = [];
    const progressPath = path.join(projectPath, 'progress.md');
    try {
      const content = await fs.readFile(progressPath, 'utf-8');
      progressCompletedTasks = parseProgressMd(content);
    } catch (e) {
      // File doesn't exist
    }

    // Read TODO.md if exists (fallback)
    let todoTasks = [];
    const todoPath = path.join(projectPath, 'TODO.md');
    try {
      const content = await fs.readFile(todoPath, 'utf-8');
      todoTasks = parseTodoMd(content);
    } catch (e) {
      // File doesn't exist
    }

    // Merge tasks: priority is task_plan.md > TODO.md > Claude status
    const remainingTasks = taskPlanTasks.length > 0 ? taskPlanTasks :
                          (todoTasks.length > 0 ? todoTasks : claudeStatus.remainingTasks || []);

    // Merge completed tasks: progress.md > Claude status
    const completedTasks = progressCompletedTasks.length > 0 ? progressCompletedTasks :
                          (claudeStatus.completedTasks || []);

    // Build next steps from immediate goals
    const nextSteps = claudeStateMd.immediateGoals?.length > 0 ?
                     claudeStateMd.immediateGoals[0] :
                     (claudeStatus.nextSteps || null);

    // Prefer CLAUDE_STATE.md summary over legacy
    const summary = claudeStateMd.summary || claudeStatus.summary || null;

    // Read Claude live status from MCP
    const claudeLiveStatus = await readClaudeLiveStatus(projectPath);

    return {
      name,
      path: projectPath,
      branch: status.current,
      uncommittedChanges: status.files.length,
      changedFiles: status.files.map(f => ({ status: f.index || f.working_dir, path: f.path })),
      lastCommit: lastCommit ? { message: lastCommit.message, date: lastCommit.date } : null,
      recentCommits: log.all.map(c => ({ message: c.message, date: c.date })),
      lastActivity: lastCommit?.date || new Date().toISOString(),
      summary,
      completedTasks,
      remainingTasks,
      nextSteps,
      // New fields from CLAUDE_STATE.md
      techStack: claudeStateMd.techStack || [],
      currentStatus: claudeStateMd.currentStatus || {},
      knownIssues: claudeStateMd.knownIssues || [],
      // Claude live status from MCP
      claudeLive: claudeLiveStatus,
    };
  } catch (error) {
    return null;
  }
}

function parseTodoMd(content) {
  const tasks = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const uncheckedMatch = line.match(/^[\s]*[-*]\s*\[\s*\]\s*(.+)/);
    if (uncheckedMatch) {
      tasks.push(uncheckedMatch[1].trim());
    }
  }

  return tasks;
}

// Category folders that contain projects (not projects themselves)
const CATEGORY_FOLDERS = ['business-projects', 'personal-projects', 'archive'];

async function scanAllProjects(projectsDir, depth = 0) {
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) {
        continue;
      }

      const entryPath = path.join(projectsDir, entry.name);

      // Check if this is a category folder that contains projects
      if (CATEGORY_FOLDERS.includes(entry.name) && depth === 0) {
        // Recursively scan this category folder
        const subProjects = await scanAllProjects(entryPath, depth + 1);
        // Add category prefix to project names for clarity
        subProjects.forEach(p => {
          p.category = entry.name;
        });
        projects.push(...subProjects);
      } else {
        // This is a project folder, scan it
        const project = await scanProject(entryPath);
        if (project) {
          if (depth > 0) {
            // This project is inside a category folder
            project.category = path.basename(projectsDir);
          }
          projects.push(project);
        }
      }
    }

    // Sort by last activity (most recent first)
    projects.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    return projects;
  } catch (error) {
    return [];
  }
}

module.exports = { scanProject, scanAllProjects, parseClaudeStateMd };
