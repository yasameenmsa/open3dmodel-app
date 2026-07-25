'use client';

import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Grid, OrbitControls } from '@react-three/drei';
import { CeoAnatomyModel } from './CeoAnatomyModel';
import { CeoLabelRenderer } from './CeoLabelRenderer';
import { CeoCameraController } from './CeoCameraController';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-950/90 backdrop-blur-md z-30">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-white/90">Loading 3D Anatomy Model...</p>
        <p className="text-xs text-white/50 mt-1">Parsing meshes, textures and clinical anchors</p>
      </div>
    </div>
  );
}

function SceneContent() {
  const selectPart = useCeoAnatomyStore((s) => s.selectPart);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: [0, 0.1, 14.5], fov: 45, near: 0.05, far: 500 }}
      onPointerMissed={() => selectPart(null)}
    >
      <Stars radius={40} depth={30} count={1200} factor={2.2} saturation={0} fade speed={0.5} />
      <Grid
        position={[0, -0.92, 0]}
        args={[14, 14]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#1b2a44"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#31507d"
        fadeDistance={14}
        fadeStrength={1.4}
        infiniteGrid
        followCamera={false}
      />
      <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#243150" />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#bcd3ff" />
      <Suspense fallback={null}>
        <CeoAnatomyModel />
      </Suspense>
      <CeoLabelRenderer />
      <CeoCameraController />
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={0.5} maxDistance={300} />
    </Canvas>
  );
}

export default function CeoAnatomyScene({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className="relative w-full h-full">
      <Suspense fallback={<LoadingFallback />}>
        <SceneContent />
      </Suspense>
    </div>
  );
}
