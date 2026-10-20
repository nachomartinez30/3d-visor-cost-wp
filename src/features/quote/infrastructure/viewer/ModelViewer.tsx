import { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Grid, OrbitControls } from '@react-three/drei';
import type { BufferGeometry } from 'three';
import { buildOverhangGeometry } from './overhangGeometry';

export interface ModelViewerProps {
  readonly geometry: BufferGeometry;
  readonly color: string;
  readonly showOverhangs: boolean;
  readonly overhangAngleDeg: number;
  readonly buildVolumeMm: { readonly x: number; readonly y: number; readonly z: number };
  readonly label: string;
}

const cssVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

/**
 * three.js viewer. Z is up (printer convention). The model is already centred on the
 * plate by the loader; <Bounds> fits the camera to it.
 */
export default function ModelViewer({ geometry, color, showOverhangs, overhangAngleDeg, buildVolumeMm, label }: ModelViewerProps) {
  const overhangs = useMemo(
    () => (showOverhangs ? buildOverhangGeometry(geometry, overhangAngleDeg) : null),
    [geometry, overhangAngleDeg, showOverhangs],
  );
  useEffect(() => () => overhangs?.dispose(), [overhangs]);
  const radius = geometry.boundingSphere?.radius ?? 50;
  const gridColor = cssVar('--color-viewer-grid', '#9aa5b8');
  const overhangColor = cssVar('--color-overhang', '#e5383b');

  return (
    <div className="viewer__canvas" role="img" aria-label={label}>
      <Canvas
        camera={{ up: [0, 0, 1], position: [radius * 2, -radius * 2.2, radius * 1.6], near: 0.1, far: 10_000, fov: 40 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[200, -150, 300]} intensity={1.2} />
        <directionalLight position={[-200, 200, 100]} intensity={0.4} />
        <Grid
          rotation={[Math.PI / 2, 0, 0]}
          args={[buildVolumeMm.x, buildVolumeMm.y]}
          cellSize={10}
          sectionSize={50}
          cellColor={gridColor}
          sectionColor={gridColor}
          fadeDistance={Math.max(buildVolumeMm.x, buildVolumeMm.y) * 3}
          infiniteGrid={false}
        />
        <Bounds fit clip observe margin={1.4}>
          <mesh geometry={geometry}>
            <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
          </mesh>
        </Bounds>
        {overhangs && (
          <mesh geometry={overhangs}>
            <meshStandardMaterial color={overhangColor} polygonOffset polygonOffsetFactor={-2} />
          </mesh>
        )}
        <OrbitControls makeDefault enableDamping />
      </Canvas>
    </div>
  );
}
