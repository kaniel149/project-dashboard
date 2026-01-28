#!/bin/bash

echo "🗑️  Uninstalling Project Dashboard..."

# Stop and unload LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist 2>/dev/null || true
rm -f ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist

# Remove from Applications
rm -rf "/Applications/Project Dashboard.app"

# Remove Claude skill
rm -f ~/.claude/skills/project-status-saver.md

echo "✅ Uninstalled successfully"
