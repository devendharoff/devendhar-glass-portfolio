"use client";

import React from "react";
import ParticleSphereAnimation from "@/components/ui/orbiting-circles-02-utils/particalsphear";

const orbits = [
  {
    size: "w-[260px] h-[260px] md:w-[440px] md:h-[440px]",
    duration: 18,
    icons: [
      { src: "https://api.iconify.design/logos:supabase-icon.svg", alt: "Supabase", angle: -60 },
      { src: "https://api.iconify.design/logos:google-gemini.svg", alt: "Gemini", angle: 0 },
      { src: "https://api.iconify.design/logos:make.svg", alt: "Make", angle: 60 },
    ],
  },
  {
    size: "w-[360px] h-[360px] md:w-[560px] md:h-[560px]",
    duration: 24,
    icons: [
      { src: "https://api.iconify.design/logos:figma.svg", alt: "Figma", angle: 0 },
      { src: "https://api.iconify.design/logos:slack-icon.svg", alt: "Slack", angle: -90 },
    ],
  },
  {
    size: "w-[460px] h-[460px] md:w-[680px] md:h-[680px]",
    duration: 30,
    icons: [
      { src: "https://api.iconify.design/logos:claude-icon.svg", alt: "Claude", angle: -60 },
      { src: "https://api.iconify.design/logos:react.svg", alt: "React", angle: 0 },
      { src: "https://api.iconify.design/logos:python.svg", alt: "Python", angle: 60 },
    ],
  },
];

export default function OrbitingCirclesGlobeDemo() {
  return (
    <div className="relative w-full h-[280px] md:h-[440px] overflow-hidden flex justify-center items-end">
      <style>{`
        @keyframes orbit-cw {
          from { transform: rotate(var(--start-angle)) }
          to   { transform: rotate(calc(var(--start-angle) + 360deg)) }
        }
        @keyframes orbit-ccw {
          from { transform: rotate(var(--start-angle)) }
          to   { transform: rotate(calc(var(--start-angle) - 360deg)) }
        }
        @keyframes counter-cw {
          from { transform: rotate(var(--counter-offset, 0deg)) }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) - 360deg)) }
        }
        @keyframes counter-ccw {
          from { transform: rotate(var(--counter-offset, 0deg)) }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) + 360deg)) }
        }
      `}</style>

      {/* Center particle globe */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 aspect-square pointer-events-none w-[200px] md:w-[360px] z-10">
        <ParticleSphereAnimation />
      </div>

      {/* Orbiting rings */}
      {orbits.map((orbit, index) => {
        const isCW = index % 2 === 0;
        const orbitAnim = isCW ? "orbit-cw" : "orbit-ccw";
        const counterAnim = isCW ? "counter-cw" : "counter-ccw";

        const allIcons = [
          ...orbit.icons,
          ...orbit.icons.map((ic) => ({
            ...ic,
            angle: ic.angle + 180,
            alt: `${ic.alt}-mirror`,
          })),
        ];

        return (
          <div
            key={index}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-white/10 ${orbit.size}`}
          >
            {allIcons.map((iconData, iconIndex) => (
              <div
                key={iconIndex}
                className="absolute top-0 left-1/2 h-1/2 -ml-8 origin-bottom flex flex-col justify-start items-center"
                style={
                  {
                    "--start-angle": `${iconData.angle}deg`,
                    animation: `${orbitAnim} ${orbit.duration}s linear infinite`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="p-2.5 sm:p-3.5 border border-white/15 rounded-full bg-[#08080c] shadow-[0_0_20px_rgba(0,85,255,0.2)] -mt-7 relative z-10"
                  style={
                    {
                      "--counter-offset": `${-iconData.angle}deg`,
                      animation: `${counterAnim} ${orbit.duration}s linear infinite`,
                    } as React.CSSProperties
                  }
                >
                  <img
                    src={iconData.src}
                    alt={iconData.alt}
                    width={32}
                    height={32}
                    className="w-5 h-5 md:w-7 md:h-7 object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
