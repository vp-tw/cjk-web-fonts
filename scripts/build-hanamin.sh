#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/hanamin"
font_dir="$repo_root/packages/hanamin"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
perl -0pe 's/\r//g; s/[ \t]+(?=\n)//g; s/\n+\z/\n/' \
  "$work_dir/source/LICENSE.txt" > "$font_dir/LICENSE.font.txt"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"

for source_name in HanaMinA HanaMinB; do
  output_dir="$font_dir/dist/$source_name"
  mkdir -p "$output_dir"
  find "$output_dir" -type f -delete

  docker run --rm \
    --env SOURCE_DATE_EPOCH=1504224000 \
    --volume "$repo_root:/workspace" \
    --workdir /workspace \
    "$image" \
    ".work/hanamin/source/${source_name}.ttf" \
    --output "packages/hanamin/dist/${source_name}" \
    --family HanaMin \
    --max-codepoints 1024 \
    --flavor woff2
done

printf '%s\n' \
  '@import url("./HanaMinA/HanaMin.css");' \
  '@import url("./HanaMinB/HanaMin.css");' \
  > "$font_dir/dist/index.css"

docker run --rm \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_hanamin.py
