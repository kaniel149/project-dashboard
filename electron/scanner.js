const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');

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

    // Read Claude status file if exists
    let claudeStatus = {};
    const claudeStatusPath = path.join(projectPath, '.claude', 'project-status.json');
    try {
      const content = await fs.readFile(claudeStatusPath, 'utf-8');
      claudeStatus = JSON.parse(content);
    } catch (e) {
      // File doesn't exist, that's OK
    }

    // Read TODO.md if exists
    let todoTasks = [];
    const todoPath = path.join(projectPath, 'TODO.md');
    try {
      const content = await fs.readFile(todoPath, 'utf-8');
      todoTasks = parseTodoMd(content);
    } catch (e) {
      // File doesn't exist
    }

    // Merge tasks from Claude status and TODO.md
    const remainingTasks = claudeStatus.remainingTasks || todoTasks;

    return {
      name,
      path: projectPath,
      branch: status.current,
      uncommittedChanges: status.files.length,
      changedFiles: status.files.map(f => ({ status: f.index || f.working_dir, path: f.path })),
      lastCommit: lastCommit ? { message: lastCommit.message, date: lastCommit.date } : null,
      recentCommits: log.all.map(c => ({ message: c.message, date: c.date })),
      lastActivity: lastCommit?.date || new Date().toISOString(),
      summary: claudeStatus.summary || null,
      completedTasks: claudeStatus.completedTasks || [],
      remainingTasks,
      nextSteps: claudeStatus.nextSteps || null,
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

async function scanAllProjects(projectsDir) {
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const projectPath = path.join(projectsDir, entry.name);
        const project = await scanProject(projectPath);
        if (project) {
          projects.push(project);
        }
      }
    }

    // Sort by last activity
    projects.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    return projects;
  } catch (error) {
    return [];
  }
}

module.exports = { scanProject, scanAllProjects };
