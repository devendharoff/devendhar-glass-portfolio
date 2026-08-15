"use client";

import * as React from "react";

export interface ProjectData {
  title: string;
  image: string;
  category: string;
  year: string;
  description: string;
  url?: string;
}

const PROJECT_DATA: ProjectData[] = [
  {
    title: "NoMoreDMS",
    image: "/images/projects/nomoredms.png",
    category: "Creator Platform",
    year: "2026",
    description: "AI job application & link hub",
    url: "https://nomoredms.vercel.app/",
  },
  {
    title: "EduCalc",
    image: "/images/projects/educalc.png",
    category: "Education Platform",
    year: "2025",
    description: "Educational math & logic tool",
    url: "https://educalc-expert0509.vercel.app/",
  },
  {
    title: "Personal Portfolio",
    image: "/images/projects/personalportfolio.jpg",
    category: "Personal Branding",
    year: "2025",
    description: "Interactive motion physics website",
    url: "https://devendhargopagoni.netlify.app/",
  },
  {
    title: "PostLearn",
    image: "/images/projects/postlearn.png",
    category: "Learning Platform",
    year: "2025",
    description: "Modern learning & content UI",
    url: "https://postlearn-lake.vercel.app/",
  },
  {
    title: "Cozy Cafe",
    image: "/images/projects/cozy-cafe.png",
    category: "Hospitality",
    year: "2024",
    description: "Bespoke cafe & online menu",
    url: "https://cozy-cafa1.netlify.app/",
  },
  {
    title: "Akshith Portfolio",
    image: "/images/projects/maatoori-akshith.jpg",
    category: "Client Portfolio",
    year: "2025",
    description: "Client digital presence",
    url: "https://maatoori-akshith.netlify.app/",
  },
  {
    title: "TeamZ",
    image: "/images/projects/teamz.png",
    category: "Corporate Web",
    year: "2025",
    description: "Corporate services platform",
    url: "https://teamz09.netlify.app/",
  },
];

const CONFIG = {
  SCROLL_SPEED: 0.75,
  LERP_FACTOR: 0.05,
  BUFFER_SIZE: 5,
  MAX_VELOCITY: 150,
  SNAP_DURATION: 500,
};

const lerp = (start: number, end: number, factor: number) =>
  start + (end - start) * factor;

const getProjectData = (index: number) => {
  const i =
    ((Math.abs(index) % PROJECT_DATA.length) + PROJECT_DATA.length) %
    PROJECT_DATA.length;
  return PROJECT_DATA[i];
};

const getProjectNumber = (index: number) => {
  return (
    ((Math.abs(index) % PROJECT_DATA.length) + PROJECT_DATA.length) %
      PROJECT_DATA.length +
    1
  )
    .toString()
    .padStart(2, "0");
};

export function Component() {
  const [visibleRange, setVisibleRange] = React.useState({
    min: -CONFIG.BUFFER_SIZE,
    max: CONFIG.BUFFER_SIZE,
  });

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const state = React.useRef({
    currentY: 0,
    targetY: 0,
    isDragging: false,
    isSnapping: false,
    snapStart: { time: 0, y: 0, target: 0 },
    lastScrollTime: Date.now(),
    dragStart: { y: 0, scrollY: 0 },
    projectHeight: 550,
    minimapHeight: 250,
  });

  const projectsRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const minimapRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const infoRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const requestRef = React.useRef<number>();

  const updateParallax = (
    img: HTMLImageElement | null,
    scroll: number,
    index: number,
    height: number
  ) => {
    if (!img) return;
    if (!img.dataset.parallaxCurrent) {
      img.dataset.parallaxCurrent = "0";
    }

    let current = parseFloat(img.dataset.parallaxCurrent);
    const target = (-scroll - index * height) * 0.2;
    current = lerp(current, target, 0.1);

    if (Math.abs(current - target) > 0.01) {
      img.style.transform = `translateY(${current}px) scale(1.35)`;
      img.dataset.parallaxCurrent = current.toString();
    }
  };

  const updateSnap = () => {
    const s = state.current;
    const progress = Math.min(
      (Date.now() - s.snapStart.time) / CONFIG.SNAP_DURATION,
      1
    );
    const eased = 1 - Math.pow(1 - progress, 3);
    s.targetY =
      s.snapStart.y + (s.snapStart.target - s.snapStart.y) * eased;
    if (progress >= 1) s.isSnapping = false;
  };

  const snapToProject = () => {
    const s = state.current;
    const current = Math.round(-s.targetY / s.projectHeight);
    const target = -current * s.projectHeight;
    s.isSnapping = true;
    s.snapStart = {
      time: Date.now(),
      y: s.targetY,
      target: target,
    };
  };

  const updatePositions = () => {
    const s = state.current;
    const minimapY = (s.currentY * s.minimapHeight) / s.projectHeight;

    projectsRef.current.forEach((el, index) => {
      const y = index * s.projectHeight + s.currentY;
      el.style.transform = `translateY(${y}px)`;
      const img = el.querySelector("img");
      updateParallax(img, s.currentY, index, s.projectHeight);
    });

    minimapRef.current.forEach((el, index) => {
      const y = index * s.minimapHeight + minimapY;
      el.style.transform = `translateY(${y}px)`;
      const img = el.querySelector("img");
      if (img) {
        updateParallax(img, minimapY, index, s.minimapHeight);
      }
    });

    infoRef.current.forEach((el, index) => {
      const y = index * s.minimapHeight + minimapY;
      el.style.transform = `translateY(${y}px)`;
    });
  };

  const animate = () => {
    const s = state.current;
    const now = Date.now();

    if (!s.isSnapping && !s.isDragging && now - s.lastScrollTime > 100) {
      const snapPoint =
        -Math.round(-s.targetY / s.projectHeight) * s.projectHeight;
      if (Math.abs(s.targetY - snapPoint) > 1) snapToProject();
    }

    if (s.isSnapping) updateSnap();
    if (!s.isDragging) {
      s.currentY += (s.targetY - s.currentY) * CONFIG.LERP_FACTOR;
    }

    updatePositions();
  };

  const renderedRange = React.useRef({ min: -CONFIG.BUFFER_SIZE, max: CONFIG.BUFFER_SIZE });

  const animationLoop = () => {
    animate();

    const s = state.current;
    const currentIndex = Math.round(-s.targetY / s.projectHeight);
    const min = currentIndex - CONFIG.BUFFER_SIZE;
    const max = currentIndex + CONFIG.BUFFER_SIZE;

    if (min !== renderedRange.current.min || max !== renderedRange.current.max) {
      renderedRange.current = { min, max };
      setVisibleRange({ min, max });
    }

    requestRef.current = requestAnimationFrame(animationLoop);
  };

  React.useEffect(() => {
    const parentContainer = containerRef.current;
    state.current.projectHeight = parentContainer ? parentContainer.clientHeight : 600;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = state.current;
      s.isSnapping = false;
      s.lastScrollTime = Date.now();
      const delta = Math.max(
        Math.min(e.deltaY * CONFIG.SCROLL_SPEED, CONFIG.MAX_VELOCITY),
        -CONFIG.MAX_VELOCITY
      );
      s.targetY -= delta;
    };

    const onTouchStart = (e: TouchEvent) => {
      const s = state.current;
      s.isDragging = true;
      s.isSnapping = false;
      s.dragStart = { y: e.touches[0].clientY, scrollY: s.targetY };
      s.lastScrollTime = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = state.current;
      if (!s.isDragging) return;
      s.targetY =
        s.dragStart.scrollY +
        (e.touches[0].clientY - s.dragStart.y) * 1.5;
      s.lastScrollTime = Date.now();
    };

    const onTouchEnd = () => {
      state.current.isDragging = false;
    };

    const onResize = () => {
      if (containerRef.current) {
        state.current.projectHeight = containerRef.current.clientHeight;
      }
    };

    if (parentContainer) {
      parentContainer.addEventListener("wheel", onWheel, { passive: false });
      parentContainer.addEventListener("touchstart", onTouchStart);
      parentContainer.addEventListener("touchmove", onTouchMove);
      parentContainer.addEventListener("touchend", onTouchEnd);
    }
    window.addEventListener("resize", onResize);

    onResize();
    requestRef.current = requestAnimationFrame(animationLoop);

    return () => {
      if (parentContainer) {
        parentContainer.removeEventListener("wheel", onWheel);
        parentContainer.removeEventListener("touchstart", onTouchStart);
        parentContainer.removeEventListener("touchmove", onTouchMove);
        parentContainer.removeEventListener("touchend", onTouchEnd);
      }
      window.removeEventListener("resize", onResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const indices = [];
  for (let i = visibleRange.min; i <= visibleRange.max; i++) {
    indices.push(i);
  }

  return (
    <div ref={containerRef} className="parallax-container relative w-full h-[550px] md:h-[650px] overflow-hidden bg-[#08080a] text-white rounded-3xl border border-white/10 shadow-2xl">
      <style>{`
        .parallax-container {
          position: relative;
          touch-action: none;
          user-select: none;
        }
        .project-list {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .project {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          will-change: transform;
        }
        .project img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform;
        }
        .minimap {
          position: absolute;
          right: 24px;
          bottom: 24px;
          z-index: 20;
          width: 260px;
          height: 250px;
          overflow: hidden;
          border-radius: 16px;
          background: rgba(12, 12, 16, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 14px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          pointer-events: auto;
        }
        .minimap-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .minimap-img-preview {
          position: relative;
          width: 100%;
          height: 130px;
          overflow: hidden;
          border-radius: 10px;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .minimap-img-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          will-change: transform;
        }
        .minimap-img-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform;
        }
        .minimap-info-list {
          position: relative;
          width: 100%;
          height: 80px;
          overflow: hidden;
          margin-top: 8px;
        }
        .minimap-item-info {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: monospace;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.9);
          will-change: transform;
        }
        .minimap-item-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>

      <ul className="project-list">
        {indices.map((i) => {
          const data = getProjectData(i);
          return (
            <div
              key={i}
              className="project"
              ref={(el) => {
                if (el) projectsRef.current.set(i, el);
                else projectsRef.current.delete(i);
              }}
            >
              <img src={data.image} alt={data.title} className="opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              {/* Floating project title overlay on main slide */}
              <div className="absolute bottom-10 left-8 md:left-12 z-10 max-w-lg flex flex-col gap-2">
                <span className="font-mono text-xs text-[#0055ff] uppercase tracking-widest px-3 py-1 rounded-full bg-black/60 border border-white/10 w-fit backdrop-blur-md">
                  {data.category} • {data.year}
                </span>
                <h3 className="text-3xl md:text-5xl font-light text-white tracking-tight">
                  {data.title}
                </h3>
                <p className="text-white/60 text-sm font-light leading-relaxed">
                  {data.description}
                </p>
                {data.url && (
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-xs text-[#0055ff] hover:underline mt-2 pointer-events-auto"
                  >
                    <span>Launch Live Project &rarr;</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </ul>

      {/* Minimap Box */}
      <div className="minimap">
        <div className="minimap-wrapper">
          <div className="minimap-img-preview">
            {indices.map((i) => {
              const data = getProjectData(i);
              return (
                <div
                  key={i}
                  className="minimap-img-item"
                  ref={(el) => {
                    if (el) minimapRef.current.set(i, el);
                    else minimapRef.current.delete(i);
                  }}
                >
                  <img src={data.image} alt={data.title} />
                </div>
              );
            })}
          </div>
          <div className="minimap-info-list">
            {indices.map((i) => {
              const data = getProjectData(i);
              const num = getProjectNumber(i);
              return (
                <div
                  key={i}
                  className="minimap-item-info"
                  ref={(el) => {
                    if (el) infoRef.current.set(i, el);
                    else infoRef.current.delete(i);
                  }}
                >
                  <div className="minimap-item-info-row">
                    <p className="font-bold text-[#0055ff]">{num}</p>
                    <p className="font-medium text-white">{data.title}</p>
                  </div>
                  <div className="minimap-item-info-row text-white/50">
                    <p>{data.category}</p>
                    <p>{data.year}</p>
                  </div>
                  <div className="minimap-item-info-row text-white/40">
                    <p>{data.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
