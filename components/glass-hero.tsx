'use client';

import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';

const ParticleSphereRefactor = dynamic(
  () => import('@/components/ui/particle-sphere'),
  { ssr: false }
);
const OrbitingSkills = dynamic(
  () => import('@/components/ui/orbiting-skills'),
  { ssr: false }
);
const ArgentLoopSlider = dynamic(
  () => import('@/components/ui/argent-loop-infinite-slider'),
  { ssr: false }
);


const ENTRANCE_STYLES = `
@keyframes heroFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes heroScaleIn {
  from { transform: scale(1.035); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(60px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes fadeDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
}

.animate-hero-base {
  animation: heroScaleIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-nav-down {
  animation: fadeDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-line-up {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fade-up {
  animation: heroFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-hero-base, .animate-nav-down, .animate-line-up, .animate-fade-up {
    animation-duration: 0.01s !important;
    animation-delay: 0s !important;
    transition-duration: 0.01s !important;
    transform: none !important;
  }
}
`;

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const DESKTOP_RADIUS = 235;
const MOBILE_RADIUS = 150;
const REVEAL_DESKTOP_RADIUS = DESKTOP_RADIUS;
const REVEAL_MOBILE_RADIUS = MOBILE_RADIUS;

export default function GlassHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References for liquid reveal pointer tracking
  const rawX = useRef<number>(-999);
  const rawY = useRef<number>(-999);
  const smoothX = useRef<number>(-999);
  const smoothY = useRef<number>(-999);
  const currentRadius = useRef<number>(0);
  const targetRadius = useRef<number>(0);
  const isTouchActive = useRef<boolean>(false);

  // References for premium interactive physics (Hero, Section 2, Section 3 Orb & Section 4 Device Mockups)
  const portraitMouseX = useRef<number>(0);
  const portraitMouseY = useRef<number>(0);
  const portraitSmoothX = useRef<number>(0);
  const portraitSmoothY = useRef<number>(0);

  const idPortraitMouseX = useRef<number>(0);
  const idPortraitMouseY = useRef<number>(0);
  const idPortraitSmoothX = useRef<number>(0);
  const idPortraitSmoothY = useRef<number>(0);

  const orbMouseX = useRef<number>(0);
  const orbMouseY = useRef<number>(0);
  const orbSmoothX = useRef<number>(0);
  const orbSmoothY = useRef<number>(0);

  // Animated numbers refs for stats card count-up triggers
  const statVal1 = useRef<number>(0);
  const statVal2 = useRef<number>(0);
  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animation frame loop reference
  const animationFrameId = useRef<number | null>(null);











  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP with Lenis Scroll
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // 2. High-performance Animation Loop
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderLoop = () => {
      // Interpolation factors
      const posFactor = prefersReducedMotion ? 1 : 0.14;
      const radFactor = prefersReducedMotion ? 1 : 0.12;
      const followFactor = prefersReducedMotion ? 1 : 0.08;

      // A. Liquid Reveal Mask position
      if (rawX.current === -999 && rawY.current === -999) {
        smoothX.current = -999;
        smoothY.current = -999;
      } else {
        if (smoothX.current === -999 && smoothY.current === -999) {
          smoothX.current = rawX.current;
          smoothY.current = rawY.current;
        } else {
          smoothX.current += (rawX.current - smoothX.current) * posFactor;
          smoothY.current += (rawY.current - smoothY.current) * posFactor;
        }
      }
      currentRadius.current += (targetRadius.current - currentRadius.current) * radFactor;

      container.style.setProperty('--reveal-x', `${smoothX.current}px`);
      container.style.setProperty('--reveal-y', `${smoothY.current}px`);
      container.style.setProperty('--reveal-radius', `${currentRadius.current}px`);

      // B. Hero Portrait cursor follow
      portraitSmoothX.current += (portraitMouseX.current - portraitSmoothX.current) * followFactor;
      portraitSmoothY.current += (portraitMouseY.current - portraitSmoothY.current) * followFactor;
      const pX = (portraitSmoothX.current / (window.innerWidth / 2)) * 12;
      const pY = (portraitSmoothY.current / (window.innerHeight / 2)) * 10;
      const portraitElement = document.querySelector('#hero-portrait-wrapper') as HTMLElement;
      if (portraitElement) {
        portraitElement.style.transform = `translate3d(${pX}px, ${pY}px, 0)`;
      }

      // C. Section 2 Portrait cursor follow
      idPortraitSmoothX.current += (idPortraitMouseX.current - idPortraitSmoothX.current) * followFactor;
      idPortraitSmoothY.current += (idPortraitMouseY.current - idPortraitSmoothY.current) * followFactor;
      const idPX = (idPortraitSmoothX.current / (window.innerWidth / 2)) * 8;
      const idPY = (idPortraitSmoothY.current / (window.innerHeight / 2)) * 6;
      const idPortraitElement = document.querySelector('#identity-portrait') as HTMLElement;
      const idGlowElement = document.querySelector('#identity-glow') as HTMLElement;
      if (idPortraitElement) {
        idPortraitElement.style.transform = `translate3d(${idPX}px, ${idPY}px, 0)`;
      }
      if (idGlowElement) {
        idGlowElement.style.transform = `translate3d(${idPX * 0.5}px, ${idPY * 0.5}px, 0)`;
      }

      // D. Section 3 Interactive Glass Orb cursor follow
      orbSmoothX.current += (orbMouseX.current - orbSmoothX.current) * followFactor;
      orbSmoothY.current += (orbMouseY.current - orbSmoothY.current) * followFactor;
      const oX = (orbSmoothX.current / (window.innerWidth / 2)) * 15;
      const oY = (orbSmoothY.current / (window.innerHeight / 2)) * 15;
      const orbElement = document.querySelector('#interactive-orb-element') as HTMLElement;
      if (orbElement) {
        orbElement.style.transform = `translate3d(${oX}px, ${oY}px, 0)`;
      }



      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    // 3. GSAP Parallax and Pinning Scroll Choreography
    const ctx = gsap.context(() => {
      
      // HERO PINNING & DEEP CHARCOAL TRANSITION
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      heroTimeline.to(container, { backgroundColor: '#0B0B0D', ease: 'none' }, 0);
      heroTimeline.to('#hero-grid', { y: 150 * 0.2, opacity: 0, ease: 'none' }, 0);
      heroTimeline.to('#hero-circle', { y: 150 * 0.4, ease: 'none' }, 0);
      heroTimeline.to('#hero-text-col', { y: -150 * 0.1, opacity: 0, ease: 'none' }, 0);
      heroTimeline.to('#hero-cta-btn', { scale: 0.85, opacity: 0, ease: 'none' }, 0);

      // Hero Portrait
      const portraitTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-hero',
          start: 'top top',
          end: '+=600',
          scrub: true,
        }
      });
      portraitTimeline.to('#hero-base-portrait', { scale: 1.08, x: -120, filter: 'grayscale(100%)', ease: 'power3.out' }, 0);
      portraitTimeline.to('#hero-reveal-portrait', { scale: 1.08, x: -120, filter: 'grayscale(100%)', ease: 'power3.out' }, 0);

      ScrollTrigger.create({
        trigger: '#sec-hero',
        start: 'top top',
        end: 'bottom top',
        pin: true,
        pinSpacing: false,
      });

      // SECTION 2: IDENTITY REVEAL PINNING
      const sec2Timeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-identity',
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: true,
        }
      });
      sec2Timeline.from('#identity-word-span span', { opacity: 0, y: 40, stagger: 0.18, duration: 0.9, ease: 'power2.out' }, 0.1);
      sec2Timeline.to('#experiences-underline path', { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, '+=0.1');
      sec2Timeline.from('#identity-paragraph', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' }, '+=0.2');
      sec2Timeline.from('.stat-card-el', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        onStart: () => {
          gsap.to(statVal1, { current: 25, duration: 1.2, ease: 'none', onUpdate: () => setStat1(Math.floor(statVal1.current)) });
          gsap.to(statVal2, { current: 1, duration: 1.2, ease: 'none', onUpdate: () => setStat2(statVal2.current > 0.5 ? 'AI' : '') });
        }
      }, '+=0.1');

      sec2Timeline.to('#identity-heading-block', { opacity: 0, y: -60, duration: 0.6 }, '+=0.4');
      sec2Timeline.to('#identity-portrait', { scale: 1.15, filter: 'grayscale(100%) blur(6px)', duration: 0.6 }, '+=0.4');
      sec2Timeline.to('#identity-glow', { opacity: 0, duration: 0.6 }, '+=0.4');

      // SECTION 3: DESIGN PHILOSOPHY PINNING & ORB ZOOM
      const philosophyTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-philosophy',
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: true,
        }
      });
      philosophyTimeline.to(container, { backgroundColor: '#09090B', ease: 'none' }, 0);
      philosophyTimeline.from('#phi-line-1', { opacity: 0, y: 40, duration: 1, ease: 'power2.out' }, 0.1);
      philosophyTimeline.from('#phi-line-2', { opacity: 0, y: 40, duration: 1, ease: 'power2.out' }, 0.5);
      philosophyTimeline.from('#phi-line-3', { opacity: 0, y: 40, duration: 1, ease: 'power2.out' }, 0.9);
      philosophyTimeline.from('#phi-line-4', { opacity: 0, y: 40, duration: 1, ease: 'power2.out' }, 1.3);
      philosophyTimeline.from('.phi-para-sent', { opacity: 0, y: 15, stagger: 0.15, duration: 0.8, ease: 'power2.out' }, 1.6);
      philosophyTimeline.to('.phi-glow-word', { filter: 'brightness(1.5)', color: '#60a5fa', textShadow: '0 0 20px rgba(96,165,250,0.5)', duration: 0.4 }, 1.0);
      philosophyTimeline.to('.phi-glow-word', { filter: 'brightness(1.0)', color: '#93c5fd', textShadow: 'none', duration: 0.4 }, 1.4);
      philosophyTimeline.to('#interactive-orb-container', { scale: 2.4, filter: 'blur(8px)', duration: 1.2, ease: 'power2.inOut' }, 2.0);
      // SECTION 4: EDITORIAL PROJECTS SHOWCASE (stagger reveal on scroll)
      const projectsTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-showcase',
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        }
      });
      projectsTimeline.from('.project-card-item', {
        opacity: 0,
        y: 50,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power2.out',
      });

      // SECTION 5: SERVICES (stagger reveal on scroll)
      const servicesTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-services',
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        }
      });
      servicesTimeline.from('.service-card-item', {
        opacity: 0,
        y: 50,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power2.out',
      });


      // SECTION 8 (Word Manifesto)
      const wordsTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-manifesto',
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        },
      });
      wordsTimeline.from('.man-word', { opacity: 0.12, y: 25, stagger: 0.1, ease: 'power1.out' });
    }, container);

    return () => {
      lenis.destroy();
      ctx.revert();
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);





  // 3D Tilt & Parallax Physics for Project Cards
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  // Event handlers for Hero Mask Pointer
  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      rawX.current = x;
      rawY.current = y;
      
      if (smoothX.current === -999 || smoothY.current === -999) {
        smoothX.current = x;
        smoothY.current = y;
      }
      targetRadius.current = REVEAL_DESKTOP_RADIUS;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.pointerType === 'mouse') {
      rawX.current = x;
      rawY.current = y;
      targetRadius.current = REVEAL_DESKTOP_RADIUS;

      portraitMouseX.current = e.clientX - window.innerWidth / 2;
      portraitMouseY.current = e.clientY - window.innerHeight / 2;
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') {
      targetRadius.current = 0;
      portraitMouseX.current = 0;
      portraitMouseY.current = 0;
    }
  };

  // Section 2 interactive pointer handlers
  const handleSec2MouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    idPortraitMouseX.current = e.clientX - window.innerWidth / 2;
    idPortraitMouseY.current = e.clientY - window.innerHeight / 2;
  };

  const handleSec2MouseLeave = () => {
    idPortraitMouseX.current = 0;
    idPortraitMouseY.current = 0;
  };

  // Section 3 Interactive Glass Orb pointer handlers
  const handleSec3MouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    orbMouseX.current = e.clientX - window.innerWidth / 2;
    orbMouseY.current = e.clientY - window.innerHeight / 2;
  };

  const handleSec3MouseLeave = () => {
    orbMouseX.current = 0;
    orbMouseY.current = 0;
  };



  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isTouchActive.current = true;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    rawX.current = x;
    rawY.current = y;
    
    if (smoothX.current === -999 || smoothY.current === -999) {
      smoothX.current = x;
      smoothY.current = y;
    }
    targetRadius.current = REVEAL_MOBILE_RADIUS;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isTouchActive.current) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      rawX.current = x;
      rawY.current = y;
    }
  };

  const handleTouchEnd = () => {
    isTouchActive.current = false;
    targetRadius.current = 0;
  };

  return (
    <div ref={containerRef} className="noise-bg select-none w-full bg-white overflow-x-hidden transition-colors duration-500">
      <style dangerouslySetInnerHTML={{ __html: ENTRANCE_STYLES }} />
      
      {/* 5. Navigation Overlay & Mobile Drawer */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-[max(1.5rem,safe-area-top)_max(4vw,1.5rem)_0] pointer-events-none animate-nav-down">
        <div className="flex items-center gap-3 select-none pointer-events-auto">
          <a href="#sec-hero" className="flex items-center gap-2.5 group">
            <svg className="w-7 h-7 text-[#0c111d] dark:text-white transition-transform group-hover:rotate-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M75 25H35L25 35L55 45L25 55L35 75H75L85 65H45L65 55L35 45L65 35L75 25Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
            </svg>
            <span className="text-[1.25rem] font-semibold tracking-tight text-[#0c111d] dark:text-white transition-colors">Devender</span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 pointer-events-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          {[
            { label: 'About', href: '#sec-identity' },
            { label: 'Work', href: '#sec-showcase' },
            { label: 'Tech Stack', href: '#sec-skills' },
            { label: 'Services', href: '#sec-services' },
          ].map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              className="relative text-[#0c111d]/75 dark:text-white/80 hover:text-[#0055ff] dark:hover:text-blue-400 font-medium text-xs tracking-wide uppercase transition-colors rounded py-1 px-1 group flex items-center font-mono"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#0055ff] transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </a>
          ))}
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <a 
            href="mailto:devendhargopagoni@gmail.com" 
            className="hidden sm:flex items-center justify-center bg-[#0c111d] dark:bg-white text-white dark:text-[#0c111d] font-semibold text-xs px-5 py-2.5 rounded-full hover:bg-black dark:hover:bg-white/90 shadow-sm hover:shadow transition-all duration-300 min-h-[40px] focus:outline-none"
          >
            Get in touch &rarr;
          </a>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer Overlay (Always mounted for DOM stability) */}
      <div 
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-lg md:hidden flex flex-col justify-between p-8 pt-28 transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
        }`}
      >
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs text-blue-400 uppercase tracking-widest">NAVIGATION</span>
          <div className="flex flex-col gap-5">
            {[
              { label: 'About Me', href: '#sec-identity' },
              { label: 'Selected Work', href: '#sec-showcase' },
              { label: 'Tech Stack & Skills', href: '#sec-skills' },
              { label: 'Services Offered', href: '#sec-services' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-light text-white hover:text-blue-400 transition-colors flex items-center justify-between border-b border-white/10 pb-3"
              >
                <span>{item.label}</span>
                <span className="text-sm font-mono text-white/40">&rarr;</span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
          <a
            href="mailto:devendhargopagoni@gmail.com"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-center text-sm shadow-md hover:bg-zinc-200 transition-colors"
          >
            Get In Touch &rarr;
          </a>
          <div className="flex justify-between text-xs font-mono text-white/50 pt-2">
            <a href="https://github.com/devendharoff" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
            <a href="https://www.linkedin.com/in/devender-goud-033875338/" target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>
            <a href="https://www.instagram.com/connects.ai" target="_blank" rel="noreferrer" className="hover:text-white">Connects AI</a>
          </div>
        </div>
      </div>

      {/* SECTION 1: HERO */}
      <section 
        id="sec-hero" 
        className="relative w-full h-screen overflow-hidden bg-white flex items-center"
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Layer 1: Base portrait */}
        <div
          id="hero-base-portrait"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover pointer-events-none animate-hero-base"
          style={{ backgroundImage: 'url("/images/Base_image_desktop.png")' }}
        />

        {/* Layer 2: Reveal portrait */}
        <div
          id="hero-reveal-portrait"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover pointer-events-none"
          style={{
            backgroundImage: 'url("/images/Reveal_image_desktop.png")',
            WebkitMaskImage: 'radial-gradient(circle var(--reveal-radius) at var(--reveal-x) var(--reveal-y), black 100%, transparent 100%)',
            maskImage: 'radial-gradient(circle var(--reveal-radius) at var(--reveal-x) var(--reveal-y), black 100%, transparent 100%)',
          }}
        />

        {/* Layer 3: Technical grid and large circle */}
        <div 
          id="hero-grid" 
          aria-hidden="true" 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.06] border-t border-b border-[#0c111d]/20 bg-[linear-gradient(to_right,#0c111d_1px,transparent_1px),linear-gradient(to_bottom,#0c111d_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          {/* Construction circle */}
          <div className="absolute w-[80vh] aspect-square rounded-full border border-[#0c111d]/5" />
        </div>

        {/* Layer 4: Headline and copy */}
        <div className="absolute inset-0 flex flex-col justify-between p-[max(2.5rem,safe-area-top)_max(5.6vw,2rem)_8vh] pointer-events-none">
          
          {/* Heading (approx 34% from top on desktop) */}
          <div className="flex flex-col items-start mt-[34vh] pl-[max(5.6vw,2rem)]">
            <h1 
              className="text-[#0c111d] font-light tracking-[-0.085em] select-none text-[clamp(3.5rem,6.2vw,6.8rem)] md:text-[clamp(5.4rem,6.2vw,6.8rem)]"
              style={{ lineHeight: 0.93 }}
            >
              <span className="block opacity-0 animate-line-up [animation-delay:300ms]">Building</span>
              <span className="block opacity-0 animate-line-up [animation-delay:450ms]">Beyond</span>
              <span className="block opacity-0 animate-line-up [animation-delay:600ms]">Possible.</span>
            </h1>
          </div>

          {/* Bottom layout row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 w-full mt-auto px-[max(5.6vw,2rem)]">
            {/* Bottom left copy & explore button */}
            <div className="flex flex-col items-start gap-6 max-w-[480px] animate-fade-up opacity-0 [animation-delay:750ms]">
              <p className="text-gray-600 text-[1.05rem] leading-relaxed font-light select-none">
                I specialize in designing and developing premium websites, SaaS platforms, AI-powered applications, dashboards, and modern digital experiences.
              </p>
              <a 
                href="#sec-showcase" 
                className="pointer-events-auto flex items-center justify-center bg-[#0c111d] hover:bg-black text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none min-h-[44px]"
              >
                Explore my work
              </a>
            </div>

            {/* Right side Fragment Mono manifesto */}
            <div className="font-mono text-xs tracking-[0.25em] text-gray-400 text-left md:text-right select-none animate-fade-up opacity-0 [animation-delay:750ms]">
              <span className="block">BUILDING THE</span>
              <span className="block">NEXT VERSION</span>
              <span className="block">IN PUBLIC</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: IDENTITY REVEAL */}
      <section 
        id="sec-identity" 
        className="story-sec bg-[#0B0B0D] text-white px-[max(5.6vw,2rem)] flex items-center z-10"
        onMouseMove={handleSec2MouseMove}
        onMouseLeave={handleSec2MouseLeave}
      >
        <div className="w-full max-w-[90vw] mx-auto grid grid-cols-1 lg:grid-cols-[40%_60%] items-center gap-16">
          <div className="relative w-full flex items-center justify-center">
            <div 
              id="identity-glow"
              className="absolute w-[90%] aspect-square rounded-full bg-[#0055ff] blur-[100px] pointer-events-none z-0"
              style={{
                animation: 'idGlowCycle 8s ease-in-out infinite',
              }}
            />

            <div className="absolute w-[80%] aspect-square rounded-full border border-white/5 z-0" />

            <div 
              id="identity-portrait" 
              className="relative w-[85%] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-cover bg-center bg-no-repeat grayscale z-10 transition-transform duration-100 ease-out"
              style={{
                backgroundImage: 'url("/images/Base_image_desktop.png")',
                animation: 'idFloatBreathing 10s ease-in-out infinite',
              }}
            />
          </div>

          <div id="identity-heading-block" className="flex flex-col items-start gap-8">
            <span className="font-mono tracking-[0.35em] text-white/60 text-xs uppercase block">Who Am I?</span>

            <h2 className="text-white font-light leading-[0.90] tracking-tighter text-[clamp(2.5rem,5.2vw,5.5rem)] flex flex-col">
              <span className="block overflow-hidden pb-1">I don&apos;t just design.</span>
              <span className="relative inline-block font-medium group cursor-pointer overflow-hidden pb-3">
                I build{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-[#0055ff] to-indigo-400 group-hover:from-blue-300 group-hover:via-blue-500 group-hover:to-indigo-300 transition-all duration-300">
                  experiences.
                </span>
                
                <svg id="experiences-underline" className="absolute bottom-0 left-0 w-full h-3 pointer-events-none" viewBox="0 0 350 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7C55 5.5 180 3 345 5.5" stroke="#0055ff" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="400" strokeDashoffset="400" />
                </svg>
              </span>
            </h2>

            <div id="identity-paragraph" className="max-w-[520px] text-white/70 text-[1.05rem] leading-relaxed font-light flex flex-col gap-6">
              <p>
                Hi, I&apos;m Devender, a Full-Stack Web Developer and UI/UX-focused Product Builder.
              </p>
              <p>
                I specialize in designing and developing premium websites, SaaS platforms, AI-powered applications, dashboards, and modern digital experiences. My approach combines clean design, scalable architecture, and high performance to create products that not only look great but also solve real business problems.
              </p>
              <p>
                I work with startups, founders, agencies, and businesses to transform ideas into production-ready applications.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full mt-10">
              <div className="stat-card-el group flex flex-col items-start gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all hover:scale-[1.03]">
                <span className="text-3xl font-normal text-white">{stat1}+</span>
                <span className="text-[0.75rem] font-mono text-white/50 uppercase tracking-widest">Projects Crafted</span>
                <div className="w-full h-[1px] bg-[#0055ff]/20 mt-2 group-hover:bg-[#0055ff]/60 transition-colors" />
              </div>

              <div className="stat-card-el group flex flex-col items-start gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all hover:scale-[1.03]">
                <span className="text-3xl font-normal text-white">{stat2 || 'AI'}</span>
                <span className="text-[0.75rem] font-mono text-white/50 uppercase tracking-widest">First Workflow</span>
                <div className="w-full h-[1px] bg-[#0055ff]/20 mt-2 group-hover:bg-[#0055ff]/60 transition-colors" />
              </div>

              <div className="stat-card-el group flex flex-col items-start gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all hover:scale-[1.03]">
                <span className="text-2xl font-normal text-white flex items-center gap-1">Design <span className="text-[10px] text-white/30">&times;</span> Dev</span>
                <span className="text-[0.75rem] font-mono text-white/50 uppercase tracking-widest">Full-Stack Core</span>
                <div className="w-full h-[1px] bg-[#0055ff]/20 mt-2 group-hover:bg-[#0055ff]/60 transition-colors" />
              </div>

              <div className="stat-card-el group flex flex-col items-start gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all hover:scale-[1.03]">
                <span className="text-3xl font-normal text-white">Always</span>
                <span className="text-[0.75rem] font-mono text-white/50 uppercase tracking-widest">Learning</span>
                <div className="w-full h-[1px] bg-[#0055ff]/20 mt-2 group-hover:bg-[#0055ff]/60 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 01 / THE APPROACH */}
      <section id="sec-approach" className="story-sec bg-[#f8f9fa] text-zinc-900 py-32 px-[max(5.6vw,2rem)] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.2em] text-zinc-900 uppercase bg-zinc-200/90 px-3.5 py-1.5 rounded-full border border-zinc-300/80 shadow-2xs">01 / THE APPROACH</span>
            <span className="font-mono text-xs font-semibold text-zinc-700">Engineering Philosophy</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <h2 className="lg:col-span-8 text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.15] text-zinc-900">
              I don&apos;t just design interfaces. <br className="hidden md:inline" />
              I design how ideas become products.
            </h2>
            <div className="lg:col-span-4 flex flex-col gap-6 pt-2">
              <p className="text-zinc-600 text-sm md:text-base font-light leading-relaxed">
                From the first sketch to the final interaction, I work across product thinking, interface design, prototyping and development — using technology as a creative material.
              </p>
              <a href="#sec-about" className="inline-flex items-center gap-2 font-mono text-xs text-zinc-900 font-medium tracking-wider hover:translate-x-1 transition-transform">
                <span>More about me</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 02 / SELECTED WORK — ASYMMETRICAL EDITORIAL LAYOUT WITH 3D MOTION PHYSICS */}
      <section id="sec-showcase" className="story-sec bg-[#f8f9fa] text-zinc-900 py-24 px-[max(5.6vw,2rem)] relative z-20 border-t border-zinc-200/60">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="flex items-center justify-between w-full border-b border-zinc-200 pb-6">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.2em] text-zinc-900 uppercase bg-zinc-200/90 px-3.5 py-1.5 rounded-full border border-zinc-300/80 shadow-2xs">02 / SELECTED WORK</span>
            <span className="font-mono text-xs font-semibold text-zinc-700 hover:text-blue-600 transition-colors cursor-pointer">View all projects &rarr;</span>
          </div>

          <h2 id="sec-showcase-title" className="text-3xl md:text-5xl font-light tracking-tight text-zinc-900 leading-[1.15]">
            Things I&apos;ve designed, built & shipped.
          </h2>

          {/* Project 01: Featured Horizontal Banner Card */}
          <div
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="project-card-item group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,85,255,0.12)] transition-all duration-500 will-change-transform relative"
          >
            {/* Light sheen sweep overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10" />

            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between gap-8 bg-zinc-50/50 relative z-20">
              <div className="flex flex-col gap-4">
                <span className="font-mono text-xs font-semibold text-zinc-700 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 w-fit">01 / FEATURED</span>
                <h3 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                  NoMoreDMS
                </h3>
                <p className="text-zinc-600 text-xs md:text-sm font-light leading-relaxed">
                  AI-powered job application & creator resource automation platform designed to eliminate unnecessary direct messages with a single hub.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Product Design', 'AI', 'Full Stack'].map((t, i) => (
                    <span key={i} className="text-[10px] font-mono font-medium px-3 py-1 rounded-full bg-zinc-100/90 text-zinc-600 border border-zinc-200/80">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <a href="https://nomoredms.vercel.app/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100/90 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-full border border-zinc-200/80 group-hover:border-blue-600 transition-all duration-300 w-fit shadow-2xs">
                <span>View case study</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
              </a>
            </div>
            <div className="lg:col-span-7 bg-zinc-950 min-h-[320px] md:min-h-[420px] relative overflow-hidden flex items-center justify-center p-6 md:p-8">
              <img src="/images/projects/nomoredms.png" alt="NoMoreDMS" className="w-full h-full object-cover rounded-xl shadow-2xl group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            </div>
          </div>

          {/* Project 02 & 03: Alternate Zig-Zag Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Project 02 */}
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="lg:col-span-7 project-card-item group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,85,255,0.12)] transition-all duration-500 will-change-transform relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10" />

              <div className="bg-zinc-100 min-h-[280px] relative overflow-hidden p-6">
                <img src="/images/projects/educalc.png" alt="EduCalc" className="w-full h-full object-cover rounded-xl shadow-lg group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
              <div className="p-8 flex flex-col justify-between gap-6 flex-1">
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-xs font-semibold text-zinc-700 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 w-fit">02</span>
                  <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                    EduCalc
                  </h3>
                  <p className="text-zinc-600 text-xs md:text-sm font-light leading-relaxed">
                    A smarter way to calculate, discover, organize and run educational math & logic tasks.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['Product Design', 'Automation', 'Math Engine'].map((t, i) => (
                      <span key={i} className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-zinc-100/90 text-zinc-600 border border-zinc-200/80">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <a href="https://educalc-expert0509.vercel.app/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100/90 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-full border border-zinc-200/80 group-hover:border-blue-600 transition-all duration-300 w-fit shadow-2xs">
                  <span>View project</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Project 03 */}
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="lg:col-span-5 project-card-item group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,85,255,0.12)] transition-all duration-500 will-change-transform relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10" />

              <div className="p-8 flex flex-col justify-between gap-6 flex-1 bg-zinc-50/50">
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-xs font-semibold text-zinc-700 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 w-fit">03</span>
                  <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                    Personal Portfolio
                  </h3>
                  <p className="text-zinc-600 text-xs md:text-sm font-light leading-relaxed">
                    Reimagining personal branding with liquid cursor masks, layout layers & motion physics.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['UX / UI Design', 'Research', 'Development'].map((t, i) => (
                      <span key={i} className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-zinc-100/90 text-zinc-600 border border-zinc-200/80">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <a href="https://devendhargopagoni.netlify.app/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100/90 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-full border border-zinc-200/80 group-hover:border-blue-600 transition-all duration-300 w-fit shadow-2xs">
                  <span>View project</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                </a>
              </div>
              <div className="bg-zinc-900 min-h-[220px] relative overflow-hidden p-4">
                <img src="/images/projects/personalportfolio.jpg" alt="Personal Portfolio" className="w-full h-full object-cover rounded-lg shadow-md group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
            </div>
          </div>

          {/* Project 04, 05, 06 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '04', title: 'PostLearn', desc: 'Modern learning platform delivering educational content intuitively.', url: 'https://postlearn-lake.vercel.app/', thumb: '/images/projects/postlearn.png', tags: ['Learning', 'React', 'TypeScript'] },
              { num: '05', title: 'Cozy Cafe', desc: 'Bespoke cafe website featuring online menus and reservation flows.', url: 'https://cozy-cafa1.netlify.app/', thumb: '/images/projects/cozy-cafe.png', tags: ['Hospitality', 'HTML5', 'CSS3'] },
              { num: '06', title: 'Akshith Portfolio', desc: 'Personal portfolio built for a client to establish digital presence.', url: 'https://maatoori-akshith.netlify.app/', thumb: '/images/projects/maatoori-akshith.jpg', tags: ['Client', 'Framer', 'Tailwind'] },
            ].map((p) => (
              <div
                key={p.num}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="project-card-item group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden flex flex-col shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,85,255,0.12)] transition-all duration-500 will-change-transform relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10" />

                <div className="h-48 bg-zinc-100 overflow-hidden relative">
                  <img src={p.thumb} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </div>
                <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-zinc-700 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200/80 w-fit">{p.num}</span>
                    <h4 className="text-xl font-semibold text-zinc-900 mt-2 group-hover:text-blue-600 transition-colors duration-300">{p.title}</h4>
                    <p className="text-zinc-600 text-xs font-light mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100/90 group-hover:bg-blue-600 group-hover:text-white px-3.5 py-1.5 rounded-full border border-zinc-200/80 group-hover:border-blue-600 transition-all duration-300 w-fit shadow-2xs">
                    <span>View project</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 / TECH STACK & ECOSYSTEM — EXACT REFERENCE MATCH LAYOUT */}
      <section id="sec-skills" className="story-sec bg-[#f8f9fa] text-zinc-900 py-24 px-[max(5.6vw,2rem)] relative z-20 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.2em] text-zinc-900 uppercase bg-zinc-200/90 px-3.5 py-1.5 rounded-full border border-zinc-300/80 shadow-2xs">03 / TECH STACK & ECOSYSTEM</span>
            <span className="font-mono text-xs font-semibold text-zinc-700">Core Technologies</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Floating Tech Icons & Interactive Illustration Box */}
            <div className="lg:col-span-6 relative min-h-[480px] flex items-center justify-center p-8 bg-white border border-zinc-200/80 rounded-3xl shadow-sm overflow-hidden">
              {/* Grid Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* Floating Node.js Icon */}
              <div className="absolute top-6 left-6 animate-[float_6s_ease-in-out_infinite] z-10 flex items-center gap-2.5 bg-white/95 backdrop-blur border border-zinc-200/90 px-4 py-2 rounded-2xl shadow-md hover:scale-105 transition-transform">
                <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" className="w-7 h-7" />
                <span className="font-mono text-xs font-semibold text-zinc-800">Node.js</span>
              </div>

              {/* Floating HTML5 Icon */}
              <div className="absolute top-16 right-6 animate-[float_7s_ease-in-out_infinite_1s] z-10 flex items-center gap-2 bg-white/95 backdrop-blur border border-zinc-200/90 px-3.5 py-2 rounded-2xl shadow-md hover:scale-105 transition-transform">
                <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML5" className="w-7 h-7" />
                <span className="font-mono text-xs font-semibold text-zinc-800">HTML5</span>
              </div>

              {/* Floating Google Cloud Icon */}
              <div className="absolute top-8 left-1/3 animate-[float_5s_ease-in-out_infinite_0.5s] z-10 flex items-center gap-2 bg-white/95 backdrop-blur border border-zinc-200/90 px-3.5 py-2 rounded-2xl shadow-md hover:scale-105 transition-transform">
                <img src="https://images.shadcnspace.com/assets/svgs/gemini.svg" alt="Google Cloud" className="w-7 h-7" />
                <span className="font-mono text-xs font-semibold text-zinc-800">Google Cloud</span>
              </div>

              {/* Floating React Icon */}
              <div className="absolute bottom-20 right-8 animate-[float_6s_ease-in-out_infinite_1.5s] z-10 flex items-center gap-2 bg-white/95 backdrop-blur border border-zinc-200/90 px-4 py-2 rounded-2xl shadow-md hover:scale-105 transition-transform">
                <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" className="w-7 h-7" />
                <span className="font-mono text-xs font-semibold text-zinc-800">React</span>
              </div>

              {/* Floating Supabase Icon */}
              <div className="absolute bottom-32 left-6 animate-[float_8s_ease-in-out_infinite_0.8s] z-10 flex items-center gap-2 bg-white/95 backdrop-blur border border-zinc-200/90 px-3.5 py-2 rounded-2xl shadow-md hover:scale-105 transition-transform">
                <img src="https://images.shadcnspace.com/assets/svgs/supabase.svg" alt="Supabase" className="w-7 h-7" />
                <span className="font-mono text-xs font-semibold text-zinc-800">Supabase</span>
              </div>

              {/* Floating TypeScript Icon */}
              <div className="absolute top-44 right-4 animate-[float_6.5s_ease-in-out_infinite_0.3s] z-10 flex items-center gap-2 bg-white/95 backdrop-blur border border-zinc-200/90 px-3.5 py-2 rounded-2xl shadow-md hover:scale-105 transition-transform">
                <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" className="w-7 h-7" />
                <span className="font-mono text-xs font-semibold text-zinc-800">TypeScript</span>
              </div>

              {/* Center Transparent Developer Illustration */}
              <div className="relative z-0 flex flex-col items-center justify-center pt-8 pb-4">
                <div className="w-64 md:w-72 max-h-[340px] flex items-center justify-center relative">
                  <img
                    src="/images/tech-developer-illustration-transparent.png"
                    alt="Devender Gopagoni - Full-Stack Developer Illustration"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>
                <div className="mt-4 flex flex-col items-center text-center">
                  <span className="font-mono text-sm font-semibold text-zinc-900">Devender Gopagoni</span>
                  <span className="text-zinc-500 font-sans text-xs font-light">Full-Stack Tech Architecture</span>
                </div>
              </div>
            </div>

            {/* Right Column: Categorized Tech Checklist with Official Tech Badges */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {[
                {
                  title: 'Frontend',
                  skills: [
                    { name: 'React.js', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg' },
                    { name: 'Next.js', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg' },
                    { name: 'TypeScript', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg' },
                    { name: 'JavaScript (ES6+)', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg' },
                    { name: 'HTML5', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg' },
                    { name: 'CSS3', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg' },
                    { name: 'Tailwind CSS', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg' },
                  ]
                },
                {
                  title: 'Backend',
                  skills: [
                    { name: 'Node.js', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg' },
                    { name: 'Express.js', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg' },
                    { name: 'REST APIs', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/postman/postman-original.svg' },
                    { name: 'Supabase', icon: 'https://images.shadcnspace.com/assets/svgs/supabase.svg' },
                    { name: 'PostgreSQL', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg' },
                  ]
                },
                {
                  title: 'CMS & Platforms',
                  skills: [
                    { name: 'WordPress', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/wordpress/wordpress-original.svg' },
                    { name: 'Shopify', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/shopify/shopify-original.svg' },
                  ]
                },
                {
                  title: 'AI & Automation',
                  skills: [
                    { name: 'OpenAI Integration', icon: 'https://images.shadcnspace.com/assets/svgs/gemini.svg' },
                    { name: 'AI Chatbots', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg' },
                    { name: 'WhatsApp Automation', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/postman/postman-original.svg' },
                    { name: 'AI Agents', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg' },
                    { name: 'AI Workflow Automation', icon: 'https://images.shadcnspace.com/assets/svgs/supabase.svg' },
                    { name: 'CRM Automation', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg' },
                  ]
                },
                {
                  title: 'Capabilities & Deployment',
                  skills: [
                    { name: 'Responsive UI/UX', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/figma/figma-original.svg' },
                    { name: 'SEO Optimization', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg' },
                    { name: 'Performance Optimization', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg' },
                    { name: 'Authentication Systems', icon: 'https://images.shadcnspace.com/assets/svgs/supabase.svg' },
                    { name: 'Dashboard Development', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg' },
                    { name: 'API Integrations', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/postman/postman-original.svg' },
                    { name: 'Deployment & Hosting', icon: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/netlify/netlify-original.svg' },
                  ]
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 hover:bg-white border border-zinc-200/60 hover:border-zinc-300 shadow-2xs hover:shadow-md transition-all duration-300 group cursor-pointer">
                  {/* Blue Checkmark Circle Badge */}
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-lg font-semibold text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.skills.map((s, sIdx) => (
                        <div key={sIdx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100/90 border border-zinc-200/80 text-zinc-700 text-xs font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all">
                          <img src={s.icon} alt={s.name} className="w-3.5 h-3.5 object-contain" />
                          <span>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* 04 / SERVICES & CORE OFFERINGS */}
      <section id="sec-services" className="story-sec bg-[#f8f9fa] text-zinc-900 py-28 px-[max(5.6vw,2rem)] relative z-20 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
            <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.2em] text-zinc-900 uppercase bg-zinc-200/90 px-3.5 py-1.5 rounded-full border border-zinc-300/80 shadow-2xs">04 / SERVICES</span>
            <span className="font-mono text-xs font-semibold text-zinc-700">Bespoke Digital Solutions</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-zinc-900 max-w-2xl leading-[1.15]">
              Services tailored to build, scale & elevate your product.
            </h2>
            <a href="#sec-cta-footer" className="inline-flex items-center gap-2 font-mono text-xs font-medium text-zinc-900 hover:text-blue-600 transition-colors">
              <span>Start a project</span>
              <span>&rarr;</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                num: '01',
                title: 'SaaS Applications & Dashboards',
                subtitle: 'Scalable web apps & admin management',
                desc: 'Engineering robust web applications with Next.js, React, Node.js, and Supabase. Building clean user management, resource dashboards, and production-ready APIs.',
                deliverables: ['Custom Web Applications', 'SaaS Platform Architecture', 'User Authentication & Dashboards', 'REST APIs & Supabase'],
                tech: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Supabase', 'Vercel']
              },
              {
                num: '02',
                title: 'AI & Workflow Automation',
                subtitle: 'AI Agents, Chatbots & CRM Pipelines',
                desc: 'Building OpenAI API integrations, AI chatbots, WhatsApp automation, AI workflow pipelines, and custom AI agents that automate business operations.',
                deliverables: ['OpenAI Integration', 'AI Chatbots & Agents', 'WhatsApp & CRM Automation', 'AI Workflow Engines'],
                tech: ['OpenAI API', 'Node.js', 'Python', 'REST APIs', 'Supabase']
              },
              {
                num: '03',
                title: 'Corporate & Business Websites',
                subtitle: 'High-conversion business presence',
                desc: 'Developing high-performance corporate and business websites on Next.js, WordPress, and Shopify with responsive layouts and strategic SEO.',
                deliverables: ['Corporate Websites', 'Business Web Portals', 'WordPress & Shopify Solutions', 'SEO & Speed Optimization'],
                tech: ['Next.js', 'React', 'WordPress', 'Shopify', 'Tailwind CSS']
              },
              {
                num: '04',
                title: 'Landing Pages & Personal Branding',
                subtitle: 'Premium UI/UX & portfolio experiences',
                desc: 'Designing and building high-conversion landing pages and personal portfolio websites that establish strong digital presence and drive business results.',
                deliverables: ['High-Conversion Landing Pages', 'Personal Portfolio Websites', 'Responsive UI/UX Design', 'Modern Micro-Animations'],
                tech: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP']
              }
            ].map((srv) => (
              <div
                key={srv.num}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="service-card-item group bg-white border border-zinc-200/80 rounded-3xl p-8 md:p-10 flex flex-col justify-between gap-8 shadow-sm hover:shadow-2xl transition-all duration-500 will-change-transform relative overflow-hidden"
              >
                {/* Sheen sweep overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10" />

                <div className="flex flex-col gap-6 relative z-20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-zinc-400 font-medium px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200">{srv.num}</span>
                    <span className="font-mono text-[10px] text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 font-medium">{srv.subtitle}</span>
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-3xl font-light text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                      {srv.title}
                    </h3>
                    <p className="text-zinc-500 text-xs md:text-sm font-light leading-relaxed mt-3">
                      {srv.desc}
                    </p>
                  </div>

                  {/* Deliverables checklist */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Deliverables</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {srv.deliverables.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-light text-zinc-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 relative z-20 pt-4 border-t border-zinc-100">
                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {srv.tech.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                        {t}
                      </span>
                    ))}
                  </div>

                  <a href="#sec-cta-footer" className="inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-900 group-hover:text-blue-600 transition-colors pt-2">
                    <span>Inquire for this service</span>
                    <span className="group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CINEMATIC CLOSING CTA & FOOTER */}
      <section id="sec-cta-footer" className="story-sec bg-[#050507] text-white pt-24 md:pt-32 pb-16 px-[max(4vw,1.5rem)] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-16 md:gap-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end justify-between border-b border-white/10 pb-16 md:pb-20">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <span className="font-mono text-xs text-blue-400 uppercase tracking-widest">GET IN TOUCH</span>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-extralight tracking-tight leading-tight md:leading-none text-white">
                Have an idea? <br />
                <span className="text-white/50">Let&apos;s turn it into something real.</span>
              </h2>
            </div>

            {/* Social Logos & Email Action Buttons */}
            <div className="lg:col-span-5 flex flex-col items-start lg:items-end gap-5">
              <a
                href="mailto:devendhargopagoni@gmail.com"
                className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-all hover:scale-105 flex items-center gap-3 shadow-lg w-full sm:w-auto justify-center group text-sm"
              >
                <svg className="w-5 h-5 text-black group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Get In Touch</span>
                <span>&rarr;</span>
              </a>

              {/* Official Social Media Brand Logos Grid */}
              <div className="flex flex-wrap gap-3 items-center">
                <a
                  href="https://github.com/devendharoff"
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub Profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-zinc-800 border border-white/10 hover:border-white/30 text-white text-xs font-mono transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/devender-goud-033875338/"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn Profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#0077b5] border border-white/10 hover:border-blue-400 text-white text-xs font-mono transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://www.instagram.com/connects.ai"
                  target="_blank"
                  rel="noreferrer"
                  title="Connects AI Instagram"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 border border-white/10 hover:border-pink-400 text-white text-xs font-mono transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Connects AI</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs font-mono text-white/60">
            <div className="flex flex-col gap-2">
              <span className="text-white font-semibold text-base font-sans">Devender</span>
              <span>Full-Stack Web Developer &amp; UI/UX Product Builder</span>
              <span className="text-white/40 text-[11px] mt-1">Transforming ideas into production-ready web apps.</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white/40 uppercase">Navigation</span>
              <a href="#sec-identity" className="hover:text-white transition-colors">About</a>
              <a href="#sec-showcase" className="hover:text-white transition-colors">Work</a>
              <a href="#sec-skills" className="hover:text-white transition-colors">Tech Stack</a>
              <a href="#sec-services" className="hover:text-white transition-colors">Services</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white/40 uppercase">Social &amp; Platforms</span>
              <a href="https://github.com/devendharoff" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span>GitHub: @devendharoff</span>
              </a>
              <a href="https://www.linkedin.com/in/devender-goud-033875338/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                <span>LinkedIn: Devender Goud</span>
              </a>
              <a href="https://www.instagram.com/connects.ai" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span>Connects AI</span>
              </a>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <span>Direct Contact</span>
              <a href="mailto:devendhargopagoni@gmail.com" className="text-white hover:underline">devendhargopagoni@gmail.com</a>
              <span className="text-white/30 mt-3">&copy; 2026 Devender. All rights reserved.</span>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
