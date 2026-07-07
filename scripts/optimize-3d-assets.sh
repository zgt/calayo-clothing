#!/bin/bash
# Compresses the garment GLTF sources into single-file .glb bundles (Draco
# geometry + 2048px WebP textures). The app loads only the .glb output; the
# original scene.gltf/scene.bin/textures live outside the repo (default
# ~/archives/calayo-3d-originals) so they are never served.
#
# Compression constraints — GLTFGarment.tsx renders bare geometries inside
# hand-calibrated group transforms and ignores GLTF node transforms, so vertex
# data must stay in its original coordinate space:
#   --compress draco  decodes back to original space; safe. (meshopt/quantize
#                     are NOT safe: they normalize positions and move the
#                     compensating scale/translation onto the nodes.)
#   --flatten/--join  would bake node transforms into vertices; keep off.
#   --palette         can restructure materials/UVs; materials are replaced at
#                     runtime anyway; keep off.
# The Draco decoder is self-hosted in public/draco/ (see GLTFGarment.tsx).
set -euo pipefail
cd "$(dirname "$0")/.."

SRC_DIR="${1:-$HOME/archives/calayo-3d-originals}"

for garment in dress jacket pants shirt; do
  src="$SRC_DIR/$garment/scene.gltf"
  out="public/3d-assets/$garment/scene.glb"
  echo "== $garment =="
  pnpm dlx @gltf-transform/cli optimize "$src" "$out" \
    --compress draco \
    --texture-compress webp --texture-size 2048 \
    --flatten false --join false --palette false
  ls -la "$out"
done
