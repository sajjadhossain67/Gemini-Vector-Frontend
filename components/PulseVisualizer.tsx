"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Torus } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useTravelStore } from "@/store/travelStore";
import type { AgentState } from "@/types/travelTypes";

const STATE_CONFIG: Record<
  AgentState,
  {
    color: string;
    emissive: string;
    label: string;
    distort: number;
    speed: number;
    ringOpacity: number;
  }
> = {
  Idle: {
    color: "#3a3a3c",
    emissive: "#1c1c1e",
    label: "Standby",
    distort: 0.15,
    speed: 0.5,
    ringOpacity: 0.15,
  },
  Listening: {
    color: "#00d4ff",
    emissive: "#0080a0",
    label: "Listening",
    distort: 0.35,
    speed: 1.8,
    ringOpacity: 0.5,
  },
  Thinking: {
    color: "#ffd60a",
    emissive: "#a06000",
    label: "Thinking",
    distort: 0.45,
    speed: 2.2,
    ringOpacity: 0.6,
  },
  Searching: {
    color: "#bf5af2",
    emissive: "#6a00b0",
    label: "Searching",
    distort: 0.55,
    speed: 3.0,
    ringOpacity: 0.7,
  },
  Proposing: {
    color: "#ff9f0a",
    emissive: "#9a4000",
    label: "Proposing",
    distort: 0.3,
    speed: 1.5,
    ringOpacity: 0.55,
  },
  Speaking: {
    color: "#30d158",
    emissive: "#0a7030",
    label: "Speaking",
    distort: 0.4,
    speed: 2.0,
    ringOpacity: 0.6,
  },
  Executing: {
    color: "#FF3B30",
    emissive: "#8B0000",
    label: "Executing",
    distort: 0.72,
    speed: 5.0,
    ringOpacity: 1.0,
  },
};

function CoreOrb({
  agentState,
  audioLevel,
}: {
  agentState: AgentState;
  audioLevel: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cfg = STATE_CONFIG[agentState] ?? STATE_CONFIG.Idle;
  const targetColor = useMemo(() => new THREE.Color(cfg.color), [cfg.color]);
  const currentColor = useRef(new THREE.Color(cfg.color));

  useFrame((s) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    currentColor.current.lerp(targetColor, 0.05);
    mat.color.copy(currentColor.current);

    // Executing state: red flash pulsing emissive
    const isExecuting = agentState === "Executing";
    const flashIntensity = isExecuting
      ? 0.6 + Math.abs(Math.sin(s.clock.elapsedTime * 8)) * 0.8
      : 0.3 + audioLevel * 0.4;
    mat.emissive.copy(currentColor.current).multiplyScalar(flashIntensity);

    const baseScale = 1 + audioLevel * 0.15;
    const breathe = isExecuting
      ? 1 + Math.abs(Math.sin(s.clock.elapsedTime * 8)) * 0.1
      : 1 + Math.sin(s.clock.elapsedTime * 1.5) * 0.04;
    meshRef.current.scale.setScalar(baseScale * breathe);
    meshRef.current.rotation.y = s.clock.elapsedTime * 0.25;
    meshRef.current.rotation.x = s.clock.elapsedTime * 0.09;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <MeshDistortMaterial
        color={cfg.color}
        emissive={cfg.emissive}
        emissiveIntensity={0.5}
        roughness={0.05}
        metalness={0.6}
        distort={cfg.distort}
        speed={cfg.speed}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

function OrbitRings({ agentState }: { agentState: AgentState }) {
  const refs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];
  const cfg = STATE_CONFIG[agentState] ?? STATE_CONFIG.Idle;
  const color = new THREE.Color(cfg.color);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (refs[0].current) {
      refs[0].current.rotation.x = t * 0.6;
      refs[0].current.rotation.y = t * 0.3;
    }
    if (refs[1].current) {
      refs[1].current.rotation.y = t * 0.8;
      refs[1].current.rotation.z = t * 0.4;
    }
    if (refs[2].current) {
      refs[2].current.rotation.x = -t * 0.5;
      refs[2].current.rotation.z = t * 0.6;
    }
  });

  const radii = [2.0, 2.8, 3.6];
  const tubes = [0.018, 0.013, 0.009];

  return (
    <>
      {refs.map((ref, i) => (
        <Torus
          key={i}
          ref={ref as React.Ref<THREE.Mesh>}
          args={[radii[i], tubes[i], 8, 120]}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={cfg.ringOpacity * (1 - i * 0.15)}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </Torus>
      ))}
    </>
  );
}

function AudioBars({
  audioLevel,
  agentState,
}: {
  audioLevel: number;
  agentState: AgentState;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const cfg = STATE_CONFIG[agentState] ?? STATE_CONFIG.Idle;
  const color = new THREE.Color(cfg.color);
  const barCount = 24;

  const meshRefs = useRef<THREE.Mesh[]>([]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle = (i / barCount) * Math.PI * 2;
      const wave = Math.sin(t * 3 + i * 0.5) * 0.5 + 0.5;
      const h = 0.05 + wave * audioLevel * 0.6 + 0.04;
      mesh.scale.y = h;
      mesh.position.x = Math.cos(angle) * 1.75;
      mesh.position.z = Math.sin(angle) * 1.75;
      mesh.lookAt(0, mesh.position.y, 0);
      mesh.position.y = h * 0.5 - 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: barCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshRefs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.04, 1, 0.04]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function CoronaParticles({ agentState }: { agentState: AgentState }) {
  const ref = useRef<THREE.Points>(null);
  const cfg = STATE_CONFIG[agentState] ?? STATE_CONFIG.Idle;
  const color = new THREE.Color(cfg.color);

  const positions = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 2.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.1;
      ref.current.rotation.x = s.clock.elapsedTime * 0.06;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.04}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useFrame((s) => {
    camera.position.x = Math.sin(s.clock.elapsedTime * 0.08) * 0.6;
    camera.position.y = Math.cos(s.clock.elapsedTime * 0.06) * 0.4;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({
  agentState,
  audioLevel,
}: {
  agentState: AgentState;
  audioLevel: number;
}) {
  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight
        position={[0, 0, 3]}
        intensity={2}
        color={STATE_CONFIG[agentState]?.color ?? "#fff"}
      />
      <CameraSetup />
      <CoreOrb agentState={agentState} audioLevel={audioLevel} />
      <OrbitRings agentState={agentState} />
      <AudioBars audioLevel={audioLevel} agentState={agentState} />
      <CoronaParticles agentState={agentState} />
      <EffectComposer>
        <Bloom
          intensity={2.5}
          luminanceThreshold={0.0}
          luminanceSmoothing={0.85}
        />
      </EffectComposer>
    </>
  );
}

export default function PulseVisualizer() {
  const agentState = useTravelStore((s) => s.agentState);
  const audioLevel = useTravelStore((s) => s.audioLevel);
  const cfg = STATE_CONFIG[agentState] ?? STATE_CONFIG.Idle;

  // Simulate audio level in demo mode
  const simLevel = useRef(0);
  const displayLevel = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (agentState !== "Idle") {
        simLevel.current = Math.random() * 0.7 + 0.1;
      } else {
        simLevel.current = 0;
      }
    }, 80);
    return () => clearInterval(id);
  }, [agentState]);

  const effectiveLevel = audioLevel > 0.01 ? audioLevel : simLevel.current;

  return (
    <div className="relative flex flex-col items-center justify-between h-full">
      {/* State label */}
      <div className="flex items-center gap-2 self-start">
        <div
          className="w-2 h-2 rounded-full animate-glow-pulse"
          style={{
            backgroundColor: cfg.color,
            boxShadow: `0 0 8px ${cfg.color}`,
          }}
        />
        <span
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{ color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Three.js Canvas */}
      <div className="flex-1 w-full min-h-0 relative">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 50 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent" }}
          dpr={[1, 2]}
        >
          <Scene agentState={agentState} audioLevel={effectiveLevel} />
        </Canvas>
      </div>

      {/* Audio level bar */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] text-white/30 font-medium">
          <span>AUDIO INPUT</span>
          <span>{Math.round(effectiveLevel * 100)}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${effectiveLevel * 100}%`,
              background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}dd)`,
              boxShadow: `0 0 8px ${cfg.color}80`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
