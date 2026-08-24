#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/fusion-pixel-font"
font_dir="$repo_root/packages/fusion-pixel-font"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
cp "$work_dir/source/8px/monospaced/OFL.txt" "$font_dir/LICENSE.font.txt"
mkdir -p "$font_dir/LICENSES"
find "$font_dir/LICENSES" -type f -delete
for size in 8px 10px 12px; do
  mkdir -p "$font_dir/LICENSES/$size"
  cp -R "$work_dir/source/$size/monospaced/LICENSES/." "$font_dir/LICENSES/$size/"
done

language_names=(
  "latin:Latin"
  "zh_hans:Simplified Chinese"
  "zh_hant:Traditional Chinese"
  "ja:Japanese"
  "ko:Korean"
)

find "$font_dir/dist" -type f -delete 2>/dev/null || true
for size in 8px 10px 12px; do
  for spacing in monospaced proportional; do
    case "$spacing" in
      monospaced) spacing_name=Monospaced ;;
      proportional) spacing_name=Proportional ;;
    esac
    group_dir="$font_dir/dist/$size/$spacing"
    mkdir -p "$group_dir"
    : > "$group_dir/index.css"
    for language_entry in "${language_names[@]}"; do
      language="${language_entry%%:*}"
      language_name="${language_entry#*:}"
      family="Fusion Pixel $size $spacing_name $language_name"
      slug="${family// /-}"
      output_dir="$group_dir/$language"
      mkdir -p "$output_dir"

      docker run --rm --platform linux/amd64 \
        --env SOURCE_DATE_EPOCH=1786406400 \
        --env PYTHONHASHSEED=0 \
        --volume "$repo_root:/workspace" \
        --workdir /workspace \
        "$image" \
        ".work/fusion-pixel-font/source/$size/$spacing/fusion-pixel-$size-$spacing-$language.otf.woff2" \
        --output "packages/fusion-pixel-font/dist/$size/$spacing/$language" \
        --family "$family" \
        --max-codepoints 1024 \
        --flavor woff2 \
        --quiet
      printf '@import url("./%s/%s.css");\n' "$language" "$slug" >> "$group_dir/index.css"
    done
  done
done

printf '%s\n' \
  '@import url("./8px/monospaced/index.css");' \
  '@import url("./8px/proportional/index.css");' \
  '@import url("./10px/monospaced/index.css");' \
  '@import url("./10px/proportional/index.css");' \
  '@import url("./12px/monospaced/index.css");' \
  '@import url("./12px/proportional/index.css");' \
  > "$font_dir/dist/index.css"

docker run --rm --platform linux/amd64 \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_fusion_pixel_font.py
