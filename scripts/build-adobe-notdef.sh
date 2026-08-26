#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/adobe-notdef"
font_dir="$repo_root/packages/adobe-notdef"
output_dir="$font_dir/dist"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
cp "$work_dir/source/LICENSE.md" "$font_dir/LICENSE.font.md"
mkdir -p "$output_dir"
find "$output_dir" -type f -delete

docker run --rm \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/prepare_adobe_notdef.py \
  .work/adobe-notdef/source/AND-Regular.otf \
  .work/adobe-notdef/Adobe-NotDef-Ranges.css

docker run --rm \
  --env SOURCE_DATE_EPOCH=1575331200 \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  .work/adobe-notdef/source/AND-Regular.otf \
  --output packages/adobe-notdef/dist \
  --family "Adobe NotDef" \
  --source font-css:.work/adobe-notdef/Adobe-NotDef-Ranges.css \
  --max-codepoints 16384 \
  --flavor woff2

printf '%s\n' '@import url("./Adobe-NotDef.css");' > "$output_dir/index.css"

docker run --rm \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_adobe_notdef.py
