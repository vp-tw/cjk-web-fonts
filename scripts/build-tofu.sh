#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/tofu"
font_dir="$repo_root/packages/tofu"
output_dir="$font_dir/dist"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$work_dir/source/LICENSE" "$font_dir/LICENSE.font.txt"
find "$output_dir" -type f -delete

docker run --rm \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/prepare_tofu.py \
  .work/tofu/source/tofu.ttf \
  .work/tofu/Tofu-Format12.ttf \
  .work/tofu/Tofu-Ranges.css

docker run --rm \
  --env SOURCE_DATE_EPOCH=1740355200 \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  .work/tofu/Tofu-Format12.ttf \
  --output packages/tofu/dist \
  --family Tofu \
  --source font-css:.work/tofu/Tofu-Ranges.css \
  --max-codepoints 16384 \
  --flavor woff2

printf '%s\n' '@import url("./Tofu.css");' > "$output_dir/index.css"

docker run --rm \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_tofu.py
