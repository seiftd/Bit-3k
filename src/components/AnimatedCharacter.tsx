'use client';

import { useState, useEffect } from 'react';

interface AnimatedCharacterProps {
  type?: 'tiger' | 'puzzle' | 'brain' | 'star' | 'coin';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AnimatedCharacter({ 
  type = 'brain', 
  size = 'md',
  className = '' 
}: AnimatedCharacterProps) {
  const [isBouncing, setIsBouncing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBouncing(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  };

  const characters = {
    tiger: '🐯',
    puzzle: '🧩',
    brain: '🧠',
    star: '⭐',
    coin: '🪙',
  };

  return (
    <div 
      className={`inline-block ${sizeClasses[size]} ${isBouncing ? 'animate-bounce-slow' : ''} ${className}`}
      style={{
        transform: isBouncing ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'transform 0.5s ease-in-out',
      }}
    >
      {characters[type]}
    </div>
  );
}

