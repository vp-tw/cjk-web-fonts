#!/usr/bin/env bash
set -euo pipefail
"$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/build-glow-sans-tc-width.sh" \
  glow-sans-tc-normal Normal normal
