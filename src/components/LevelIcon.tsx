'use client';

import { useState, useEffect } from 'react';

interface LevelIconProps {
  type: 'math' | 'riddle' | 'detective' | 'word' | 'pattern' | 'logic' | 'cartoon' | 'jigsaw';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function LevelIcon({ type, size = 'md', animated = true }: LevelIconProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animated]);

  const icons = {
    math: '🔢',
    riddle: '🧩',
    detective: '🕵️',
    word: '📝',
    pattern: '🔀',
    logic: '🧠',
    cartoon: '🎨',
    jigsaw: '🧩',
  };

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  return (
    <span 
      className={`inline-block ${sizeClasses[size]} ${isAnimating ? 'animate-bounce-slow' : ''} transition-transform duration-300`}
      style={{
        transform: isAnimating ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)',
      }}
    >
      {icons[type] || '❓'}
    </span>
  );
}

