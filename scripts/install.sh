#!/bin/bash

set -e

echo "🚀 Installing Project Dashboard..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build the app
echo "🔨 Building application..."
npm run build

# 3. Copy to Applications (if built with electron-builder)
if [ -d "dist/mac/Project Dashboard.app" ]; then
  echo "📱 Installing to Applications..."
  cp -r "dist/mac/Project Dashboard.app" /Applications/
  APP_PATH="/Applications/Project Dashboard.app/Contents/MacOS/Project Dashboard"
elif [ -d "dist/mac-arm64/Project Dashboard.app" ]; then
  echo "📱 Installing to Applications..."
  cp -r "dist/mac-arm64/Project Dashboard.app" /Applications/
  APP_PATH="/Applications/Project Dashboard.app/Contents/MacOS/Project Dashboard"
else
  echo "⚠️  No built app found, using npm start for LaunchAgent"
  APP_PATH="$PROJECT_DIR/node_modules/.bin/electron"
  APP_ARGS="$PROJECT_DIR"
fi

# 4. Create LaunchAgent
echo "⚙️  Creating LaunchAgent..."
mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kaniel.project-dashboard</string>
    <key>ProgramArguments</key>
    <array>
        <string>${APP_PATH}</string>
        ${APP_ARGS:+<string>${APP_ARGS}</string>}
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>Crashed</key>
        <true/>
    </dict>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/project-dashboard.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/project-dashboard.err</string>
</dict>
</plist>
EOF

# 5. Load LaunchAgent
echo "🔄 Loading LaunchAgent..."
launchctl unload ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.kaniel.project-dashboard.plist

# 6. Install Claude Skill
echo "🤖 Installing Claude skill..."
mkdir -p ~/.claude/skills
cp skills/project-status-saver.md ~/.claude/skills/

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Project Dashboard is now running in the bottom-right corner"
echo "🔄 It will start automatically when you log in"
echo "🤖 Use /סכם in Claude to save project status"
