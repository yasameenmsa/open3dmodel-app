'use client';

import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import { OPEN3D_MODELS } from '@/data/open3dModels';
import { CeoGlbModel } from './CeoGlbModel';
import * as THREE from 'three';

export function CeoAnatomyModel() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyOrientation = useCeoAnatomyStore((s) => s.bodyOrientation);
  const modelKey = useCeoAnatomyStore((s) => s.modelKey);
  const targetRotation = useRef(Math.PI / 2);

  targetRotation.current = bodyOrientation === 'supine' ? 0 : Math.PI / 2;

  useFrame(() => {
    if (!groupRef.current) return;
    const current = groupRef.current.rotation.x;
    const target = targetRotation.current;
    const diff = target - current;
    if (Math.abs(diff) > 0.001) {
      groupRef.current.rotation.x = current + diff * 0.08;
    } else {
      groupRef.current.rotation.x = target;
    }
  });

  const activeModelOption = OPEN3D_MODELS.find((m) => m.key === modelKey) || OPEN3D_MODELS[0];

  const isFullBody = modelKey === 'full-anatomy';

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      <Suspense fallback={null}>
        {isFullBody ? (
          <>
            <CeoGlbModel
              key="full-skeleton"
              url="/models/open3d/overview-skeleton.glb"
              category="skeleton"
              prefix="overview-skeleton"
              applyFit
            />
            <CeoGlbModel
              key="full-trunk"
              url="/models/open3d/muscles-thorax-abdomen.glb"
              category="muscle"
              prefix="full-trunk"
              applyFit={false}
            />
            <CeoGlbModel
              key="full-upper-limb"
              url="/models/open3d/upper-limb.glb"
              category="muscle"
              prefix="upper-limb"
              applyFit={false}
            />
            <CeoGlbModel
              key="full-lower-limb"
              url="/models/open3d/lower-limb.glb"
              category="muscle"
              prefix="lower-limb"
              applyFit={false}
            />
          </>
        ) : (
          <CeoGlbModel
            key={activeModelOption.key}
            url={activeModelOption.file}
            category="muscle"
            prefix={activeModelOption.key}
            applyFit
          />
        )}
      </Suspense>
    </group>
  );
}
