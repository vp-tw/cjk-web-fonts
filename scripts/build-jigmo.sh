#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/jigmo"
font_dir="$repo_root/packages/jigmo"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
perl -0pe 's/\r//g; s/\n+\z/\n/' \
  "$work_dir/source/LICENSE.txt" > "$font_dir/LICENSE.font.txt"

for source_name in Jigmo Jigmo2 Jigmo3; do
  output_dir="$font_dir/dist/$source_name"
  mkdir -p "$output_dir"
  find "$output_dir" -type f -delete

  docker run --rm \
    --env SOURCE_DATE_EPOCH=1757635200 \
    --volume "$repo_root:/workspace" \
    --workdir /workspace \
    "$image" \
    ".work/jigmo/source/${source_name}.ttf" \
    --output "packages/jigmo/dist/${source_name}" \
    --family Jigmo \
    --max-codepoints 1024 \
    --flavor woff2
done

docker run --rm \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_jigmo.py
