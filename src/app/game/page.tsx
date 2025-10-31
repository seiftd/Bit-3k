'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: any;
        MainButton: any;
        HapticFeedback: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        openLink: (url: string) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: any) => void;
        showPopup: (params: any, callback?: any) => void;
        showAlert: (message: string, callback?: any) => void;
        showConfirm: (message: string, callback?: any) => void;
        showScanQrPopup: (params: any, callback?: any) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: any) => void;
        requestWriteAccess: (callback?: any) => void;
        requestContact: (callback?: any) => void;
      };
    };
  }
}

interface Level {
  id: number;
  level_number: number;
  title: string;
  question: string;
  question_ar?: string;
  hint?: string;
  hint_ar?: string;
  sbr_reward: number;
  level_type: string;
}

function GameContent() {
  const searchParams = useSearchParams();
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string; sbr_earned: number; ad_token?: string } | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme colors
      tg.setHeaderColor('#0ea5e9');
      tg.setBackgroundColor('#ffffff');
      
      // Get user data
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setLanguage((user.language_code || 'en').startsWith('ar') ? 'ar' : 'en');
      }
    }

    // Authenticate and get current level
    authenticateAndLoadLevel();
  }, []);

  const authenticateAndLoadLevel = async () => {
    try {
      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData;
      
      if (!initData) {
        // Fallback for testing outside Telegram
        const testToken = localStorage.getItem('test_token');
        if (testToken) {
          setToken(testToken);
          await loadLevel(testToken);
          return;
        }
        throw new Error('Not in Telegram WebApp. Please open from Telegram bot.');
      }

      // Parse user data
      const user = tg?.initDataUnsafe?.user;
      if (!user) {
        throw new Error('User data not available');
      }

      // Authenticate
      const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setToken(authData.access_token);
      
      // Load current level
      await loadLevel(authData.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
      setLoading(false);
    }
  };

  const loadLevel = async (authToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/levels/current`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load level');
      }

      const levelData = await response.json();
      setLevel(levelData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load level');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!level || !token || !answer.trim()) return;

    setSubmitted(true);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/levels/${level.level_number}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answer: answer.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit answer');
      }

      const resultData = await response.json();
      setResult(resultData);

      if (resultData.correct) {
        // Show success with haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } else {
        // Show error with haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setLoading(false);
      setSubmitted(false);
    }
  };

  const watchAd = () => {
    if (result?.ad_token) {
      const adUrl = `${window.location.origin}/ad?token=${result.ad_token}`;
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(adUrl);
      } else {
        window.open(adUrl, '_blank');
      }
    }
  };

  const nextLevel = () => {
    setResult(null);
    setAnswer('');
    setSubmitted(false);
    if (token) {
      loadLevel(token);
    }
  };

  if (loading && !level) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error && !level) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-red-50 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">{language === 'ar' ? 'خطأ' : 'Error'}</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">{language === 'ar' ? 'يرجى فتح البوت من التليجرام' : 'Please open from Telegram bot'}</p>
        </div>
      </div>
    );
  }

  const questionText = language === 'ar' && level?.question_ar ? level.question_ar : level?.question;
  const hintText = language === 'ar' && level?.hint_ar ? level.hint_ar : level?.hint;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        {/* Level Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {language === 'ar' ? 'المستوى' : 'Level'} {level?.level_number}
              </h1>
              <p className="text-gray-600">{level?.title}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">💰 {level?.sbr_reward} SBR</div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{language === 'ar' ? 'السؤال:' : 'Question:'}</h2>
          <p className="text-lg text-gray-700 mb-4 whitespace-pre-wrap">{questionText}</p>
          
          {hintText && (
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold">
                {language === 'ar' ? '💡 التلميح' : '💡 Hint'}
              </summary>
              <p className="mt-2 text-gray-600 italic">{hintText}</p>
            </details>
          )}
        </div>

        {/* Answer Input */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              {language === 'ar' ? 'الإجابة:' : 'Your Answer:'}
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && submitAnswer()}
              placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              disabled={loading || submitted}
            />
            <button
              onClick={submitAnswer}
              disabled={loading || submitted || !answer.trim()}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 disabled:scale-100 text-lg"
            >
              {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (language === 'ar' ? 'إرسال الإجابة' : 'Submit Answer')}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`bg-white rounded-2xl shadow-2xl p-6 mb-4 ${result.correct ? 'border-4 border-green-500' : 'border-4 border-red-500'}`}>
            <div className="text-center">
              <div className="text-6xl mb-4">{result.correct ? '✅' : '❌'}</div>
              <h2 className={`text-2xl font-bold mb-2 ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
                {result.correct ? (language === 'ar' ? 'صحيح!' : 'Correct!') : (language === 'ar' ? 'خطأ!' : 'Incorrect!')}
              </h2>
              <p className="text-gray-600 mb-4">{result.message}</p>
              
              {result.correct && result.sbr_earned > 0 && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-lg font-semibold text-green-700">
                    {language === 'ar' ? '🎉 ربحت' : '🎉 You earned'} {result.sbr_earned} SBR!
                  </p>
                </div>
              )}

              {result.correct && result.ad_token ? (
                <button
                  onClick={watchAd}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 text-lg mb-4"
                >
                  {language === 'ar' ? '🎬 شاهد الإعلان للمستوى التالي' : '🎬 Watch Ad for Next Level'}
                </button>
              ) : result.correct ? (
                <button
                  onClick={nextLevel}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 text-lg"
                >
                  {language === 'ar' ? '➡️ المستوى التالي' : '➡️ Next Level'}
                </button>
              ) : (
                <button
                  onClick={() => { setResult(null); setSubmitted(false); }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 text-lg"
                >
                  {language === 'ar' ? '🔄 حاول مرة أخرى' : '🔄 Try Again'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}

