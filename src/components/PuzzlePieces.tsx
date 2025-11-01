'use client';

import { useState, useEffect } from 'react';

interface PuzzlePiecesProps {
  completed?: boolean;
}

export default function PuzzlePieces({ completed = false }: PuzzlePiecesProps) {
  const [pieces, setPieces] = useState([
    { id: 1, color: 'bg-blue-500', delay: 0 },
    { id: 2, color: 'bg-purple-500', delay: 0.1 },
    { id: 3, color: 'bg-pink-500', delay: 0.2 },
    { id: 4, color: 'bg-yellow-500', delay: 0.3 },
  ]);

  useEffect(() => {
    if (completed) {
      // Animate pieces coming together
      setPieces(prev => prev.map(p => ({ ...p, delay: 0 })));
    }
  }, [completed]);

  return (
    <div className="relative w-32 h-32">
      {pieces.map((piece, index) => (
        <div
          key={piece.id}
          className={`absolute ${piece.color} rounded-lg shadow-lg animate-slide-in`}
          style={{
            left: `${index * 20}%`,
            top: `${index * 20}%`,
            width: '40%',
            height: '40%',
            animationDelay: `${piece.delay}s`,
            transform: completed ? 'translate(0, 0)' : `translate(${Math.sin(index) * 10}px, ${Math.cos(index) * 10}px)`,
            transition: 'transform 0.5s ease-in-out',
          }}
        />
      ))}
    </div>
  );
}

