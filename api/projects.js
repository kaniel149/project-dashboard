/**
 * API Route: /api/projects
 * Fetches projects from GitHub API for web deployment
 */

const GITHUB_OWNER = 'kaniel149';
const REPOS = [
  'navitas-crm',
  'project-dashboard',
  'claude-skills-library',
  'navitas-digital-proposals',
  'navitas-proposal-template',
  'navitas-solar-landing',
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  try {
    const projects = await Promise.all(
      REPOS.map(async (repo) => {
        try {
          // Fetch repo info
          const repoRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          );

          if (!repoRes.ok) return null;
          const repoData = await repoRes.json();

          // Fetch recent commits
          const commitsRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/commits?per_page=5`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          );

          const commits = commitsRes.ok ? await commitsRes.json() : [];

          // Fetch open issues
          const issuesRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/issues?state=open&per_page=10`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          );

          const issues = issuesRes.ok ? await issuesRes.json() : [];

          // Fetch open PRs
          const prsRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/pulls?state=open&per_page=10`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          );

          const prs = prsRes.ok ? await prsRes.json() : [];

          return {
            name: repo,
            path: `https://github.com/${GITHUB_OWNER}/${repo}`,
            isGitRepo: true,
            description: repoData.description,
            language: repoData.language,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            updatedAt: repoData.updated_at,
            pushedAt: repoData.pushed_at,
            defaultBranch: repoData.default_branch,
            git: {
              branch: repoData.default_branch,
              status: {
                ahead: 0,
                behind: 0,
                modified: 0,
                untracked: 0,
              },
              lastCommit: commits[0]
                ? {
                    hash: commits[0].sha.substring(0, 7),
                    message: commits[0].commit.message.split('\n')[0],
                    author: commits[0].commit.author.name,
                    date: commits[0].commit.author.date,
                  }
                : null,
              recentCommits: commits.map((c) => ({
                hash: c.sha.substring(0, 7),
                message: c.commit.message.split('\n')[0],
                author: c.commit.author.name,
                date: c.commit.author.date,
              })),
            },
            issues: issues.map((i) => ({
              number: i.number,
              title: i.title,
              state: i.state,
              url: i.html_url,
              createdAt: i.created_at,
              labels: i.labels.map((l) => l.name),
            })),
            pullRequests: prs.map((p) => ({
              number: p.number,
              title: p.title,
              state: p.state,
              url: p.html_url,
              createdAt: p.created_at,
              draft: p.draft,
            })),
          };
        } catch (error) {
          console.error(`Error fetching ${repo}:`, error);
          return null;
        }
      })
    );

    return res.status(200).json({
      projects: projects.filter(Boolean),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
