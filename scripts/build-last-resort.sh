#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/last-resort"
font_dir="$repo_root/packages/last-resort"
output_dir="$font_dir/dist"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
cp "$work_dir/source/LICENSE" "$font_dir/LICENSE.font.txt"
mkdir -p "$output_dir"
find "$output_dir" -type f -delete

docker run --rm \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/prepare_last_resort.py \
  .work/last-resort/source/LastResort-Regular.ttf \
  .work/last-resort/Last-Resort-Ranges.css

docker run --rm \
  --env SOURCE_DATE_EPOCH=1757376000 \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  .work/last-resort/source/LastResort-Regular.ttf \
  --output packages/last-resort/dist \
  --family "Last Resort" \
  --source font-css:.work/last-resort/Last-Resort-Ranges.css \
  --max-codepoints 16384 \
  --flavor woff2

printf '%s\n' '@import url("./Last-Resort.css");' > "$output_dir/index.css"

docker run --rm \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_last_resort.py
