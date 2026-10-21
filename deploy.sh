#!/bin/sh
# One-time copy of the main site into danurasenan.com's public_html.
# Copies files only; never deletes anything (client subdomain folders stay untouched).
# Usage: sh deploy.sh <commit-sha>
set -e
SHA="$1"
[ -n "$SHA" ] || exit 1
MARK="$HOME/.dssite-$SHA"
[ -f "$MARK" ] && exit 0
DEST="/home/u859147957/domains/danurasenan.com/public_html"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "https://codeload.github.com/dssen/dssen.github.io/tar.gz/$SHA" | tar xz -C "$TMP"
cp -R "$TMP/dssen.github.io-$SHA/site/." "$DEST/"
touch "$MARK"
echo "COPIED $SHA"
