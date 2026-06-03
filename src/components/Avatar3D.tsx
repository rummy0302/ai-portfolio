"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function AvatarModel({
  isSpeaking,
}: {
  isSpeaking: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  const { scene } = useGLTF(
    "/models/Meshy_AI_Crimson_Confidence_0515040758_texture.glb"
  );

  useFrame((state) => {
    if (!group.current) return;

    // breathing animation
    group.current.position.y =
      Math.sin(state.clock.elapsedTime * 1.5) * 0.03;

    // subtle speaking movement
    if (isSpeaking) {
      group.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 3) * 0.04;
    } else {
      group.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
    }
  });

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={2.3}
        position={[0, -2.7, 0]}
      />
    </group>
  );
}

export default function Avatar3D({
  isSpeaking,
}: {
  isSpeaking: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Canvas
        camera={{
          position: [0, 0.15, 2.8],
          fov: 28,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={1.4} />

        <directionalLight
          position={[2, 5, 2]}
          intensity={2}
        />

        <pointLight
          position={[-2, 2, 2]}
          intensity={1.5}
          color="#60a5fa"
        />

        <pointLight
          position={[2, 1, 2]}
          intensity={0.8}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          {/* HDRI environment */}
          <Environment preset="city" />

          <AvatarModel isSpeaking={isSpeaking} />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}