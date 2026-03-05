"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useTravelStore } from "@/store/travelStore";

const STATE_COLORS: Record<string, string> = {
  Idle: "#636366",
  Listening: "#00d4ff",
  Thinking: "#ffd60a",
  Searching: "#bf5af2",
  Proposing: "#ff9f0a",
  Speaking: "#30d158",
  Executing: "#ff6b35",
};

function Starfield() {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 4000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 18 + Math.random() * 30;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const b = 0.4 + Math.random() * 0.6;
      col[i * 3] = b * 0.7;
      col[i * 3 + 1] = b * 0.85;
      col[i * 3 + 2] = b;
    }
    return [pos, col];
  }, []);

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.008;
      ref.current.rotation.x = s.clock.elapsedTime * 0.003;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function NebulaBlob({
  position,
  color,
  radius,
  speed,
}: {
  position: [number, number, number];
  color: string;
  radius: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.position.y =
        position[1] + Math.sin(s.clock.elapsedTime * speed) * 1.2;
      ref.current.rotation.z = s.clock.elapsedTime * speed * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.025}
        depthWrite={false}
      />
    </mesh>
  );
}

function NodeNetwork({ agentState }: { agentState: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const colorHex = STATE_COLORS[agentState] ?? STATE_COLORS.Idle;
  const color = useMemo(() => new THREE.Color(colorHex), [colorHex]);

  const { nodePos, edgeGeo } = useMemo(() => {
    const count = 70;
    const nodePos: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      nodePos.push([
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 9,
        (Math.random() - 0.5) * 7,
      ]);
    }
    const verts: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = nodePos[i][0] - nodePos[j][0];
        const dy = nodePos[i][1] - nodePos[j][1];
        const dz = nodePos[i][2] - nodePos[j][2];
        if (
          Math.sqrt(dx * dx + dy * dy + dz * dz) < 3.8 &&
          verts.length < 1200
        ) {
          verts.push(...nodePos[i], ...nodePos[j]);
        }
      }
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(verts, 3),
    );
    return { nodePos, edgeGeo };
  }, []);

  useFrame((s) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = s.clock.elapsedTime * 0.04;
      groupRef.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.02) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {nodePos.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} />
        </mesh>
      ))}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

function Scene() {
  const agentState = useTravelStore((s) => s.agentState);
  return (
    <>
      <Starfield />
      <NebulaBlob
        position={[-9, 3, -6]}
        color="#007AFF"
        radius={5}
        speed={0.12}
      />
      <NebulaBlob
        position={[9, -4, -10]}
        color="#BF5AF2"
        radius={4}
        speed={0.09}
      />
      <NebulaBlob
        position={[2, 6, -14]}
        color="#00D4FF"
        radius={6.5}
        speed={0.07}
      />
      <NebulaBlob
        position={[-4, -6, -8]}
        color="#30D158"
        radius={3.5}
        speed={0.14}
      />
      <NodeNetwork agentState={agentState} />
      <EffectComposer>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.08}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 58 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{
          background:
            "linear-gradient(135deg, #050508 0%, #080c18 40%, #050508 100%)",
        }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
