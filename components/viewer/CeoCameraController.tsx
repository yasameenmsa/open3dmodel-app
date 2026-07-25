'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

const CAMERA_VIEWS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  front: { position: [0, 0.1, 14.5], target: [0, 0.1, 0] },
  back: { position: [0, 0.1, -14.5], target: [0, 0.1, 0] },
  left: { position: [-14.5, 0.1, 0], target: [0, 0.1, 0] },
  right: { position: [14.5, 0.1, 0], target: [0, 0.1, 0] },
  top: { position: [0, 16, 0.01], target: [0, 0.1, 0] },
  iso: { position: [10, 10, 10], target: [0, 0.1, 0] },
};

export function CeoCameraController() {
  const { camera, controls } = useThree();
  const cameraCommand = useCeoAnatomyStore((s) => s.cameraCommand);
  const setCameraState = useCeoAnatomyStore((s) => s.setCameraState);
  const bodyOrientation = useCeoAnatomyStore((s) => s.bodyOrientation);

  const targetPosition = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!cameraCommand) return;
    const { cmd } = cameraCommand;
    const orbitControls = controls as unknown as OrbitControlsImpl | null;

    if (cmd.type === 'preset') {
      const preset = CAMERA_VIEWS[cmd.preset] || CAMERA_VIEWS.front;
      targetPosition.current = new THREE.Vector3(...preset.position);
      targetLookAt.current = new THREE.Vector3(...preset.target);
      isAnimating.current = true;
    } else if (cmd.type === 'reset') {
      targetPosition.current = new THREE.Vector3(0, 0.1, 14.5);
      targetLookAt.current = new THREE.Vector3(0, 0.1, 0);
      isAnimating.current = true;
    } else if (cmd.type === 'focus') {
      const targetVec = new THREE.Vector3(...cmd.target);
      const dist = cmd.distance ?? 3.5;
      const currentDir = new THREE.Vector3().subVectors(camera.position, orbitControls ? orbitControls.target : new THREE.Vector3()).normalize();
      if (currentDir.length() === 0) currentDir.set(0, 0, 1);
      targetPosition.current = new THREE.Vector3().addVectors(targetVec, currentDir.multiplyScalar(dist));
      targetLookAt.current = targetVec;
      isAnimating.current = true;
    } else if (cmd.type === 'zoom') {
      if (orbitControls) {
        const dir = new THREE.Vector3().subVectors(camera.position, orbitControls.target);
        dir.multiplyScalar(cmd.factor);
        targetPosition.current = new THREE.Vector3().addVectors(orbitControls.target, dir);
        targetLookAt.current = orbitControls.target.clone();
        isAnimating.current = true;
      }
    }
  }, [cameraCommand, camera, controls]);

  useFrame(() => {
    const orbitControls = controls as unknown as OrbitControlsImpl | null;
    if (isAnimating.current && targetPosition.current && targetLookAt.current) {
      camera.position.lerp(targetPosition.current, 0.1);
      if (orbitControls) {
        orbitControls.target.lerp(targetLookAt.current, 0.1);
        orbitControls.update();
      }

      if (
        camera.position.distanceTo(targetPosition.current) < 0.01 &&
        (!orbitControls || orbitControls.target.distanceTo(targetLookAt.current) < 0.01)
      ) {
        isAnimating.current = false;
        targetPosition.current = null;
        targetLookAt.current = null;
      }
    }

    if (orbitControls) {
      setCameraState({
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [orbitControls.target.x, orbitControls.target.y, orbitControls.target.z],
        fov: (camera as THREE.PerspectiveCamera).fov,
      });
    }
  });

  return null;
}
