const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Get git information for a project
 */
async function getGitInfo(projectPath) {
  try {
    // Check if it's a git repo
    await execAsync('git rev-parse --git-dir', { cwd: projectPath, timeout: 3000 });
  } catch (e) {
    return null; // Not a git repo
  }

  const gitInfo = {
    currentBranch: '',
    commits: [],
    branches: [],
    status: { ahead: 0, behind: 0, uncommitted: 0 }
  };

  try {
    // Get current branch
    const { stdout: branch } = await execAsync(
      'git branch --show-current',
      { cwd: projectPath, timeout: 3000 }
    );
    gitInfo.currentBranch = branch.trim() || 'HEAD';

    // Get all branches
    const { stdout: branchList } = await execAsync(
      'git branch -a --format="%(refname:short)"',
      { cwd: projectPath, timeout: 3000 }
    );
    gitInfo.branches = branchList.split('\n')
      .filter(Boolean)
      .filter(b => !b.includes('->'))
      .slice(0, 10);

    // Get recent commits with graph info
    const { stdout: logOutput } = await execAsync(
      'git log --all -n 15 --format="%h|%s|%an|%ar|%D" --graph',
      { cwd: projectPath, timeout: 5000 }
    );

    gitInfo.commits = parseGitLog(logOutput);

    // Get uncommitted changes count
    const { stdout: statusOutput } = await execAsync(
      'git status --porcelain',
      { cwd: projectPath, timeout: 3000 }
    );
    gitInfo.status.uncommitted = statusOutput.split('\n').filter(Boolean).length;

    // Get ahead/behind count
    try {
      const { stdout: revList } = await execAsync(
        'git rev-list --left-right --count @{upstream}...HEAD 2>/dev/null || echo "0\t0"',
        { cwd: projectPath, timeout: 3000 }
      );
      const [behind, ahead] = revList.trim().split('\t').map(Number);
      gitInfo.status.ahead = ahead || 0;
      gitInfo.status.behind = behind || 0;
    } catch (e) {
      // No upstream set
    }

  } catch (e) {
    console.error(`Git scan error for ${projectPath}:`, e.message);
  }

  return gitInfo;
}

/**
 * Parse git log output into structured commits
 */
function parseGitLog(logOutput) {
  const commits = [];
  const lines = logOutput.split('\n').filter(Boolean);

  for (const line of lines) {
    // Extract the graph characters and the commit data
    const graphMatch = line.match(/^([*|\/\\ ]+)\s*(.*)/);
    if (!graphMatch) continue;

    const [, graphChars, data] = graphMatch;
    if (!data || !data.includes('|')) continue;

    const parts = data.split('|');
    if (parts.length < 4) continue;

    const [hash, message, author, date, refs] = parts;

    commits.push({
      hash: hash.trim(),
      message: message.trim().slice(0, 50),
      author: author.trim(),
      date: date.trim(),
      branches: refs ? refs.split(',').map(r => r.trim()).filter(Boolean) : [],
      graphChars: graphChars.trim()
    });
  }

  return commits.slice(0, 10);
}

module.exports = { getGitInfo };
