"use client"

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from "react"

const useIsStaticRenderer = () => false

export interface ProjectSlide {
  num: string
  category: string
  title: string
  desc: string
  url: string
  accent: string // CSS color string for the accent glow e.g. "#3b82f6"
}

type AutoplayDir = "leftToRight" | "rightToLeft"

interface ProjectCoverflowProps {
  projects: ProjectSlide[]
  cardWidth?: number
  cardHeight?: number
  radius?: number
  tilt?: number
  sideTilt?: number
  gap?: number
  opacity?: number
  transition?: {
    duration?: number
    delay?: number
    ease?: number[] | string
  }
  autoplay?: boolean
  autoplayDirection?: AutoplayDir
  style?: CSSProperties
}

const PERSPECTIVE = 1600
const SCALE_STEP = 0.16
const MAX_VISIBLE = 2
const DEPTH = 240

function cssTransition(t: ProjectCoverflowProps["transition"]): {
  dur: number
  ease: string
} {
  const dur = t && typeof t.duration === "number" ? t.duration : 0.6
  let ease = "cubic-bezier(0.22, 1, 0.36, 1)"
  const e = t?.ease
  if (Array.isArray(e) && e.length === 4) {
    ease = `cubic-bezier(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]})`
  } else if (typeof e === "string") {
    const map: Record<string, string> = {
      linear: "linear", easeIn: "ease-in", easeOut: "ease-out", easeInOut: "ease-in-out",
    }
    ease = map[e] || "ease"
  }
  return { dur, ease }
}

export default function ProjectCoverflow({
  projects,
  cardWidth = 420,
  cardHeight = 500,
  radius = 16,
  tilt = 12,
  sideTilt = 6,
  gap = 9,
  opacity = 55,
  transition,
  autoplay = false,
  autoplayDirection = "rightToLeft",
  style,
}: ProjectCoverflowProps) {
  const isStatic = useIsStaticRenderer()
  const n = projects.length
  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive((a) => Math.max(0, Math.min(n - 1, a)))
  }, [n])

  const moveDur = transition?.duration ?? 0.6
  const lockRef = useRef(false)
  const lock = useCallback(() => {
    lockRef.current = true
    window.setTimeout(() => { lockRef.current = false }, Math.max(50, moveDur * 1000))
  }, [moveDur])

  const step = useCallback((dir: number) => {
    if (lockRef.current) return
    lock()
    setActive((a) => (((a + dir) % n) + n) % n)
  }, [n, lock])

  const handleCardClick = useCallback((i: number) => {
    if (isStatic || lockRef.current) return
    if (i === active) {
      window.open(projects[i].url, "_blank", "noreferrer")
      return
    }
    lock()
    setActive(i)
  }, [isStatic, active, projects, lock])

  const delay = transition?.delay ?? 2.5
  useEffect(() => {
    if (isStatic || !autoplay || n < 2) return
    const ms = Math.max(0.3, delay) * 1000
    const dir = autoplayDirection === "leftToRight" ? -1 : 1
    const id = window.setInterval(() => step(dir), ms)
    return () => window.clearInterval(id)
  }, [isStatic, autoplay, autoplayDirection, delay, n, step])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1) }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1) }
  }, [step])

  const { dur, ease } = cssTransition(transition)
  const transitionCss = `transform ${dur}s ${ease}, opacity ${dur}s ${ease}`
  const effectiveRadius = radius
  const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100

  return (
    <div
      style={{
        ...(style || {}),
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 320,
        minHeight: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: `${PERSPECTIVE}px`,
        overflow: "visible",
        outline: "none",
      }}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      onKeyDown={isStatic ? undefined : onKeyDown}
    >
      <div
        style={{
          position: "relative",
          width: cardWidth,
          height: cardHeight,
          transformStyle: "preserve-3d",
        }}
      >
        {projects.map((project, i) => {
          let rel = i - active
          if (rel > n / 2) rel -= n
          if (rel < -n / 2) rel += n

          const ax = Math.abs(rel)
          const visible = ax <= MAX_VISIBLE
          const isActive = rel === 0
          const sc = Math.max(0.4, 1 - ax * SCALE_STEP)
          const tx = rel * (gap * 30)
          const tz = -ax * DEPTH
          const ry = -rel * tilt
          const rz = rel * sideTilt

          return (
            <div
              key={i}
              onClick={isStatic ? undefined : () => handleCardClick(i)}
              aria-label={project.title}
              aria-hidden={!visible}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: cardWidth,
                height: cardHeight,
                borderRadius: effectiveRadius,
                overflow: "hidden",
                transformStyle: "preserve-3d",
                transformOrigin: "center center",
                transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
                transition: transitionCss,
                opacity: visible ? 1 : 0,
                cursor: isActive ? "pointer" : "pointer",
                pointerEvents: visible && !isStatic ? "auto" : "none",
                // Glass card background
                background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                backdropFilter: "blur(24px)",
                border: isActive
                  ? `1px solid rgba(255,255,255,0.12)`
                  : "1px solid rgba(255,255,255,0.05)",
                boxShadow: isActive
                  ? `0 0 60px -10px ${project.accent}40, 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`
                  : "0 16px 40px rgba(0,0,0,0.4)",
              }}
            >
              {/* Accent glow top bar */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${project.accent}, transparent)`,
                opacity: isActive ? 1 : 0.3,
                transition: `opacity ${dur}s ${ease}`,
              }} />

              {/* Card content */}
              <div style={{
                position: "absolute",
                inset: 0,
                padding: "40px 36px 36px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                {/* Top: number + category */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                    <span style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: project.accent,
                      opacity: isActive ? 1 : 0.5,
                      transition: `opacity ${dur}s ${ease}`,
                    }}>{project.category}</span>
                    <span style={{
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.2)",
                      fontWeight: 300,
                    }}>{project.num}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: isActive ? 36 : 30,
                    fontWeight: 300,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                    margin: 0,
                    transition: `font-size ${dur}s ${ease}, color ${dur}s ${ease}`,
                  }}>{project.title}</h3>
                </div>

                {/* Middle: divider + description */}
                <div>
                  <div style={{
                    width: "100%",
                    height: 1,
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: 20,
                  }} />
                  <p style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 300,
                    lineHeight: 1.65,
                    color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                    margin: 0,
                    transition: `color ${dur}s ${ease}`,
                  }}>{project.desc}</p>
                </div>

                {/* Bottom: CTA */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: isActive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
                    transition: `color ${dur}s ${ease}`,
                  }}>
                    {isActive ? "Click to visit →" : "Click to focus"}
                  </span>
                  {/* Arrow circle */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `1px solid ${isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: `border-color ${dur}s ${ease}`,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(-45deg)", transition: `stroke ${dur}s ${ease}` }}>
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dim overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "#000",
                opacity: isActive ? 0 : dim,
                transition: `opacity ${dur}s ${ease}`,
                pointerEvents: "none",
                borderRadius: effectiveRadius,
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
