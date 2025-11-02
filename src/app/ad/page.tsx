'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Monetization ad function (declare at top level)
declare global {
  interface Window {
    show_10119514?: () => Promise<void>;
  }
}

function AdPageContent() {
  const searchParams = useSearchParams();
  const adToken = searchParams.get('token');
  const [timeLeft, setTimeLeft] = useState(15);
  const [canClose, setCanClose] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [adWatched, setAdWatched] = useState(false);

  useEffect(() => {
    // Load libtl.com monetization script dynamically
    const loadAdScript = () => {
      if (typeof window === 'undefined') return Promise.resolve();
      
      // Check if libtl script already loaded
      const existingLibtlScript = document.querySelector('script[src="//libtl.com/sdk.js"]');
      
      if (existingLibtlScript) {
        // Script tag exists, wait for function to be available
        return new Promise<void>((resolve) => {
          let attempts = 0;
          const checkInterval = setInterval(() => {
            if (window.show_10119514 && typeof window.show_10119514 === 'function') {
              clearInterval(checkInterval);
              resolve();
            } else if (attempts++ > 30) {
              clearInterval(checkInterval);
              resolve(); // Timeout, continue anyway
            }
          }, 200);
        });
      }
      
      // Load libtl.com script dynamically
      return new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = '//libtl.com/sdk.js';
        script.setAttribute('data-zone', '10119514');
        script.setAttribute('data-sdk', 'show_10119514');
        script.async = true;
        
        script.onload = () => {
          // Wait for the function to be available
          let attempts = 0;
          const checkInterval = setInterval(() => {
            if (window.show_10119514 && typeof window.show_10119514 === 'function') {
              clearInterval(checkInterval);
              resolve();
            } else if (attempts++ > 30) {
              clearInterval(checkInterval);
              resolve(); // Timeout, continue anyway
            }
          }, 200);
        };
        
        script.onerror = () => {
          console.warn('Failed to load libtl.com script');
          resolve(); // Continue anyway
        };
        
        document.head.appendChild(script);
      });
    };

    if (!adToken) {
      setError('Invalid ad token');
      return;
    }

    // Show monetization ad
    const showAd = async () => {
      try {
        // Load script first
        await loadAdScript();
        
        // Wait a bit more for initialization
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (typeof window !== 'undefined' && window.show_10119514 && typeof window.show_10119514 === 'function') {
          // Use the libtl.com ad function
          await window.show_10119514().then(() => {
            // Ad completed callback
            console.log('Ad watched successfully!');
            setAdWatched(true);
          }).catch((err: any) => {
            console.error('Ad error:', err);
            // Continue anyway if ad fails
            setAdWatched(true);
          });
        } else {
          // If monetization script not loaded, show warning but continue
          console.warn('Monetization script not loaded, continuing anyway');
          setAdWatched(true);
        }
      } catch (err) {
        console.error('Error showing ad:', err);
        // Continue anyway if ad fails
        setAdWatched(true);
      }
    };

    // Start countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Show ad when component mounts
    showAd();

    return () => clearInterval(interval);
  }, [adToken]);

  const completeAd = useCallback(async () => {
    if (!adToken || !canClose || loading || completed) return;

    setLoading(true);
    setError(null);

    try {
      // Get user data from Telegram WebApp
      const telegramWebApp = (window as any).Telegram?.WebApp;
      const initData = telegramWebApp?.initData;

      if (!initData) {
        throw new Error('Telegram WebApp data not available');
      }

      // Parse init data to get user info
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      
      if (!userStr) {
        throw new Error('User data not found');
      }

      const user = JSON.parse(userStr);

      // First, authenticate
      const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          language_code: user.language_code || 'en',
        }),
      });

      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }

      const authData = await authResponse.json();
      const token = authData.access_token;

      // Try to complete the ad via API (optional, skip if API not available)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-me.aizetecc.com/api';
        const response = await fetch(`${apiUrl}/ads/completed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ad_token: adToken,
            watch_duration: 15,
          }),
        });

        if (!response.ok) {
          // Log but don't fail - ad was watched
          console.warn('Failed to register ad completion with API, but ad was watched');
        }
      } catch (apiError) {
        // API call failed, but ad was watched - continue anyway
        console.warn('API error (continuing anyway):', apiError);
      }

      setCompleted(true);

      // Redirect back to game
      const redirect = searchParams.get('redirect') || '/play';
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = redirect;
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [adToken, canClose, loading, completed]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Success!</h1>
          <p className="text-gray-600">Ad completed. Closing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎬 Ad Time!
          </h1>
          <p className="text-gray-600">
            Watch this ad to unlock your next level
          </p>
        </div>

        {/* Ad Content - Monetization Ad will be displayed here */}
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-8 mb-6 min-h-[200px] flex items-center justify-center">
          {adWatched ? (
            <div className="text-white text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Ad Watched!</h2>
              <p className="text-sm opacity-90">
                Thank you for watching the ad
              </p>
            </div>
          ) : (
            <div className="text-white text-center">
              <div className="text-6xl mb-4">📺</div>
              <h2 className="text-2xl font-bold mb-2">Loading Ad...</h2>
              <p className="text-sm opacity-90">
                Please wait while we load the ad
              </p>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="mb-6">
          {!canClose ? (
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {timeLeft}
              </div>
              <p className="text-gray-500">seconds remaining...</p>
            </div>
          ) : (
            <div className="text-green-600 font-semibold text-lg">
              ✓ Ad completed!
            </div>
          )}
        </div>

        {/* Complete Button */}
        <button
          onClick={completeAd}
          disabled={!canClose || loading}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
            canClose && !loading
              ? 'bg-green-500 hover:bg-green-600 hover:scale-105 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {loading ? 'Processing...' : canClose ? '✅ Continue' : '⏳ Please Wait...'}
        </button>
      </div>
    </div>
  );
}

export default function AdPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading ad...</p>
        </div>
      </div>
    }>
      <AdPageContent />
    </Suspense>
  );
}

