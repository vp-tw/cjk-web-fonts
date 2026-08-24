#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "usage: build-glow-sans-tc-width.sh <package-id> <width> <css-stretch>" >&2
  exit 2
fi

package_id="$1"
width="$2"
stretch="$3"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work_dir="$repo_root/.work/glow-sans-tc"
font_dir="$repo_root/packages/$package_id"
image="vdustr/font-splitter:0.2.2"
build_concurrency="${FONT_BUILD_CONCURRENCY:-4}"

if ! [[ "$build_concurrency" =~ ^[1-9][0-9]*$ ]]; then
  echo "FONT_BUILD_CONCURRENCY must be a positive integer" >&2
  exit 2
fi

python3 "$repo_root/scripts/fetch_source.py" "$font_dir/source.json" "$work_dir"
cp "$repo_root/LICENSE" "$font_dir/LICENSE"
cp "$repo_root/licenses/glow-sans-OFL.txt" "$font_dir/LICENSE.font.txt"
find "$font_dir/dist" -type f -delete 2>/dev/null || true

weight_entries=(
  "Thin:100"
  "ExtraLight:200"
  "Light:300"
  "Regular:400"
  "Book:500"
  "Medium:600"
  "Bold:700"
  "ExtraBold:800"
  "Heavy:900"
)

mkdir -p "$font_dir/dist"
build_variant() {
  local style="$1"
  local weight="$2"
  local source_path=".work/glow-sans-tc/source/$width/GlowSansTC-$width-$style.otf"
  mkdir -p "$font_dir/dist/$style"
  docker run --rm --platform linux/amd64 \
    --env SOURCE_DATE_EPOCH=1631245845 \
    --env PYTHONHASHSEED=0 \
    --volume "$repo_root:/workspace" \
    --workdir /workspace \
    "$image" \
    "$source_path" \
    --output "packages/$package_id/dist/$style" \
    --family "Glow Sans TC" \
    --weight "$weight" \
    --stretch "$stretch" \
    --max-codepoints 4096 \
    --flavor woff2 \
    --quiet
}

pids=()
wait_for_batch() {
  local failed=0
  local pid
  for pid in "$@"; do
    if ! wait "$pid"; then
      failed=1
    fi
  done
  return "$failed"
}

for weight_entry in "${weight_entries[@]}"; do
  style="${weight_entry%%:*}"
  weight="${weight_entry#*:}"
  source_path=".work/glow-sans-tc/source/$width/GlowSansTC-$width-$style.otf"
  if [ ! -f "$repo_root/$source_path" ]; then
    if [ "$width" = "Compressed" ] && [ "$style" = "Heavy" ]; then
      continue
    fi
    echo "missing upstream variant: $source_path" >&2
    exit 1
  fi
  build_variant "$style" "$weight" &
  pids+=("$!")
  if [ "${#pids[@]}" -eq "$build_concurrency" ]; then
    wait_for_batch "${pids[@]}"
    pids=()
  fi
done
if [ "${#pids[@]}" -gt 0 ]; then
  wait_for_batch "${pids[@]}"
fi

: > "$font_dir/dist/index.css"
for weight_entry in "${weight_entries[@]}"; do
  style="${weight_entry%%:*}"
  if [ "$width" = "Compressed" ] && [ "$style" = "Heavy" ]; then
    continue
  fi
  printf '@import url("./%s/Glow-Sans-TC.css");\n' "$style" >> "$font_dir/dist/index.css"
done

docker run --rm --platform linux/amd64 \
  --entrypoint python \
  --volume "$repo_root:/workspace" \
  --workdir /workspace \
  "$image" \
  scripts/audit_glow_sans_tc.py "$package_id" "$width" "$stretch"
