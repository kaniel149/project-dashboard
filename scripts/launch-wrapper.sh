#!/bin/bash
DIR="$(dirname "$0")"
APP_DIR="$(cd "$DIR/../.." && pwd)"
ELECTRON="$APP_DIR/Contents/MacOS/Project Dashboard"
exec "$ELECTRON" "$@" 2>/dev/null
