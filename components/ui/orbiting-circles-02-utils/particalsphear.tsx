"use client";

import dynamic from "next/dynamic";

const ParticleSphereRefactor = dynamic(
  () => import("@/components/ui/particle-sphere"),
  { ssr: false }
);

export default function ParticleSphereAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <ParticleSphereRefactor
        particlesCount={1200}
        particleScale={3}
        scale={1.2}
        speed={0.5}
        sphereColor="#0055ff"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
