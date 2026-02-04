/**
 * API Route: /api/issues
 * Create a new GitHub issue (for WhatsApp → GitHub workflow)
 */

const GITHUB_OWNER = 'kaniel149';

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  if (req.method === 'POST') {
    // Create new issue
    const { repo, title, body, labels } = req.body;

    if (!repo || !title) {
      return res.status(400).json({ error: 'Missing repo or title' });
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/issues`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            body: body || '',
            labels: labels || [],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      const issue = await response.json();
      return res.status(201).json({
        success: true,
        issue: {
          number: issue.number,
          url: issue.html_url,
          title: issue.title,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    // List issues across all repos
    const repos = req.query.repos?.split(',') || [
      'navitas-crm',
      'project-dashboard',
      'claude-skills-library',
    ];
    const state = req.query.state || 'open';
    const labels = req.query.labels || '';

    try {
      const allIssues = await Promise.all(
        repos.map(async (repo) => {
          const url = new URL(
            `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/issues`
          );
          url.searchParams.set('state', state);
          url.searchParams.set('per_page', '10');
          if (labels) url.searchParams.set('labels', labels);

          const response = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });

          if (!response.ok) return [];

          const issues = await response.json();
          return issues.map((i) => ({
            repo,
            number: i.number,
            title: i.title,
            state: i.state,
            url: i.html_url,
            createdAt: i.created_at,
            updatedAt: i.updated_at,
            labels: i.labels.map((l) => l.name),
            author: i.user.login,
          }));
        })
      );

      return res.status(200).json({
        issues: allIssues.flat().sort((a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
        ),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
