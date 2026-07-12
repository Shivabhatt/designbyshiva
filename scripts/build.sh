#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="${PORTFOLIO_SOURCE_DIR:-/home/shiva/personal portfolio}"

# Clean up old build artifacts (specific files only - never delete .git or scripts)
rm -f "$REPO_ROOT"/index.html "$REPO_ROOT"/styles.css "$REPO_ROOT"/script.js "$REPO_ROOT"/portfolio.js "$REPO_ROOT"/CNAME "$REPO_ROOT"/.nojekyll 2>/dev/null || true
rm -rf "$REPO_ROOT"/lib "$REPO_ROOT"/public 2>/dev/null || true

# Copy source files to repo root
for file in index.html styles.css script.js portfolio.js; do
  if [ -f "$SOURCE_DIR/$file" ]; then
    cp "$SOURCE_DIR/$file" "$REPO_ROOT/$file"
  fi
done

if [ -d "$SOURCE_DIR/lib" ]; then
  cp -R "$SOURCE_DIR/lib" "$REPO_ROOT/lib"
fi

if [ -d "$SOURCE_DIR/public" ]; then
  cp -R "$SOURCE_DIR/public" "$REPO_ROOT/public"
fi

# Create SEO and Pages files
echo 'designbyshiva.in' > "$REPO_ROOT/CNAME"
: > "$REPO_ROOT/.nojekyll"

echo "Built static site to $REPO_ROOT (flat structure)"
