/**
 * Groups projects by common prefix
 * e.g., navitas-crm, navitas-landing -> group "Navitas"
 */

// Minimum projects to form a group
const MIN_GROUP_SIZE = 2;

// Common separators in project names
const SEPARATORS = ['-', '_', '.'];

/**
 * Extract prefix from project name
 */
function extractPrefix(name) {
  for (const sep of SEPARATORS) {
    const parts = name.split(sep);
    if (parts.length > 1) {
      return parts[0].toLowerCase();
    }
  }
  return null;
}

/**
 * Format group name for display (capitalize first letter)
 */
function formatGroupName(prefix) {
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

/**
 * Get emoji for group based on name
 */
function getGroupEmoji(prefix) {
  const emojiMap = {
    navitas: '🔆',
    content: '📝',
    video: '🎬',
    api: '🔌',
    mcp: '🔧',
    test: '🧪',
  };
  return emojiMap[prefix] || '📁';
}

/**
 * Calculate aggregate stats for a group
 */
function calculateGroupStats(projects) {
  return {
    totalUncommitted: projects.reduce((sum, p) => sum + (p.uncommittedChanges || 0), 0),
    totalTasks: projects.reduce((sum, p) => sum + (p.remainingTasks?.length || 0), 0),
    hasClaudeActive: projects.some(p => p.claudeLive?.status === 'working'),
    lastActivity: projects.reduce((latest, p) => {
      const pDate = new Date(p.lastActivity);
      return pDate > latest ? pDate : latest;
    }, new Date(0)),
  };
}

/**
 * Group projects by prefix
 * Returns: { groups: [...], standalone: [...] }
 */
export function groupProjectsByPrefix(projects) {
  // Count prefixes
  const prefixCounts = {};
  const projectsByPrefix = {};

  for (const project of projects) {
    const prefix = extractPrefix(project.name);
    if (prefix) {
      prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
      if (!projectsByPrefix[prefix]) {
        projectsByPrefix[prefix] = [];
      }
      projectsByPrefix[prefix].push(project);
    }
  }

  // Build groups and standalone lists
  const groups = [];
  const standalone = [];
  const groupedProjectPaths = new Set();

  for (const [prefix, count] of Object.entries(prefixCounts)) {
    if (count >= MIN_GROUP_SIZE) {
      const groupProjects = projectsByPrefix[prefix];
      const stats = calculateGroupStats(groupProjects);

      groups.push({
        id: `group-${prefix}`,
        name: formatGroupName(prefix),
        emoji: getGroupEmoji(prefix),
        prefix,
        projects: groupProjects.sort((a, b) => a.name.localeCompare(b.name)),
        count: groupProjects.length,
        stats,
      });

      groupProjects.forEach(p => groupedProjectPaths.add(p.path));
    }
  }

  // Add standalone projects (not in any group)
  for (const project of projects) {
    if (!groupedProjectPaths.has(project.path)) {
      standalone.push(project);
    }
  }

  // Sort groups by last activity
  groups.sort((a, b) => b.stats.lastActivity - a.stats.lastActivity);

  return { groups, standalone };
}

export default groupProjectsByPrefix;
