#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/lxgw-wenkai-tc"
font_dir="$repo_root/packages/lxgw-wenkai-tc"
image="vdustr/font-splitter:0.2.2"

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
cp "$repo_root/licenses/glow-sans-OFL.txt" "$font_dir/LICENSE.font.txt"

for family in Proportional Monospaced; do
  for style in Light Regular Medium; do
    case "$style" in
      Light) weight=300 ;;
      Regular) weight=400 ;;
      Medium) weight=500 ;;
    esac
    if [[ "$family" == Proportional ]]; then
      source_name="LXGWWenKaiTC-${style}.ttf"
      css_family="LXGW WenKai TC"
    else
      source_name="LXGWWenKaiMonoTC-${style}.ttf"
      css_family="LXGW WenKai Mono TC"
    fi
    output_dir="$font_dir/dist/$family/$style"
    mkdir -p "$output_dir"
    find "$output_dir" -type f -delete
    docker run --rm --platform linux/amd64 \
      --env SOURCE_DATE_EPOCH=1773760863 \
      --env PYTHONHASHSEED=0 \
      --volume "$repo_root:/workspace" \
      --workdir /workspace \
      "$image" \
      ".work/lxgw-wenkai-tc/source/$source_name" \
      --output "packages/lxgw-wenkai-tc/dist/$family/$style" \
      --family "$css_family" \
      --weight "$weight" \
      --max-codepoints 1024 \
      --flavor woff2
  done
done

cat > "$font_dir/dist/index.css" <<'EOF'
@import url("./Proportional/Light/LXGW-WenKai-TC.css");
@import url("./Proportional/Regular/LXGW-WenKai-TC.css");
@import url("./Proportional/Medium/LXGW-WenKai-TC.css");
@import url("./Monospaced/Light/LXGW-WenKai-Mono-TC.css");
@import url("./Monospaced/Regular/LXGW-WenKai-Mono-TC.css");
@import url("./Monospaced/Medium/LXGW-WenKai-Mono-TC.css");
EOF

docker run --rm --platform linux/amd64 \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_lxgw_wenkai_tc.py
