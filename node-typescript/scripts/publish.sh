#!/bin/sh

set -e

pnpm i --frozen-lockfile

pnpm update:version

pnpm build

cd packages/cli

npm publish --access public
cd -

echo "✅ Publish completed"
