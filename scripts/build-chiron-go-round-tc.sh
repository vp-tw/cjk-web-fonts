#!/usr/bin/env bash

set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
font_dir="$repo_root/packages/chiron-go-round-tc"
python3 "$repo_root/scripts/fetch_npm_webfont.py" "$font_dir/source.json" "$repo_root/.work/chiron-go-round-tc" "$font_dir/dist"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
printf '%s\n' '@import url("./css/vf.css");' > "$font_dir/dist/index.css"
docker run --rm --platform linux/amd64 --entrypoint python --volume "$repo_root:/workspace" --workdir /workspace vdustr/font-splitter:0.2.2 scripts/audit_chiron_webfont.py chiron-go-round-tc vf.css
