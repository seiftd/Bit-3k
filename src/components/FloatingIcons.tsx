'use client';

import { useEffect, useState } from 'react';

interface FloatingIcon {
  id: number;
  icon: string;
  x: number;
  y: number;
  speed: number;
}

export default function FloatingIcons() {
  const [icons, setIcons] = useState<FloatingIcon[]>([]);

  useEffect(() => {
    const iconSet = ['💰', '⭐', '🎯', '✅', '🔥', '💎'];
    const newIcons = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      icon: iconSet[i],
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.5 + Math.random() * 0.5,
    }));
    setIcons(newIcons);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="absolute text-4xl opacity-20 animate-pulse-glow"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            animation: `float ${3 + icon.id}s ease-in-out infinite`,
            animationDelay: `${icon.id * 0.5}s`,
          }}
        >
          {icon.icon}
        </div>
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
}

