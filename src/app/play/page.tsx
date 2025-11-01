'use client';

import { useEffect, useState, Suspense } from 'react';
import { gameEngine, GameEngine } from '@/lib/game-engine';
import { GameLevel } from '@/data/levels';
import Link from 'next/link';

function PlayContent() {
  const [level, setLevel] = useState<GameLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string; sbrEarned: number; needsAd?: boolean } | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [stats, setStats] = useState({
    currentLevel: 1,
    sbrBalance: 0,
    totalEarned: 0,
    levelsCompleted: 0,
    totalAdsWatched: 0,
    attempts: {} as Record<number, number>,
    completedLevels: [] as number[],
    lastPlayedAt: new Date(),
    totalEmbeddedLevels: 3000,
    progressPercentage: 0,
    averageAttempts: 0,
  });
  const [engine] = useState<GameEngine>(gameEngine);
  const [showAdModal, setShowAdModal] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp if available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setLanguage((user.language_code || 'en').startsWith('ar') ? 'ar' : 'en');
      }
    }

    // Load current level
    loadLevel();
  }, []);

  const loadLevel = () => {
    if (typeof window === 'undefined') return;
    
    const currentLevel = engine.getCurrentLevel();
    if (currentLevel) {
      setLevel(currentLevel);
      setLoading(false);
      setAnswer('');
      setResult(null);
      setShowHint(false);
      setStats(engine.getStats());
    } else {
      // Game completed!
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!level || !answer.trim()) return;

    const result = engine.submitAnswer(answer.trim());
    setResult(result);
    setStats(engine.getStats());

    // Show ad modal between EVERY level
    if (result.correct) {
      setShowAdModal(true);
    }

    // Haptic feedback if in Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(result.correct ? 'success' : 'error');
    }
  };

  const handleNext = () => {
    setShowAdModal(false);
    setResult(null);
    setShowHint(false);
    const nextLevel = engine.nextLevel();
    
    if (nextLevel) {
      setLevel(nextLevel);
      setAnswer('');
    } else {
      // Game completed!
      setLevel(null);
    }
  };

  const handleWatchAd = () => {
    // Open ad page
    if (typeof window !== 'undefined') {
      const adUrl = `${window.location.origin}/ad?redirect=${encodeURIComponent(window.location.pathname)}`;
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(adUrl);
      } else {
        window.open(adUrl, '_blank');
      }
      
      // After ad, continue to next level
      setTimeout(() => {
        handleNext();
      }, 2000);
    }
  };

  const handleHint = () => {
    const hintResult = engine.useHint();
    if (hintResult.success) {
      setShowHint(true);
      setStats(engine.getStats());
      
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('soft');
      }
    } else {
      alert(language === 'ar' ? 'لا يوجد رصيد كافٍ لاستخدام التلميح' : 'Not enough balance to use hint');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-900 flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-slow">⏳</div>
          <p className="text-xl text-white">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Game completed!
  if (!level) {
    return (
      <div className={`min-h-screen bg-gray-900 flex items-center justify-center p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-700">
          <div className="text-8xl mb-4 animate-bounce-slow">🎉</div>
          <h1 className="text-4xl font-bold mb-4 text-yellow-400">
            {language === 'ar' ? 'تهانينا!' : 'Congratulations!'}
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            {language === 'ar' ? 'لقد أكملت جميع المستويات!' : 'You completed all levels!'}
          </p>
          
          <div className="bg-gray-700 rounded-xl p-6 mb-6 border border-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="text-3xl font-bold text-blue-400">💰</div>
                <div className="text-sm text-gray-400 mt-1">{language === 'ar' ? 'إجمالي SBR' : 'Total SBR'}</div>
                <div className="text-2xl font-bold text-white">{stats.totalEarned.toFixed(1)}</div>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <div className="text-3xl font-bold text-green-400">✅</div>
                <div className="text-sm text-gray-400 mt-1">{language === 'ar' ? 'مستويات' : 'Levels'}</div>
                <div className="text-2xl font-bold text-white">{stats.levelsCompleted}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              engine.resetGame();
              loadLevel();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition transform hover:scale-105 text-lg"
          >
            {language === 'ar' ? '🔄 ابدأ من جديد' : '🔄 Play Again'}
          </button>
        </div>
      </div>
    );
  }

  const questionText = language === 'ar' && level.question_ar ? level.question_ar : level.question;
  const hintText = language === 'ar' && level.hint_ar ? level.hint_ar : level.hint;
  const typeIcon = level.level_type === 'math' ? '🔢' : 
                   level.level_type === 'riddle' ? '🧩' : 
                   level.level_type === 'word' ? '📝' : 
                   level.level_type === 'pattern' ? '🔀' : '❓';

  return (
    <div className={`min-h-screen bg-gray-900 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Stats Cards Bar - Like images */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-3">
          <div className="bg-gray-700 rounded-xl p-3 border-l-4 border-blue-500">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">💰</div>
              <div>
                <div className="text-xs text-gray-400">{language === 'ar' ? 'رصيد' : 'Balance'}</div>
                <div className="text-lg font-bold text-white">{stats.sbrBalance.toFixed(1)}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-xl p-3 border-l-4 border-yellow-500">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="text-xs text-gray-400">{language === 'ar' ? 'المستوى' : 'Level'}</div>
                <div className="text-lg font-bold text-white">{stats.currentLevel}/3000</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-xl p-3 border-l-4 border-green-500">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">✅</div>
              <div>
                <div className="text-xs text-gray-400">{language === 'ar' ? 'مكتمل' : 'Completed'}</div>
                <div className="text-lg font-bold text-white">{stats.levelsCompleted}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Level Card - Dark theme like images */}
        <div className="bg-gray-800 rounded-2xl shadow-xl mb-4 border border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-100 mb-1">{language === 'ar' ? 'المستوى' : 'Level'} {level.level_number}</div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <span className="text-3xl mr-2 animate-bounce-slow">{typeIcon}</span>
                  {level.title}
                </h1>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold bg-white/20 px-3 py-1 rounded-lg text-white">
                  💰 {level.sbr_reward} SBR
                </div>
                <div className="text-xs mt-1 text-blue-100">
                  {engine.getDifficultyBadge(level.difficulty)}
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6">
            <h2 className="text-lg font-bold mb-3 text-white flex items-center">
              <span className="text-2xl mr-2">❓</span>
              {language === 'ar' ? 'السؤال' : 'Question'}
            </h2>
            <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-700">
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                {questionText}
              </p>
            </div>

            {/* Hint Section */}
            {hintText && (
              <details className="mb-4">
                <summary 
                  className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold flex items-center mb-2 text-sm"
                  onClick={() => !showHint && handleHint()}
                >
                  <span className="text-xl mr-2">💡</span>
                  {language === 'ar' ? 'التلميح (50% من المكافأة)' : 'Hint (50% of reward)'}
                </summary>
                {showHint && (
                  <div className="mt-3 p-4 bg-blue-900/30 rounded-lg border-l-4 border-blue-500 animate-slide-in">
                    <p className="text-blue-200 italic">{hintText}</p>
                  </div>
                )}
              </details>
            )}
          </div>
        </div>

        {/* Answer Card */}
        {!result && (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border border-gray-700">
            <label className="block text-white font-bold mb-3 text-lg">
              ✍️ {language === 'ar' ? 'إجابتك' : 'Your Answer'}
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
              className="w-full px-4 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white text-lg transition placeholder-gray-500"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 disabled:scale-100 text-lg shadow-lg"
            >
              {language === 'ar' ? '🚀 إرسال الإجابة' : '🚀 Submit Answer'}
            </button>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className={`bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border-4 ${result.correct ? 'border-green-500' : 'border-red-500'}`}>
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce-slow">{result.correct ? '✅' : '❌'}</div>
              <h2 className={`text-3xl font-bold mb-3 ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
                {result.correct ? (language === 'ar' ? 'صحيح!' : 'Correct!') : (language === 'ar' ? 'خطأ!' : 'Incorrect!')}
              </h2>
              <p className="text-gray-300 mb-4 text-lg">{result.message}</p>

              {result.correct && result.sbrEarned > 0 && (
                <div className="bg-green-900/30 rounded-xl p-4 mb-6 border border-green-500">
                  <p className="text-2xl font-bold text-green-400">
                    🎉 {language === 'ar' ? 'ربحت' : 'Earned'} {result.sbrEarned} SBR!
                  </p>
                </div>
              )}

              {/* Ad Button - Show between EVERY level */}
              {result.correct && (
                <button
                  onClick={handleWatchAd}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg shadow-lg mb-3"
                >
                  🎬 {language === 'ar' ? 'شاهد الإعلان للمستوى التالي' : 'Watch Ad for Next Level'}
                </button>
              )}

              {!result.correct && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswer('');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg"
                >
                  🔄 {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar - Like images */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2">
        <div className="max-w-4xl mx-auto grid grid-cols-5 gap-1">
          <Link href="/" className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-700 transition">
            <div className="text-2xl">🏠</div>
            <div className="text-xs text-gray-400">{language === 'ar' ? 'الرئيسية' : 'Home'}</div>
          </Link>
          <Link href="/play" className="flex flex-col items-center py-2 rounded-lg bg-blue-600 rounded-xl transition">
            <div className="text-2xl">🎮</div>
            <div className="text-xs text-white font-semibold">{language === 'ar' ? 'العب' : 'Play'}</div>
          </Link>
          <Link href="/levels" className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-700 transition">
            <div className="text-2xl">📋</div>
            <div className="text-xs text-gray-400">{language === 'ar' ? 'المستويات' : 'Levels'}</div>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-700 transition">
            <div className="text-2xl">📊</div>
            <div className="text-xs text-gray-400">{language === 'ar' ? 'الإحصائيات' : 'Stats'}</div>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center py-2 rounded-lg hover:bg-gray-700 transition">
            <div className="text-2xl">👤</div>
            <div className="text-xs text-gray-400">{language === 'ar' ? 'الملف' : 'Profile'}</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-white">Loading game...</p>
        </div>
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}

