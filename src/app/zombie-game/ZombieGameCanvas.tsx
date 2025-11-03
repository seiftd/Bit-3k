'use client';

import { useEffect, useRef } from 'react';

export interface ZombieGameCanvasProps {
  userId?: string;
  jwtToken?: string;
  apiUrl: string;
}

export default function ZombieGameCanvas({ userId, jwtToken, apiUrl }: ZombieGameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    let destroyed = false;

    async function boot() {
      const Phaser = (await import('phaser')).default;
      const { createGameConfig } = await import('./phaser/config');

      if (!containerRef.current || destroyed) return;

      const config = createGameConfig(Phaser, containerRef.current, {
        userId,
        jwtToken,
        apiUrl,
      });

      gameRef.current = new Phaser.Game(config);
    }

    boot();

    return () => {
      destroyed = true;
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch { /* noop */ }
        gameRef.current = null;
      }
    };
  }, [userId, jwtToken, apiUrl]);

  return (
    <div className="w-full flex justify-center">
      <div ref={containerRef} style={{ width: '100%', maxWidth: 768, aspectRatio: '9 / 16' }} />
    </div>
  );
}



