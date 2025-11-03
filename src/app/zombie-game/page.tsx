'use client';

import { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const ZombieGameCanvas = dynamic(() => import('./ZombieGameCanvas'), { ssr: false });

export default function ZombieGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading Zombie Rush...</div>
      </div>
    }>
      <ZombieGamePageInner />
    </Suspense>
  );
}

function ZombieGamePageInner() {
  const params = useSearchParams();
  const userId = params.get('uid') || undefined;
  const token = params.get('token') || undefined;

  const apiUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'https://be-me.aizetecc.com/api', []);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto p-0">
        <ZombieGameCanvas userId={userId} jwtToken={token} apiUrl={apiUrl} />
      </div>
    </div>
  );
}



