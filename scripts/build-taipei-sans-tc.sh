#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/taipei-sans-tc"
font_dir="$repo_root/packages/taipei-sans-tc"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
cp "$repo_root/packages/hanamin/LICENSE.font.txt" "$font_dir/LICENSE.font.txt"

for style in Light Regular Bold; do
  case "$style" in
    Light) weight=300 ;;
    Regular) weight=400 ;;
    Bold) weight=700 ;;
  esac
  output_dir="$font_dir/dist/$style"
  mkdir -p "$output_dir"
  find "$output_dir" -type f -delete

  docker run --rm --platform linux/amd64 \
    --env SOURCE_DATE_EPOCH=1598918400 \
    --env PYTHONHASHSEED=0 \
    --volume "$repo_root:/workspace" \
    --workdir /workspace \
    "$image" \
    ".work/taipei-sans-tc/source/TaipeiSansTCBeta-${style}.ttf" \
    --output "packages/taipei-sans-tc/dist/${style}" \
    --family "Taipei Sans TC" \
    --weight "$weight" \
    --max-codepoints 1024 \
    --flavor woff2
done

printf '%s\n' \
  '@import url("./Light/Taipei-Sans-TC.css");' \
  '@import url("./Regular/Taipei-Sans-TC.css");' \
  '@import url("./Bold/Taipei-Sans-TC.css");' \
  > "$font_dir/dist/index.css"

docker run --rm --platform linux/amd64 \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_taipei_sans_tc.py
