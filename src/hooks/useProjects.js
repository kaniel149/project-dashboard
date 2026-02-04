/**
 * useProjects Hook
 * Unified data fetching for both Electron and Web environments
 */

import { useState, useEffect, useCallback } from 'react';

// Detect if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isElectron) {
        // Electron mode: projects come via IPC
        // They're already set up in the parent component
        return;
      }

      // Web mode: fetch from API
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isElectron) {
      // Electron: set up listener for projects
      setLoading(false);
      const cleanup = window.electronAPI?.onProjectsUpdate((data) => {
        setProjects(data);
      });
      return cleanup;
    } else {
      // Web: fetch on mount and set up polling
      fetchProjects();
      const interval = setInterval(fetchProjects, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [fetchProjects]);

  const refresh = useCallback(async () => {
    if (isElectron) {
      await window.electronAPI?.refreshProjects();
    } else {
      await fetchProjects();
    }
  }, [fetchProjects]);

  return { projects, loading, error, refresh };
}

export function useIssues(options = {}) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIssues = useCallback(async () => {
    if (isElectron) {
      // Electron doesn't have separate issues API
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (options.state) params.set('state', options.state);
      if (options.labels) params.set('labels', options.labels);

      const response = await fetch(`/api/issues?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options.state, options.labels]);

  useEffect(() => {
    if (!isElectron) {
      fetchIssues();
    }
  }, [fetchIssues]);

  const createIssue = useCallback(async (repo, title, body, labels = []) => {
    const response = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo, title, body, labels }),
    });

    if (!response.ok) {
      throw new Error('Failed to create issue');
    }

    return response.json();
  }, []);

  return { issues, loading, error, refresh: fetchIssues, createIssue };
}

// Helper to check environment
export const isWebMode = !isElectron;
export const isElectronMode = isElectron;
