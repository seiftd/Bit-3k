'use client';

import { useEffect, useState, Suspense } from 'react';
import { gameEngine, GameEngine } from '@/lib/game-engine';
import { GameLevel } from '@/data/levels';

function PlayContent() {
  const [level, setLevel] = useState<GameLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string; sbrEarned: number; needsAd?: boolean } | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [stats, setStats] = useState(gameEngine.getStats());
  const [engine] = useState<GameEngine>(gameEngine);

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
    const currentLevel = engine.getCurrentLevel();
    if (currentLevel) {
      setLevel(currentLevel);
      setLoading(false);
      setAnswer('');
      setResult(null);
      setShowHint(false);
      setStats(gameEngine.getStats());
    } else {
      // Game completed!
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!level || !answer.trim()) return;

    const result = engine.submitAnswer(answer.trim());
    setResult(result);
    setStats(gameEngine.getStats());

    // Haptic feedback if in Telegram
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(result.correct ? 'success' : 'error');
    }
  };

  const handleNext = () => {
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

  const handleHint = () => {
    const hintResult = engine.useHint();
    if (hintResult.success) {
      setShowHint(true);
      setStats(gameEngine.getStats());
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('soft');
      }
    } else {
      alert(language === 'ar' ? 'لا يوجد رصيد كافٍ لاستخدام التلميح' : 'Not enough balance to use hint');
    }
  };

  const handleWatchAd = () => {
    // Simulate ad watching
    engine.watchAd();
    
    // Continue to next level after ad
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-xl text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Game completed!
  if (!level) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {language === 'ar' ? 'تهانينا!' : 'Congratulations!'}
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            {language === 'ar' ? 'لقد أكملت جميع المستويات!' : 'You completed all levels!'}
          </p>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-purple-600">💰</div>
                <div className="text-sm text-gray-600 mt-1">{language === 'ar' ? 'إجمالي SBR' : 'Total SBR'}</div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalEarned.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">✅</div>
                <div className="text-sm text-gray-600 mt-1">{language === 'ar' ? 'مستويات' : 'Levels'}</div>
                <div className="text-2xl font-bold text-gray-800">{stats.levelsCompleted}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              engine.resetGame();
              loadLevel();
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition transform hover:scale-105 text-lg shadow-lg"
          >
            {language === 'ar' ? '🔄 ابدأ من جديد' : '🔄 Play Again'}
          </button>
        </div>
      </div>
    );
  }

  const questionText = language === 'ar' && level.question_ar ? level.question_ar : level.question;
  const hintText = language === 'ar' && level.hint_ar ? level.hint_ar : level.hint;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto">
        {/* Stats Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 shadow-lg">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <div className="text-xl">💰</div>
              <div className="text-lg font-bold">{stats.sbrBalance.toFixed(1)} SBR</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xl">🎯</div>
              <div className="text-lg font-bold">
                {language === 'ar' ? 'المستوى' : 'Level'} {stats.currentLevel}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xl">✅</div>
              <div className="text-lg font-bold">{stats.levelsCompleted}</div>
            </div>
          </div>
        </div>

        {/* Level Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4">
          {/* Level Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">{language === 'ar' ? 'المستوى' : 'Level'} {level.level_number}</div>
                <h1 className="text-3xl font-bold">{level.title}</h1>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold bg-white/20 px-4 py-2 rounded-lg">
                  💰 {level.sbr_reward} SBR
                </div>
                <div className="text-sm mt-2 opacity-90">
                  {engine.getDifficultyBadge(level.difficulty)}
                </div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <span className="text-2xl mr-2">❓</span>
              {language === 'ar' ? 'السؤال' : 'Question'}
            </h2>
            <p className="text-lg text-gray-700 mb-6 whitespace-pre-wrap leading-relaxed">
              {questionText}
            </p>

            {/* Hint Section */}
            {hintText && (
              <details className="mb-6">
                <summary 
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold flex items-center mb-2"
                  onClick={() => !showHint && handleHint()}
                >
                  <span className="text-xl mr-2">💡</span>
                  {language === 'ar' ? 'عرض التلميح (يكلف 50% من المكافأة)' : 'Show Hint (Costs 50% of reward)'}
                </summary>
                {showHint && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 italic">{hintText}</p>
                  </div>
                )}
              </details>
            )}
          </div>
        </div>

        {/* Answer Input */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <label className="block text-gray-700 font-bold mb-3 text-lg">
              {language === 'ar' ? '✍️ إجابتك' : '✍️ Your Answer'}
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg transition"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 disabled:scale-100 text-lg shadow-lg"
            >
              {language === 'ar' ? '🚀 إرسال الإجابة' : '🚀 Submit Answer'}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`bg-white rounded-2xl shadow-2xl p-6 border-4 ${result.correct ? 'border-green-500' : 'border-red-500'}`}>
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">{result.correct ? '✅' : '❌'}</div>
              <h2 className={`text-3xl font-bold mb-3 ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
                {result.correct ? (language === 'ar' ? 'صحيح!' : 'Correct!') : (language === 'ar' ? 'خطأ!' : 'Incorrect!')}
              </h2>
              <p className="text-gray-600 mb-4 text-lg">{result.message}</p>

              {result.correct && result.sbrEarned > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border-2 border-green-300">
                  <p className="text-2xl font-bold text-green-700">
                    🎉 {language === 'ar' ? 'ربحت' : 'Earned'} {result.sbrEarned} SBR!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {result.correct && (
                <div className="space-y-3">
                  {result.needsAd ? (
                    <button
                      onClick={handleWatchAd}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg shadow-lg"
                    >
                      🎬 {language === 'ar' ? 'شاهد إعلان للمستوى التالي' : 'Watch Ad for Next Level'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg shadow-lg"
                    >
                      ➡️ {language === 'ar' ? 'المستوى التالي' : 'Next Level'}
                    </button>
                  )}
                </div>
              )}

              {!result.correct && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswer('');
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 text-lg shadow-lg"
                >
                  🔄 {language === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}

