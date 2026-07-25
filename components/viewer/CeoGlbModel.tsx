'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import type { Category } from '@/types/anatomy';
import nameMap from '../../public/name-map.json';

const DRACO_PATH = '/draco/';
const TARGET_HEIGHT = 2.2;
const FEET_Y = -0.9;

interface Processed {
  root: THREE.Group;
  meshesByPart: Map<string, THREE.Mesh[]>;
  fit: { position: [number, number, number]; scale: number; rotationY: number };
  anchors: Record<string, [number, number, number]>;
}

function isMeshObj(o: THREE.Object3D): o is THREE.Mesh {
  return (o as THREE.Mesh).isMesh === true;
}

const LIGAMENT_OVERRIDE = new Set(['ligament', 'ligaments', 'syndesmosis']);

const REPRODUCTIVE_PATTERNS = [
  'uterus', 'ovary', 'prostate', 'testis', 'penis', 'scrotum',
  'cervix', 'vagina', 'labia', 'clitoris', 'epididymis', 'deferens', 'vesicle',
];

const ALWAYS_HIDDEN_OBJECTS = [
  'z-anatomy-layer1-4objcleanermaterialmergergles',
  'z-anatomy-layers1-7objcleanermaterialmergergles',
];

function normalizeNameForMatching(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function isHiddenObject(name: string): boolean {
  const normalized = normalizeNameForMatching(name);
  return ALWAYS_HIDDEN_OBJECTS.some((hidden) =>
    normalized.includes(normalizeNameForMatching(hidden)),
  );
}

function classifyNode(name: string, fallbackCategory: Category): Category {
  const n = name.toLowerCase();

  const muscleKeywords = ['muscle', 'muscles', 'insertion', 'origin', 'biceps', 'triceps', 'deltoid', 'pectoralis', 'latissimus', 'trapezius', 'gluteus', 'rectus', 'vastus'];
  const tendonKeywords = ['tendon', 'tendon sheath', 'fascia', 'septum', 'aponeurosis'];
  const nerveKeywords = ['nerve', 'plexus', 'ganglion', 'ramus', 'radic', 'nerv'];
  const vesselKeywords = [
    'artery', 'vein', 'vessel', 'aorta', 'vena', 'arteria',
    'pulmonary', 'coronary', 'carotid', 'jugular', 'popliteal',
    'subclavian', 'axillary', 'iliac', 'mesenteric', 'renal', 'hepatic',
  ];
  const organKeywords = [
    'heart', 'lung', 'liver', 'kidney', 'stomach', 'spleen',
    'pancreas', 'intestine', 'colon', 'bladder', 'brain', 'eye',
  ];

  if (muscleKeywords.some((k) => n.includes(k))) return 'muscle';
  if (tendonKeywords.some((k) => n.includes(k))) return 'tendon';
  if (nerveKeywords.some((k) => n.includes(k))) return 'nerve';
  if (LIGAMENT_OVERRIDE.has(n)) return 'ligament';
  if (vesselKeywords.some((k) => n.includes(k))) return 'vessel';
  if (organKeywords.some((k) => n.includes(k))) return 'organ';

  return fallbackCategory;
}

function getLayerColor(name: string, category: Category): string {
  const hash = name.length * 7 + (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);

  switch (category) {
    case 'skeleton': {
      const v = 0.94 + (hash % 6) / 100;
      return `rgb(${Math.round(v * 255)}, ${Math.round((v - 0.02) * 255)}, ${Math.round((v - 0.04) * 255)})`;
    }
    case 'muscle': {
      const r = 0.6 + (hash % 25) / 100;
      const g = 0.18 + (hash % 18) / 100;
      const b = 0.15 + (hash % 12) / 100;
      return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
    case 'tendon': {
      const v = 0.85 + (hash % 8) / 100;
      return `rgb(${Math.round(v * 255)}, ${Math.round((v - 0.04) * 255)}, ${Math.round((v - 0.08) * 255)})`;
    }
    case 'nerve': {
      const g = 0.7 + (hash % 20) / 100;
      const b = 0.5 + (hash % 25) / 100;
      return `rgb(${Math.round(170 + (hash % 30))}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
    case 'ligament': {
      const v = 0.75 + (hash % 12) / 100;
      return `rgb(${Math.round(v * 255)}, ${Math.round((v - 0.08) * 255)}, ${Math.round((v - 0.25) * 255)})`;
    }
    case 'vessel': {
      const n = name.toLowerCase();
      if (n.includes('artery') || n.includes('arteria')) return '#cc3333';
      if (n.includes('vein') || n.includes('vena')) return '#3366cc';
      return '#cc4444';
    }
    case 'organ': {
      const r = 0.55 + (hash % 30) / 100;
      const g = 0.25 + (hash % 35) / 100;
      const b = 0.3 + (hash % 25) / 100;
      return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
    default:
      return '#cccccc';
  }
}

function normalizeDisplayName(rawName: string, partCategory: Category): string {
  let name = rawName
    .replace(/^Object_/, '')
    .replace(/^object_/, '')
    // Strip .r / .l side suffixes (GLTF convention for right/left)
    .replace(/\.r$/i, '')
    .replace(/\.l$/i, '')
    .replace(/\.r\./gi, '.')
    .replace(/\.l\./gi, '.')
    // Strip UUID patterns (e.g. fc6db192-f955-42fb-8048-6b61a0c29163)
    .replace(/[\s_-]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '')
    // Strip generic mesh IDs (mesh.424)
    .replace(/^mesh\.\d+$/i, '')
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!name) return 'Part';

  const objectMatch = name.match(/^object\s*(\d+)$/i);
  if (objectMatch) return `Object ${objectMatch[1]}`;

  // Strip " overlay" suffix (GLTF artifact)
  name = name.replace(/\s*overlay$/i, '');

  const title = name
    .split(' ')
    .map((word) => {
      if (!word) return word;
      const lower = word.toLowerCase();
      const stopWords = new Set(['of', 'the', 'and', 'to', 'for', 'in', 'on', 'a', 'an']);
      if (stopWords.has(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return title || partCategory.toUpperCase();
}

const ROOT_NODE_NAMES = new Set([
  '', 'mesh', 'group', 'sketchfab model', 'sketchfab_model', 'root',
  'scene', 'armature', 'bones', 'bones_right', 'cartilages_right',
  'muscles of abdomen', 'muscles of back', 'muscles of thorax',
  'muscles of upper limb', 'articular system', 'fascia',
]);

function isRootNodeName(name: string): boolean {
  const cleaned = name.trim().replace(/_/g, ' ').toLowerCase();
  return ROOT_NODE_NAMES.has(cleaned);
}

function getNodePath(mesh: THREE.Object3D): string[] {
  const path: string[] = [];
  const seen = new Set<string>();
  let current: THREE.Object3D | null = mesh;

  while (current) {
    const rawName = current.name?.trim();
    if (rawName) {
      const normalized = rawName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
      const key = normalized.toLowerCase();
      if (normalized && !seen.has(key)) {
        path.unshift(normalized);
        seen.add(key);
      }
    }
    current = current.parent;
  }

  return path;
}

function getNodeSignature(mesh: THREE.Object3D): string {
  const path = getNodePath(mesh);
  const meaningful = path.filter((value) => !isRootNodeName(value));
  const signature = meaningful.length ? meaningful.join('/') : mesh.name || 'unknown';
  return signature
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getNativeMeshName(mesh: THREE.Mesh): string {
  const path = getNodePath(mesh);
  const meaningful = path.filter((value) => !isRootNodeName(value));
  if (meaningful.length > 0) return meaningful[meaningful.length - 1];
  return mesh.name || 'unknown';
}

const UNILATERAL_PREFIXES = new Set([
  'upper-limb',
  'lower-limb',
  'hand',
  'rotator-cuff',
  'shoulder-complete',
  'elbow-complete',
  'upper-limb-bones',
  'shoulder-joints',
  'axio-appendicular',
  'arm-muscles',
  'forearm-muscles',
  'brachial-plexus',
  'radial-nerve',
  'median-nerve',
  'hip-complete',
  'knee-complete',
  'ankle-foot-complete',
  'lower-limb-attachments',
  'trunk-muscles',
  'full-trunk',
  'inguinal-femoral',
  'inguinal-femoral-hernia',
  'inguinal-ligament',
  'inguinal-canal',
  'pelvis-perineum',
]);

function isSkullMesh(name: string): boolean {
  const n = name.toLowerCase();
  const skullKeywords = [
    'ethmoid', 'frontal', 'concha', 'lacrimal', 'incisor', 'canine', 'molar',
    'premolar', 'mandible', 'maxilla', 'nasal', 'occipital', 'palatine', 'parietal',
    'sphenoid', 'temporal', 'tooth', 'teeth', 'vomer', 'zygomatic', 'skull', 'cranium'
  ];
  return skullKeywords.some((kw) => n.includes(kw));
}

function shouldMirrorMesh(mesh: THREE.Mesh, rawName: string, prefix: string): boolean {
  if (UNILATERAL_PREFIXES.has(prefix)) return true;
  const namesToCheck = [mesh.name, rawName, ...getNodePath(mesh)];
  for (const name of namesToCheck) {
    const n = name.toLowerCase();
    if (n.endsWith('.r') || n.endsWith('_r') || n.endsWith('.r.') || n.endsWith('_r.') || n.includes('.r_') || n.includes(' right')) {
      return true;
    }
  }
  return false;
}

function processScene(scene: THREE.Object3D, category: Category, prefix: string): Processed {
  const root = scene.clone(true) as THREE.Group;

  root.rotation.x = -Math.PI / 2;
  root.updateMatrixWorld(true);

  const meshesByPart = new Map<string, THREE.Mesh[]>();

  const meshesToProcess: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if (isMeshObj(obj)) meshesToProcess.push(obj);
  });

  for (const mesh of meshesToProcess) {
    const meshName = mesh.name.toLowerCase();
    if (REPRODUCTIVE_PATTERNS.some((pattern) => meshName.includes(pattern))) continue;
    if (isHiddenObject(mesh.name)) continue;

    const rawName = getNativeMeshName(mesh);
    const lookupPrefix = prefix === 'trunk-muscles' ? 'myology' : prefix;
    const lookupKey = `${lookupPrefix}_${mesh.name}`;
    const mapped = (nameMap as Record<string, string>)[lookupKey] || (nameMap as Record<string, string>)[`${lookupPrefix}_${rawName}`];

    // Filter skull if prefix is skull
    if (prefix === 'skull' || prefix === 'colored-skull' || prefix === 'exploded-skull' || prefix === 'skull-base') {
      const nameToCheck = (mapped || rawName || mesh.name).toLowerCase();
      if (!isSkullMesh(nameToCheck)) continue;
    }

    // Filter non-trunk muscles if loading trunk-muscles
    if (prefix === 'trunk-muscles') {
      const isTrunk = [
        'rectus abdominis', 'oblique', 'transversus abdominis',
        'erector', 'iliocostalis', 'longissimus', 'spinalis', 'multifidus',
        'quadratus lumborum', 'diaphragm', 'intercostal', 'pectoralis',
        'serratus', 'latissimus', 'trapezius', 'rhomboid', 'levator scapulae',
        'psoas', 'iliacus', 'pyramidalis', 'subclavius'
      ].some((kw) => (mapped || rawName).toLowerCase().includes(kw));

      if (!isTrunk) continue;
    }

    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((m) => m.clone())
      : mesh.material.clone();

    const partCategory = classifyNode(mesh.name, category);
    const layerColor = getLayerColor(mesh.name, partCategory);
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const m = mat as THREE.MeshStandardMaterial;
      m.color.set(layerColor);
      if (partCategory === 'tendon') {
        m.opacity = 0.85;
        m.transparent = true;
      } else if (partCategory === 'nerve') {
        m.opacity = 0.92;
        m.transparent = true;
      } else if (partCategory === 'vessel') {
        m.opacity = 0.9;
        m.transparent = true;
      } else {
        m.transparent = false;
        m.opacity = 1;
      }
      m.side = THREE.DoubleSide;
    }

    const nodeSignature = getNodeSignature(mesh);
    const uniqueSuffix = `${mesh.uuid || Math.random().toString(36).slice(2)}`;
    const partId = `${prefix}_${nodeSignature}_${uniqueSuffix}`;

    let displayName: string;
    if (rawName && !isRootNodeName(rawName)) {
      displayName = normalizeDisplayName(rawName, partCategory);
    } else if (mapped) {
      displayName = mapped;
    } else {
      displayName = normalizeDisplayName(rawName, partCategory);
    }

    mesh.userData.partId = partId;
    mesh.userData.partCategory = partCategory;
    mesh.userData.displayName = displayName;
    if (!meshesByPart.has(partId)) meshesByPart.set(partId, []);
    meshesByPart.get(partId)!.push(mesh);

    // Mirror unilateral / right-side meshes to construct the left side
    if (shouldMirrorMesh(mesh, rawName, prefix) && mesh.parent) {
      const mirrorGroup = new THREE.Group();
      mirrorGroup.scale.set(-1, 1, 1);
      const mirroredMesh = mesh.clone(true);
      mirroredMesh.userData.partId = partId;
      mirroredMesh.userData.partCategory = partCategory;
      mirroredMesh.userData.displayName = displayName;
      mirrorGroup.add(mirroredMesh);
      mesh.parent.add(mirrorGroup);
      meshesByPart.get(partId)!.push(mirroredMesh);
    }
  }

  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
  const fit = {
    scale,
    position: [
      -center.x * scale,
      -box.min.y * scale + FEET_Y,
      -center.z * scale,
    ] as [number, number, number],
    rotationY: 0,
  };

  const anchors: Record<string, [number, number, number]> = {};
  const tmp = new THREE.Box3();
  const c = new THREE.Vector3();
  for (const [partId, meshes] of meshesByPart) {
    tmp.makeEmpty();
    for (const mesh of meshes) tmp.expandByObject(mesh);
    if (tmp.isEmpty()) continue;
    tmp.getCenter(c);
    anchors[partId] = [
      fit.position[0] + c.x * scale,
      fit.position[1] + c.y * scale + 0.02,
      fit.position[2] + c.z * scale,
    ];
  }

  return { root, meshesByPart, fit, anchors };
}

const SELECT_EMISSIVE = new THREE.Color('#ffcc33');
const HOVER_EMISSIVE = new THREE.Color('#7fd4ff');
const NO_EMISSIVE = new THREE.Color('#000000');

function applyAppearance(
  p: Processed,
  s: {
    layerVisibility: Record<Category, boolean>;
    partVisibility: Record<string, boolean>;
    selectedId: string | null;
    hoveredId: string | null;
    displayMode: string;
    categoryFilter: string;
    searchQuery: string;
  },
) {
  const isolate = s.displayMode === 'isolate' && s.selectedId != null;
  const emphasize = s.displayMode === 'emphasize' && s.selectedId != null;
  const dim = s.displayMode === 'dim' && s.selectedId != null;
  const q = s.searchQuery.toLowerCase().trim();

  const setMesh = (
    mesh: THREE.Mesh,
    visible: boolean,
    selected: boolean,
    hovered: boolean,
    shouldDim: boolean,
  ) => {
    mesh.visible = visible;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const m = mat as THREE.MeshStandardMaterial;
      if (m.emissive) {
        if (selected) {
          m.emissive.copy(SELECT_EMISSIVE);
          m.emissiveIntensity = 0.55;
        } else if (hovered) {
          m.emissive.copy(HOVER_EMISSIVE);
          m.emissiveIntensity = 0.3;
        } else {
          m.emissive.copy(NO_EMISSIVE);
          m.emissiveIntensity = 0;
        }
      }
      if (shouldDim) {
        m.transparent = true;
        m.opacity = 0.16;
        m.depthWrite = false;
      } else {
        m.depthWrite = true;
      }
    }
  };

  for (const [partId, meshes] of p.meshesByPart) {
    const meshCat = (meshes[0]?.userData.partCategory as Category) || 'skeleton';
    const catLayerOn = s.layerVisibility[meshCat];
    const catFilterMatch = s.categoryFilter === 'all' || s.categoryFilter === meshCat;
    const displayName = (meshes[0]?.userData.displayName as string) || partId;
    const searchMatch =
      q === '' ||
      displayName.toLowerCase().includes(q) ||
      partId.toLowerCase().includes(q);
    const base = catLayerOn && s.partVisibility[partId] !== false && catFilterMatch && searchMatch;
    const selected = partId === s.selectedId;
    const hovered = partId === s.hoveredId;
    let visible = base;
    if (isolate) visible = base && selected;
    if (emphasize) visible = base;
    const shouldDim = (dim || emphasize) && !selected;
    for (const mesh of meshes) setMesh(mesh, visible, selected, hovered, shouldDim);
  }
}

interface CeoGlbModelProps {
  url: string;
  category: Category;
  prefix: string;
  applyFit?: boolean;
}

export function CeoGlbModel({ url, category, prefix, applyFit = true }: CeoGlbModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const processedRef = useRef<Processed | null>(null);

  const setPartAnchors = useCeoAnatomyStore((s) => s.setPartAnchors);
  const setPartCategories = useCeoAnatomyStore((s) => s.setPartCategories);
  const setPartDisplayNames = useCeoAnatomyStore((s) => s.setPartDisplayNames);
  const setModelFit = useCeoAnatomyStore((s) => s.setModelFit);
  const modelFit = useCeoAnatomyStore((s) => s.modelFit);
  const selectPart = useCeoAnatomyStore((s) => s.selectPart);
  const setHovered = useCeoAnatomyStore((s) => s.setHovered);
  const layerVisibility = useCeoAnatomyStore((s) => s.layerVisibility);
  const partVisibility = useCeoAnatomyStore((s) => s.partVisibility);
  const selectedId = useCeoAnatomyStore((s) => s.selectedPartId);
  const hoveredId = useCeoAnatomyStore((s) => s.hoveredPartId);
  const displayMode = useCeoAnatomyStore((s) => s.displayMode);
  const categoryFilter = useCeoAnatomyStore((s) => s.categoryFilter);
  const searchQuery = useCeoAnatomyStore((s) => s.searchQuery);

  const { scene } = useGLTF(url, DRACO_PATH);

  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // Clear previous models when switching
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    const p = processScene(scene, category, prefix);
    processedRef.current = p;
    setPartAnchors(p.anchors);
    const cats: Record<string, Category> = {};
    const names: Record<string, string> = {};
    for (const [partId, meshes] of p.meshesByPart) {
      const cat = meshes[0]?.userData.partCategory as Category | undefined;
      if (cat) cats[partId] = cat;
      const dn = meshes[0]?.userData.displayName as string | undefined;
      if (dn) names[partId] = dn;
    }
    setPartCategories(cats);
    setPartDisplayNames(names);
    groupRef.current.add(p.root);

    if (applyFit) {
      setModelFit(p.fit);
      groupRef.current.position.set(...p.fit.position);
      groupRef.current.scale.setScalar(p.fit.scale);
      groupRef.current.rotation.y = p.fit.rotationY;
    }
  }, [scene, url, category, prefix, applyFit, setPartAnchors, setPartCategories, setPartDisplayNames, setModelFit]);

  useEffect(() => {
    if (!applyFit && modelFit && groupRef.current) {
      groupRef.current.position.set(...modelFit.position);
      groupRef.current.scale.setScalar(modelFit.scale);
      groupRef.current.rotation.y = modelFit.rotationY;
    }
  }, [applyFit, modelFit]);

  useEffect(() => {
    if (!processedRef.current) return;
    applyAppearance(processedRef.current, {
      layerVisibility,
      partVisibility,
      selectedId,
      hoveredId,
      displayMode,
      categoryFilter,
      searchQuery,
    });
  }, [layerVisibility, partVisibility, selectedId, hoveredId, displayMode, categoryFilter, searchQuery]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 5) return;
    const mesh = e.object as THREE.Mesh;
    if (!mesh || !mesh.visible) return;

    const partId = mesh.userData.partId as string | undefined;
    if (!partId) return;

    const meshCat = mesh.userData.partCategory as Category | undefined;
    if (meshCat && layerVisibility[meshCat] === false) return;
    if (partVisibility[partId] === false) return;

    e.stopPropagation();
    selectPart(partId, true);
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    const mesh = e.object as THREE.Mesh;
    if (!mesh || !mesh.visible) return;

    const partId = mesh.userData.partId as string | undefined;
    if (!partId) return;

    const meshCat = mesh.userData.partCategory as Category | undefined;
    if (meshCat && layerVisibility[meshCat] === false) return;
    if (partVisibility[partId] === false) return;

    e.stopPropagation();
    setHovered(partId);
    document.body.style.cursor = 'pointer';
  };

  const handleOut = () => {
    setHovered(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    />
  );
}
