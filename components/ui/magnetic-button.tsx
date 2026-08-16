'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

export function MagneticButton({
  children,
  className = '',
  disabled = false,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Disable on touch devices (simplified check based on matchMedia pointer: coarse)
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || isMobile || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Calculate distance from center
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    
    // Smooth GSAP animation moving the button towards the cursor (max 4-6px as requested)
    gsap.to(ref.current, {
      x: x * 0.15, // Scale down the movement
      y: y * 0.15,
      duration: 0.6,
      ease: 'power3.out',
    });
  };

  const handleMouseLeave = () => {
    if (disabled || isMobile || !ref.current) return;
    // Spring back to center
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block w-fit h-fit ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
