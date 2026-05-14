#!/usr/bin/env bash
# transpila los .jsx del bundle a .js con babel + preset-react
# uso: ./transpile.sh
set -e
cd "$(dirname "$0")"
BABEL="$(cd ../.. && pwd)/node_modules/@babel/cli/bin/babel.js"
for f in ui visuals sections-1 sections-2 review tweaks-panel app app-review; do
  node "$BABEL" --presets=@babel/preset-react --no-babelrc "${f}.jsx" -o "${f}.js"
  echo "  ✓ ${f}.js"
done
echo "done · ${#@} archivos transpilados"
