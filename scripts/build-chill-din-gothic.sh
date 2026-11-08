#!/usr/bin/env bash

set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
font_dir="$repo_root/packages/chill-din-gothic"
work_dir="$repo_root/.work/chill-din-gothic"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
cp "$work_dir/source/license" "$font_dir/LICENSE.font.txt"
docker run --rm --platform linux/amd64 --entrypoint python \
  --volume "$repo_root:/workspace" --workdir /workspace "$image" \
  scripts/prepare_chill_din_gothic.py
mkdir -p "$font_dir/dist/Regular"
find "$font_dir/dist" -type f -delete
docker run --rm --platform linux/amd64 \
  --env SOURCE_DATE_EPOCH=1749722389 --env PYTHONHASHSEED=0 \
  --volume "$repo_root:/workspace" --workdir /workspace "$image" \
  .work/chill-din-gothic/VPIndustrialGothic-Regular.otf \
  --output packages/chill-din-gothic/dist/Regular \
  --family "VP Industrial Gothic" --weight 500 --max-codepoints 1024 --flavor woff2
docker run --rm --platform linux/amd64 --entrypoint python \
  --volume "$repo_root:/workspace" --workdir /workspace "$image" \
  scripts/prepare_chill_din_gothic.py restore-license
printf '%s\n' '@import url("./Regular/VP-Industrial-Gothic.css");' > "$font_dir/dist/index.css"
docker run --rm --platform linux/amd64 --entrypoint python \
  --volume "$repo_root:/workspace" --workdir /workspace "$image" \
  scripts/audit_chill_din_gothic.py
