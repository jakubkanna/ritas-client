#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/path/to/ritas-client}"
PUBLIC_DIR="${PUBLIC_DIR:-/path/to/public_html}"
DOTENV_CONFIG_PATH="${DOTENV_CONFIG_PATH:-.env.wordpress}"

cd "$APP_DIR"

DOTENV_CONFIG_PATH="$DOTENV_CONFIG_PATH" \
SITEMAP_OUTPUT_PATH="$PUBLIC_DIR/sitemap.xml" \
npm run sitemap
