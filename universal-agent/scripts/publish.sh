#!/bin/bash
set -e

echo "Publishing packages..."

for pkg in packages/*/; do
  name=$(node -e "console.log(require(\"./${pkg}package.json\").name)")
  echo "Publishing ${name}..."
  cd "$pkg"
  npm publish --access public
  cd - > /dev/null
done
