#!/bin/bash
# Setup script for Project Dashboard MCP Server
# Adds the server to Claude Code's MCP configuration

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MCP_SERVER_PATH="$SCRIPT_DIR/index.js"

# Claude Code config locations
CLAUDE_CONFIG_DIR="$HOME/.claude"
MCP_CONFIG_FILE="$CLAUDE_CONFIG_DIR/mcp.json"

echo "🚀 Setting up Project Dashboard MCP Server..."

# Create .claude directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Create status directory
mkdir -p "$HOME/.project-dashboard"

# Check if mcp.json exists
if [ -f "$MCP_CONFIG_FILE" ]; then
  # Backup existing config
  cp "$MCP_CONFIG_FILE" "$MCP_CONFIG_FILE.backup"

  # Check if project-dashboard is already configured
  if grep -q "project-dashboard" "$MCP_CONFIG_FILE"; then
    echo "✅ Project Dashboard MCP server already configured!"
  else
    # Add to existing config using node to properly merge JSON
    node -e "
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync('$MCP_CONFIG_FILE', 'utf-8'));
      config.mcpServers = config.mcpServers || {};
      config.mcpServers['project-dashboard'] = {
        command: 'node',
        args: ['$MCP_SERVER_PATH']
      };
      fs.writeFileSync('$MCP_CONFIG_FILE', JSON.stringify(config, null, 2));
    "
    echo "✅ Added Project Dashboard MCP server to existing config!"
  fi
else
  # Create new config
  cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "project-dashboard": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"]
    }
  }
}
EOF
  echo "✅ Created new MCP config with Project Dashboard server!"
fi

echo ""
echo "📍 MCP Server: $MCP_SERVER_PATH"
echo "📍 Config: $MCP_CONFIG_FILE"
echo ""
echo "🎉 Setup complete! Restart Claude Code to activate."
echo ""
echo "Usage in Claude:"
echo "  report_status({ project_path: '/path/to/project', status: 'working', message: 'Building feature...' })"
