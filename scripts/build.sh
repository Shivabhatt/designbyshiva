#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="${PORTFOLIO_SOURCE_DIR:-/home/shiva/personal portfolio}"
BUILD_DIR="${1:-$REPO_ROOT/build}"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

for file in index.html styles.css script.js portfolio.js; do
  if [ -f "$SOURCE_DIR/$file" ]; then
    cp "$SOURCE_DIR/$file" "$BUILD_DIR/$file"
  fi
done

if [ -d "$SOURCE_DIR/lib" ]; then
  mkdir -p "$BUILD_DIR/lib"
  cp -R "$SOURCE_DIR/lib/." "$BUILD_DIR/lib/"
fi

if [ -d "$SOURCE_DIR/public" ]; then
  mkdir -p "$BUILD_DIR/public"
  cp -R "$SOURCE_DIR/public/." "$BUILD_DIR/public/"
fi

cp "$REPO_ROOT/llm.txt" "$BUILD_DIR/llm.txt"
cp "$REPO_ROOT/sitemap.xml" "$BUILD_DIR/sitemap.xml"

echo 'designbyshiva.in' > "$BUILD_DIR/CNAME"
: > "$BUILD_DIR/.nojekyll"

echo "Built static site to $BUILD_DIR"
