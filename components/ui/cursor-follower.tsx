'use client';

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface CursorFollowerProps {
  imageSrc: string | null;
  isActive: boolean;
}

export function CursorFollower({ imageSrc, isActive }: CursorFollowerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  useEffect(() => {
    if (isTouchDevice || !containerRef.current || !imageRef.current) return;

    // We use GSAP quickTo for high performance cursor tracking
    const xTo = gsap.quickTo(containerRef.current, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(containerRef.current, 'y', { duration: 0.4, ease: 'power3' });

    const moveCursor = (e: MouseEvent) => {
      // Offset by half width/height so it's centered, plus slightly to the bottom right
      xTo(e.clientX + 20);
      yTo(e.clientY + 20);
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [isTouchDevice]);

  // Handle animation states
  useEffect(() => {
    if (!containerRef.current) return;
    
    if (isActive && imageSrc && !isTouchDevice) {
      gsap.to(containerRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out',
      });
    } else {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.in',
      });
    }
  }, [isActive, imageSrc, isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 z-50 pointer-events-none opacity-0 scale-80 overflow-hidden rounded-xl shadow-2xl border border-zinc-200/20 bg-zinc-950 w-64 aspect-video"
      style={{ transformOrigin: 'center center' }}
    >
      {imageSrc && (
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Project Preview"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
