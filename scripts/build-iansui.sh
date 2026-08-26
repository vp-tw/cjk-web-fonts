#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/iansui"
font_dir="$repo_root/packages/iansui"
output_dir="$font_dir/dist/Regular"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
sed $'1s/^\xEF\xBB\xBF//; s/\r$//; s/[[:blank:]]*$//' \
  "$work_dir/source/OFL.txt" > "$font_dir/LICENSE.font.txt"
mkdir -p "$output_dir"
find "$output_dir" -type f -delete

docker run --rm --platform linux/amd64 \
  --env SOURCE_DATE_EPOCH=1748590413 \
  --env PYTHONHASHSEED=0 \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  .work/iansui/source/Iansui-Regular.ttf \
  --output packages/iansui/dist/Regular \
  --family Iansui \
  --weight 400 \
  --max-codepoints 1024 \
  --flavor woff2

printf '%s\n' '@import url("./Regular/Iansui.css");' > "$font_dir/dist/index.css"

docker run --rm --platform linux/amd64 \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_iansui.py
