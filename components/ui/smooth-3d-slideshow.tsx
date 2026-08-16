"use client"

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type CSSProperties,
} from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

const useIsStaticRenderer = () => false

export interface ProjectSlide {
  num: string
  category: string
  title: string
  desc: string
  url: string
  thumb: string
  tags: string[]
  accent: string
}

export interface Smooth3DSlideshowProps {
  slides?: ProjectSlide[]
  cardWidth?: number
  cardHeight?: number
  gap?: number
  tiltY?: number
  autoplay?: boolean
  autoplayInterval?: number
  style?: CSSProperties
}

const DEFAULT_PROJECTS: ProjectSlide[] = [
  {
    num: "01",
    category: "CREATOR PLATFORM",
    title: "NoMoreDMS",
    desc: "Eliminate unnecessary direct messages with a single hub for resources, links, and digital products.",
    url: "https://nomoredms.vercel.app/",
    thumb: "/images/projects/nomoredms.png",
    tags: ["Next.js", "React", "Tailwind", "TypeScript"],
    accent: "from-blue-500/20 to-cyan-500/20",
  },
  {
    num: "02",
    category: "EDUCATION PLATFORM",
    title: "EduCalc",
    desc: "Educational math tool platform helping students calculate and run logic tasks via a student-friendly UI.",
    url: "https://educalc-expert0509.vercel.app/",
    thumb: "/images/projects/educalc.png",
    tags: ["React", "JavaScript", "Tailwind", "Math Engine"],
    accent: "from-purple-500/20 to-violet-500/20",
  },
  {
    num: "03",
    category: "PERSONAL BRANDING",
    title: "Personal Portfolio",
    desc: "A premium interactive website with cursor masks, custom layout layers, and motion physics transitions.",
    url: "https://devendhargopagoni.netlify.app/",
    thumb: "/images/projects/personalportfolio.jpg",
    tags: ["GSAP", "Next.js", "Tailwind", "Three.js"],
    accent: "from-emerald-500/20 to-teal-500/20",
  },
  {
    num: "04",
    category: "LEARNING PLATFORM",
    title: "PostLearn",
    desc: "A modern learning platform delivering educational content through an intuitive and engaging interface.",
    url: "https://postlearn-lake.vercel.app/",
    thumb: "/images/projects/postlearn.png",
    tags: ["React", "TypeScript", "Tailwind", "REST API"],
    accent: "from-orange-500/20 to-amber-500/20",
  },
  {
    num: "05",
    category: "CAFÉ & HOSPITALITY",
    title: "Cozy Cafe",
    desc: "Bespoke cafe website featuring online menus, ambiance image galleries, and table reservation flows.",
    url: "https://cozy-cafa1.netlify.app/",
    thumb: "/images/projects/cozy-cafe.png",
    tags: ["HTML5", "CSS3", "JavaScript", "Responsive UI"],
    accent: "from-amber-500/20 to-yellow-500/20",
  },
  {
    num: "06",
    category: "CLIENT PORTFOLIO",
    title: "Akshith Portfolio",
    desc: "Personal portfolio built for a client to establish strong digital presence with modern animations.",
    url: "https://maatoori-akshith.netlify.app/",
    thumb: "/images/projects/maatoori-akshith.jpg",
    tags: ["React", "Framer Motion", "Tailwind"],
    accent: "from-pink-500/20 to-rose-500/20",
  },
  {
    num: "07",
    category: "CORPORATE WEBSITE",
    title: "TeamZ Corporate",
    desc: "A corporate business website presenting company services professionally with clean responsive sections.",
    url: "https://teamz09.netlify.app/",
    thumb: "/images/projects/teamz.png",
    tags: ["Next.js", "Tailwind CSS", "SEO Optimized"],
    accent: "from-indigo-500/20 to-blue-500/20",
  },
]

const PERSPECTIVE = 1400
const MAX_VISIBLE = 2

export default function Smooth3DSlideshow({
  slides = DEFAULT_PROJECTS,
  cardWidth = 380,
  cardHeight = 470,
  gap = 320,
  tiltY = 32,
  autoplay = true,
  autoplayInterval = 4000,
  style,
}: Smooth3DSlideshowProps) {
  const isStatic = useIsStaticRenderer()
  const list = slides && slides.length ? slides : DEFAULT_PROJECTS
  const n = list.length

  const [active, setActive] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const lockRef = useRef(false)

  const lock = useCallback(() => {
    lockRef.current = true
    window.setTimeout(() => {
      lockRef.current = false
    }, 600)
  }, [])

  const step = useCallback(
    (dir: number) => {
      if (lockRef.current) return
      lock()
      setActive((a) => (((a + dir) % n) + n) % n)
    },
    [n, lock]
  )

  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])

  const handleCardClick = useCallback(
    (i: number) => {
      if (isStatic || lockRef.current) return
      if (i === active && list[i]?.url) {
        window.open(list[i].url, "_blank", "noreferrer")
        return
      }
      lock()
      setActive(i)
    },
    [isStatic, active, list, lock]
  )

  useEffect(() => {
    if (isStatic || !autoplay || isHovered || n < 2) return
    const id = window.setInterval(next, autoplayInterval)
    return () => window.clearInterval(id)
  }, [isStatic, autoplay, isHovered, autoplayInterval, n, next])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        step(1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        step(-1)
      }
    },
    [step]
  )

  return (
    <div
      style={{
        ...(style || {}),
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
      }}
      tabIndex={0}
      role="region"
      aria-label="3D Project Coverflow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={isStatic ? undefined : onKeyDown}
    >
      {/* 3D Coverflow Stage */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: cardHeight + 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: `${PERSPECTIVE}px`,
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "relative",
            width: cardWidth,
            height: cardHeight,
            transformStyle: "preserve-3d",
          }}
        >
          {list.map((project, i) => {
            let rel = i - active
            if (rel > n / 2) rel -= n
            if (rel < -n / 2) rel += n

            const ax = Math.abs(rel)
            const visible = ax <= MAX_VISIBLE
            const isActive = rel === 0

            // 3D positioning
            const tx = rel * gap
            const tz = isActive ? 50 : -ax * 160
            const ry = isActive ? 0 : rel > 0 ? -tiltY : tiltY
            const sc = isActive ? 1.05 : Math.max(0.7, 1 - ax * 0.18)
            const opacity = isActive ? 1 : Math.max(0.4, 1 - ax * 0.35)

            const cardStyle: CSSProperties = {
              position: "absolute",
              left: "50%",
              top: "50%",
              width: cardWidth,
              height: cardHeight,
              borderRadius: 20,
              overflow: "hidden",
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
              transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`,
              transition: "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.4s ease, box-shadow 0.4s ease",
              opacity: visible ? opacity : 0,
              zIndex: 10 - ax,
              cursor: "pointer",
              pointerEvents: visible && !isStatic ? "auto" : "none",
              backgroundColor: "#0d0d0d",
              border: isActive
                ? "1px solid rgba(0, 85, 255, 0.6)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: isActive
                ? "0 30px 80px -15px rgba(0, 85, 255, 0.35), 0 20px 40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.15)"
                : "0 15px 40px rgba(0,0,0,0.6)",
            }

            return (
              <div
                key={i}
                style={cardStyle}
                onClick={isStatic ? undefined : () => handleCardClick(i)}
                aria-label={project.title}
                aria-hidden={!visible}
                className="group flex flex-col justify-between select-none"
              >
                {/* Top Image Preview */}
                <div className={`relative h-[210px] w-full bg-gradient-to-br ${project.accent} overflow-hidden`}>
                  <img
                    src={project.thumb}
                    alt={project.title}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/30 to-transparent z-[1]" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-[3]">
                    <span className="font-mono text-[9px] tracking-[0.2em] px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white/80 border border-white/10 uppercase">
                      {project.category}
                    </span>
                    <div className={`w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 ${isActive ? "bg-[#0055ff] border-[#0055ff]" : "bg-black/60 backdrop-blur-md"}`}>
                      <svg className="w-3.5 h-3.5 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>

                  <span className="absolute bottom-3 left-4 font-mono text-xs font-semibold text-white/40 z-[3]">
                    {project.num}
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex flex-col gap-3 p-6 flex-1 justify-between bg-[#0d0d0d]">
                  <div>
                    <h3 className="text-2xl font-light tracking-tight text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-white/45 text-xs font-light leading-relaxed line-clamp-2">
                      {project.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.07] flex flex-col gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-white/50 border border-white/[0.05]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-mono tracking-widest text-[#0055ff] uppercase flex items-center gap-1">
                        {isActive ? (
                          <>
                            <span>Open Project</span>
                            <ExternalLink className="w-3 h-3" />
                          </>
                        ) : (
                          <span>Click to Focus</span>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-white/30 uppercase">
                        {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dim overlay for inactive cards */}
                {!isActive && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-500 pointer-events-none rounded-[20px]" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls Bar Below */}
      <div className="mt-8 flex items-center gap-6 z-20">
        <button
          onClick={prev}
          aria-label="Previous project"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-md transition-all hover:bg-[#0055ff] hover:border-[#0055ff] hover:text-white hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2" role="tablist">
          {list.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              onClick={() => handleCardClick(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === active
                  ? "w-8 bg-[#0055ff]"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next project"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-md transition-all hover:bg-[#0055ff] hover:border-[#0055ff] hover:text-white hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
