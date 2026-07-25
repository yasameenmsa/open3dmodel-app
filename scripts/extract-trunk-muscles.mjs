/**
 * Extract trunk muscle meshes from the full Z-Anatomy myology model
 * into a compact standalone GLB file.
 *
 * Usage:  node scripts/extract-trunk-muscles.mjs
 */
import fs from 'fs';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup } from '@gltf-transform/functions';

// ── Trunk muscle keywords ──────────────────────────────────────
// Matches against the name-map values (human-readable names).
// Any mesh whose mapped name contains one of these (case-insensitive)
// will be kept. Everything else is removed.
const TRUNK_KEYWORDS = [
  // Anterior abdominal wall
  'rectus abdominis',
  'external abdominal oblique',
  'internal abdominal oblique',
  'transversus abdominis',
  'pyramidalis',
  // Posterior abdominal wall
  'psoas major',
  'psoas minor',
  'iliacus',
  'quadratus lumborum',
  // Deep back (erector spinae group)
  'iliocostalis',
  'longissimus',
  'spinalis',
  'multifidus',
  'rotatores',
  'semispinalis',
  'erector spinae',
  // Thorax wall
  'external intercostal',
  'internal intercostal',
  'innermost intercostal',
  'subcostal',
  'transversus thoracis',
  'diaphragm',
  // Pectoral region / superficial trunk
  'pectoralis major',
  'pectoralis minor',
  'sternocostal head',
  'clavicular head',
  'abdominal head',
  'subclavius',
  // Superficial back
  'trapezius',
  'latissimus dorsi',
  'rhomboid major',
  'rhomboid minor',
  'levator scapulae',
  'serratus anterior',
  'serratus posterior',
  // Suboccipital (deep neck/upper back)
  'splenius',
];

const ROOT = path.resolve(import.meta.dirname, '..');
const NAME_MAP_PATH = path.join(ROOT, 'public', 'name-map.json');
const INPUT_PATH = path.join(ROOT, 'public', 'models', 'z-anatomy', 'myology', 'scene.gltf');
const OUTPUT_PATH = path.join(ROOT, 'public', 'models', 'open3d', 'trunk-muscles.glb');

async function main() {
  console.log('📖 Loading name-map.json …');
  const nameMap = JSON.parse(fs.readFileSync(NAME_MAP_PATH, 'utf-8'));

  // Build a Set of myology Object names that are trunk muscles
  const trunkObjectNames = new Set();
  for (const [key, humanName] of Object.entries(nameMap)) {
    if (!key.startsWith('myology_')) continue;
    const lower = String(humanName).toLowerCase();
    if (TRUNK_KEYWORDS.some((kw) => lower.includes(kw))) {
      // key is like "myology_Object_103", the mesh name in the GLTF is "Object_103"
      const meshName = key.replace('myology_', '');
      trunkObjectNames.add(meshName);
      console.log(`  ✓ keeping: ${meshName} → ${humanName}`);
    }
  }
  console.log(`\n🏋️  Keeping ${trunkObjectNames.size} trunk muscle meshes.\n`);

  // Load the full myology GLTF
  console.log('📦 Loading myology model …');
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(INPUT_PATH);
  const root = document.getRoot();

  // Walk all nodes; remove meshes that are NOT trunk muscles
  let removed = 0;
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;

    const nodeName = node.getName();
    if (!trunkObjectNames.has(nodeName)) {
      node.setMesh(null);   // detach mesh from node
      removed++;
    }
  }
  console.log(`🗑  Detached ${removed} non-trunk meshes.`);

  // Clean up unreferenced resources
  console.log('🧹 Pruning unused resources …');
  await document.transform(prune(), dedup());

  // Write the result as a compact GLB
  console.log(`💾 Writing ${OUTPUT_PATH} …`);
  await io.write(OUTPUT_PATH, document);

  const stat = fs.statSync(OUTPUT_PATH);
  console.log(`\n✅ Done!  trunk-muscles.glb = ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
