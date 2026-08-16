"use client";

import { cn } from "@/lib/utils";
import { useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";

export interface MenuItem {
  num: string;
  name: string;
  clipId: string;
  image: string;
  url?: string;
  desc?: string;
  category?: string;
}

const defaultItems: MenuItem[] = [
  {
    num: "01",
    name: "NoMore DMS",
    clipId: "clip-original",
    image: "/images/projects/nomoredms.png",
    url: "https://nomoredms.vercel.app/",
    desc: "Creator platform eliminating unnecessary direct messages with a single hub.",
    category: "CREATOR PLATFORM"
  },
  {
    num: "02",
    name: "Edu Calc",
    clipId: "clip-hexagons",
    image: "/images/projects/educalc.png",
    url: "https://educalc-expert0509.vercel.app/",
    desc: "Educational math platform helping students calculate and run logic tasks.",
    category: "EDUCATION PLATFORM"
  },
  {
    num: "03",
    name: "Personal Portfolio",
    clipId: "clip-pixels",
    image: "/images/projects/personalportfolio.jpg",
    url: "https://devendhargopagoni.netlify.app/",
    desc: "Premium interactive personal portfolio with cursor masks and motion physics.",
    category: "PERSONAL BRANDING"
  },
  {
    num: "04",
    name: "Post Learn",
    clipId: "clip-original",
    image: "/images/projects/postlearn.png",
    url: "https://postlearn-lake.vercel.app/",
    desc: "Modern learning platform delivering educational content intuitively.",
    category: "LEARNING PLATFORM"
  },
  {
    num: "05",
    name: "Cozy Cafe",
    clipId: "clip-hexagons",
    image: "/images/projects/cozy-cafe.png",
    url: "https://cozy-cafa1.netlify.app/",
    desc: "Bespoke cafe website featuring online menus and reservation flows.",
    category: "CAFÉ & HOSPITALITY"
  },
  {
    num: "06",
    name: "Akshith Portfolio",
    clipId: "clip-pixels",
    image: "/images/projects/maatoori-akshith.jpg",
    url: "https://maatoori-akshith.netlify.app/",
    desc: "Personal portfolio built for a client to establish digital presence.",
    category: "CLIENT PORTFOLIO"
  },
  {
    num: "07",
    name: "TeamZ Corporate",
    clipId: "clip-original",
    image: "/images/projects/teamz.png",
    url: "https://teamz09.netlify.app/",
    desc: "Corporate business website presenting services professionally.",
    category: "CORPORATE WEBSITE"
  }
];

export const Component = ({
  items = defaultItems,
  className
}: { items?: MenuItem[]; className?: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<SVGImageElement>(null);
  const mainGroupRef = useRef<SVGGElement>(null);
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  const createLoop = (index: number) => {
    const item = items[index];
    if (!item) return;
    const selector = `#${item.clipId} .path`;

    if (masterTl.current) masterTl.current.kill();

    if (imageRef.current) imageRef.current.setAttribute("href", item.image);
    if (mainGroupRef.current) mainGroupRef.current.setAttribute("clip-path", `url(#${item.clipId})`);
    
    gsap.set(selector, { scale: 0, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // 1. IN (Expo Out)
    tl.to(selector, {
      scale: 1,
      duration: 0.8,
      stagger: { amount: 0.4, from: "random" },
      ease: "expo.out",
    })
    // 2. IDLE (Sine Breath)
    .to(selector, {
      scale: 1.05,
      duration: 1.5,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
      stagger: { amount: 0.2, from: "center" }
    })
    // 3. OUT (Expo In)
    .to(selector, {
      scale: 0,
      duration: 0.6,
      stagger: { amount: 0.3, from: "edges" },
      ease: "expo.in",
    });

    masterTl.current = tl;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      createLoop(0);
    }, containerRef);
    return () => ctx.revert();
  }, [items]);

  const handleItemHover = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    createLoop(index);
  };

  const handleItemClick = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noreferrer");
    }
  };

  const activeItem = items[activeIndex] || items[0];

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "flex flex-col md:flex-row items-center justify-between min-h-[80vh] w-full p-6 md:p-16 overflow-hidden transition-colors duration-500",
        "bg-[#080808] text-white", 
        className
      )}
    >
      
      {/* LEFT SIDE: HIGH CONTRAST MENU */}
      <div className="z-20 w-full md:w-1/2 pr-0 md:pr-8">
        <nav>
          <ul className="flex flex-col gap-8 md:gap-10">
            {items.map((item, index) => {
              const nameParts = item.name.split(' ');
              const firstLine = nameParts[0];
              const secondLine = nameParts.slice(1).join(' ');

              return (
                <li
                  key={item.num}
                  onMouseEnter={() => handleItemHover(index)}
                  onClick={() => handleItemClick(item.url)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-start gap-5 md:gap-6">
                    {/* Numbers */}
                    <span className={cn(
                      "text-xl md:text-2xl font-mono font-bold transition-all duration-500 mt-1 select-none",
                      activeIndex === index 
                        ? "text-[#0055ff] scale-110" 
                        : "text-zinc-600 dark:text-zinc-600" 
                    )}>
                      {item.num}
                    </span>
                    
                    {/* Main Text */}
                    <div className="flex flex-col">
                      {item.category && activeIndex === index && (
                        <span className="text-[10px] font-mono tracking-[0.25em] text-[#0055ff] uppercase mb-1 animate-fadeIn">
                          {item.category}
                        </span>
                      )}
                      <h2 className={cn(
                        "text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] transition-all duration-500",
                        activeIndex === index 
                          ? "text-white opacity-100 translate-x-3" 
                          : "opacity-35 translate-x-0 text-zinc-500 dark:text-transparent dark:[text-stroke:1.5px_#52525b] dark:[-webkit-text-stroke:1.5px_#52525b]"
                      )}>
                        {firstLine}{secondLine ? <br /> : null}
                        {secondLine}
                      </h2>

                      {activeIndex === index && item.desc && (
                        <p className="mt-2 text-xs md:text-sm text-zinc-400 font-light max-w-md leading-relaxed animate-fadeIn">
                          {item.desc}
                          {item.url && (
                            <span className="inline-flex items-center gap-1 ml-2 text-[#0055ff] font-mono text-xs hover:underline">
                              View Project →
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* RIGHT SIDE: SQUARE GRID (Sharp SVG Clip Animation) */}
      <div 
        className="relative w-full md:w-1/2 flex flex-col justify-center items-center mt-12 md:mt-0 cursor-pointer"
        onClick={() => handleItemClick(activeItem.url)}
      >
        <div className="absolute w-[120%] h-[120%] bg-[#0055ff]/10 blur-[120px] rounded-full transition-opacity duration-1000 pointer-events-none" />
        
        <svg viewBox="0 0 500 500" className="w-[100%] max-w-[480px] h-auto z-10 drop-shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          <defs>
            <clipPath id="clip-original">
              <path className="path" d="M480.6,235H19.4c-6,0-10.8-4.9-10.8-10.8v-9.5c0-6,4.9-10.8,10.8-10.8h461.1c6,0,10.8,4.9,10.8,10.8v9.5C491.4,230.2,486.6,235,480.6,235z" />
              <path className="path" d="M483.1,362.4H16.9c-4.6,0-8.3-3.7-8.3-8.3v-1.8c0-4.6,3.7-8.3,8.3-8.3h466.1c4.6,0,8.3,3.7,8.3,8.3v1.8C491.4,358.7,487.7,362.4,483.1,362.4z" />
              <path className="path" d="M460.3,336.3H39.7c-17.2,0-31.1-13.9-31.1-31.1v-31.5c0-17.2,13.9-31.1,31.1-31.1h420.7c17.2,0,31.1,13.9,31.1,31.1v31.5C491.4,322.4,477.5,336.3,460.3,336.3z" />
              <path className="path" d="M459.2,196.2H40.8v-35c0-47.5,38.5-86,86-86h246.5c47.5,0,86,38.5,86,86V196.2z" />
              <path className="path" d="M441.9,424.9H58.1c-9.6,0-17.3-7.8-17.3-17.3v-37.4h418.5v37.4C459.2,417.1,451.5,424.9,441.9,424.9z" />
            </clipPath>

            <clipPath id="clip-hexagons">
              <rect className="path" x="20" y="20" width="200" height="280" rx="12" />
              <rect className="path" x="20" y="320" width="200" height="160" rx="12" />
              <rect className="path" x="240" y="20" width="240" height="140" rx="12" />
              <rect className="path" x="240" y="180" width="110" height="160" rx="12" />
              <rect className="path" x="370" y="180" width="110" height="160" rx="12" />
              <rect className="path" x="240" y="360" width="240" height="120" rx="12" />
            </clipPath>

            {/* Grid Squares */}
            <clipPath id="clip-pixels">
              {Array.from({ length: 9 }).map((_, i) => (
                <rect
                  key={i}
                  className="path"
                  x={(i % 3) * 160 + 20}
                  y={Math.floor(i / 3) * 160 + 20}
                  width="140"
                  height="140"
                  rx="4" 
                />
              ))}
            </clipPath>
          </defs>

          <g ref={mainGroupRef} clipPath={`url(#${items[0]?.clipId || 'clip-original'})`}>
            <image
              ref={imageRef}
              href={items[0]?.image}
              width="500"
              height="500"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </svg>

        {activeItem.url && (
          <div className="mt-4 flex items-center gap-2 text-xs font-mono tracking-widest text-[#0055ff] uppercase opacity-75 hover:opacity-100 transition-opacity">
            <span>Click image to open {activeItem.name}</span>
            <svg className="w-3.5 h-3.5 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
