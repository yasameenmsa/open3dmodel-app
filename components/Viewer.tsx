'use client';
import React, { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import styles from '../app/page.module.css';

type PartKey = 'head' | 'torso' | 'pelvis' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

type SceneModel = 'anatomy-sketch' | 'rotator-cuff' | 'upper-limb' | 'lower-limb' | 'trunk';

type ModelOption = {
  key: SceneModel;
  label: string;
  description: string;
};

const modelOptions: ModelOption[] = [
  { key: 'anatomy-sketch', label: 'Anatomy sketch', description: 'Simple anatomy overview for rapid browsing' },
  { key: 'rotator-cuff', label: 'Rotator cuff', description: 'Detailed shoulder musculature model' },
  { key: 'upper-limb', label: 'Upper limb', description: 'Upper extremity anatomy' },
  { key: 'lower-limb', label: 'Lower limb', description: 'Lower extremity anatomy' },
  { key: 'trunk', label: 'Trunk', description: 'Thorax, abdomen and back model' },
];

type PartDefinition = {
  key: PartKey;
  label: string;
  color: string;
  geometry: 'box' | 'sphere' | 'cylinder';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
};

const parts: PartDefinition[] = [
  { key: 'head', label: 'Head', color: '#f7d2b7', geometry: 'sphere', position: [0, 2.2, 0], scale: [0.55, 0.6, 0.55] },
  { key: 'torso', label: 'Torso', color: '#4f7cff', geometry: 'box', position: [0, 1.05, 0], scale: [1.05, 1.25, 0.7] },
  { key: 'pelvis', label: 'Pelvis', color: '#74b3ff', geometry: 'box', position: [0, 0.35, 0], scale: [0.8, 0.45, 0.6] },
  { key: 'leftArm', label: 'Left arm', color: '#f3b1a2', geometry: 'cylinder', position: [-1.2, 1.2, 0], rotation: [0, 0, 0.8], scale: [0.22, 0.95, 0.22] },
  { key: 'rightArm', label: 'Right arm', color: '#f3b1a2', geometry: 'cylinder', position: [1.2, 1.2, 0], rotation: [0, 0, -0.8], scale: [0.22, 0.95, 0.22] },
  { key: 'leftLeg', label: 'Left leg', color: '#4bd4c4', geometry: 'cylinder', position: [-0.35, -0.35, 0], rotation: [0, 0, 0.25], scale: [0.22, 0.95, 0.22] },
  { key: 'rightLeg', label: 'Right leg', color: '#4bd4c4', geometry: 'cylinder', position: [0.35, -0.35, 0], rotation: [0, 0, -0.25], scale: [0.22, 0.95, 0.22] },
];

function GLBScene({ modelKey }: { modelKey: SceneModel }) {
  const modelPath =
    modelKey === 'rotator-cuff'
      ? '/models/open3d/rotator-cuff.glb'
      : modelKey === 'upper-limb'
        ? '/models/open3d/upper-limb.glb'
        : '/models/open3d/lower-limb.glb';

  const { scene } = useGLTF(modelPath);

  return (
    <primitive object={scene} scale={1.8} position={[0, 0, 0]} />
  );
}

function Scene({ selectedPart, isolatedPart, modelKey }: { selectedPart: PartKey | null; isolatedPart: PartKey | null; modelKey: SceneModel }) {
  if (modelKey !== 'anatomy-sketch') {
    return (
      <>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 3, 4]} intensity={1.1} />
        <directionalLight position={[-5, 2, 4]} intensity={0.4} />
        <GLBScene modelKey={modelKey} />
      </>
    );
  }
  const visibleParts = useMemo(() => {
    if (!isolatedPart) {
      return parts;
    }
    return parts.filter((part) => part.key === isolatedPart);
  }, [isolatedPart]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 7, 4]} intensity={1.05} />
      <directionalLight position={[-3, 2, 4]} intensity={0.4} />
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[5, 0.15, 5]} />
        <meshStandardMaterial color="#16233d" />
      </mesh>
      {visibleParts.map((part) => {
        const isSelected = selectedPart === part.key;
        const shapeScale = isSelected
          ? (part.scale.map((value) => value * 1.06) as [number, number, number])
          : part.scale;

        return (
          <mesh key={part.key} position={part.position} rotation={part.rotation ?? [0, 0, 0]} scale={shapeScale}>
            {part.geometry === 'sphere' ? <sphereGeometry args={[1, 32, 32]} /> : part.geometry === 'cylinder' ? <cylinderGeometry args={[1, 1, 1, 24]} /> : <boxGeometry args={[1, 1, 1]} />}
            <meshStandardMaterial
              color={isSelected ? '#ffffff' : part.color}
              emissive={isSelected ? '#1d4ed8' : '#000000'}
              emissiveIntensity={isSelected ? 0.35 : 0}
              roughness={0.35}
              metalness={0.08}
            />
          </mesh>
        );
      })}
    </>
  );
}

export default function Viewer() {
  const [selectedPart, setSelectedPart] = useState<PartKey | null>('torso');
  const [isolatedPart, setIsolatedPart] = useState<PartKey | null>(null);
  const [modelKey, setModelKey] = useState<SceneModel>('rotator-cuff');
  const [sceneVersion, setSceneVersion] = useState(0);

  const activePart = parts.find((part) => part.key === selectedPart);

  const bumpScene = () => setSceneVersion((value) => value + 1);

  const handleIsolateSelected = () => {
    if (selectedPart) {
      setIsolatedPart(selectedPart);
    } else {
      setIsolatedPart(null);
    }
    bumpScene();
  };

  const handleShowAll = () => {
    setIsolatedPart(null);
    setSelectedPart(null);
    bumpScene();
  };

  const handleSelectPart = (partKey: PartKey) => {
    setSelectedPart(partKey);
    setIsolatedPart(null);
    bumpScene();
  };

  return (
    <div className={styles.viewerShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Anatomy explorer</div>
        <div className={styles.toolbar}>
          <button className={`${styles.toolbarButton} ${styles.toolbarButtonPrimary}`} onClick={handleIsolateSelected}>
            Isolate selected
          </button>
          <button className={styles.toolbarButton} onClick={handleShowAll}>
            Show all
          </button>
        </div>
        <div className={styles.partList}>
          {modelOptions.map((option) => (
            <button
              key={option.key}
              className={`${styles.partButton} ${modelKey === option.key ? styles.partButtonActive : ''}`}
              onClick={() => setModelKey(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className={styles.partList}>
          {parts.map((part) => (
            <button
              key={part.key}
              className={`${styles.partButton} ${selectedPart === part.key ? styles.partButtonActive : ''}`}
              onClick={() => handleSelectPart(part.key)}
            >
              {part.label}
            </button>
          ))}
        </div>
        <p className={styles.helperText}>
          Select a structure, then isolate it to focus. The scene keeps navigation available so you can inspect anatomy from any angle.
        </p>
        <div className={styles.helperText}>
          <strong>Selected:</strong> {activePart?.label ?? 'None'}
        </div>
      </aside>
      <div className={styles.viewerCard}>
        <Canvas camera={{ position: [0, 1.35, 5], fov: 45 }}>
          <Suspense fallback={<Html center>Loading anatomy view…</Html>}>
            <Scene key={sceneVersion} selectedPart={selectedPart} isolatedPart={isolatedPart} modelKey={modelKey} />
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
