'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { gameEngine, GameEngine } from '@/lib/game-engine';
import { GameLevel } from '@/data/levels';
import Link from 'next/link';
import AnimatedCharacter from '@/components/AnimatedCharacter';
import PuzzlePieces from '@/components/PuzzlePieces';
import FloatingIcons from '@/components/FloatingIcons';
import ConfettiAnimation from '@/components/ConfettiAnimation';
import LevelIcon from '@/components/LevelIcon';
import NavigationBar from '@/components/NavigationBar';
import { getLanguage, getLanguageDirection } from '@/lib/language';
import { initializeTelegramWebApp } from '@/lib/telegram';

function PlayContent() {
  const searchParams = useSearchParams();
  const [level, setLevel] = useState<GameLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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
    totalEmbeddedLevels: 3200,
    progressPercentage: 0,
    averageAttempts: 0,
  });
  const [engine] = useState<GameEngine>(gameEngine);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp if available
    if (typeof window !== 'undefined') {
      initializeTelegramWebApp();
      const currentLang = getLanguage();
      setLanguage(currentLang);
    }

    // Check if ad was completed (coming back from ad page)
    const adCompleted = searchParams?.get('adCompleted');
    if (adCompleted === 'true') {
      // Grant reward and advance after ad
      const advanced = engine.completeAdAndAdvance();
      const levelWithOptions = advanced || engine.getCurrentLevel();
      if (levelWithOptions) {
        setLevel(levelWithOptions);
        setSelectedAnswer(null);
        setResult(null);
        setShowHint(false);
        setStats(engine.getStats());
        setLoading(false);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }
    }

    // Normal load
    loadLevel();
  }, [searchParams]);

  const loadLevel = () => {
    if (typeof window === 'undefined') return;
    
    const currentLevel = engine.getCurrentLevel();
    if (currentLevel) {
      setLevel(currentLevel);
      setLoading(false);
      setSelectedAnswer(null);
      setResult(null);
      setShowHint(false);
      setStats(engine.getStats());
    } else {
      // Game completed!
      setLoading(false);
    }
  };

  const handleSubmit = (selectedOption?: string) => {
    const answerToSubmit = selectedOption || selectedAnswer;
    if (!level || !answerToSubmit) return;

    const result = engine.submitAnswer(answerToSubmit);
    setResult(result);
    setStats(engine.getStats());

    // Show ad modal between EVERY level
    if (result.correct) {
      setShowConfetti(true);
      setShowAdModal(true);
      setTimeout(() => setShowConfetti(false), 3000);
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
    setSelectedAnswer(null);
    
    // Move to next level
    const nextLevel = engine.nextLevel();
    
    if (nextLevel) {
      // Ensure options are present - reload level to generate options if needed
      const levelWithOptions = nextLevel.options && nextLevel.options.length > 0 
        ? nextLevel 
        : engine.getCurrentLevel(); // Force regenerate if no options
      
      if (levelWithOptions) {
        setLevel(levelWithOptions);
        setSelectedAnswer(null);
        setStats(engine.getStats());
      }
    } else {
      // Game completed!
      setLevel(null);
    }
  };

  const handleWatchAd = () => {
    // Navigate to ad page within the app (not opening external window)
    if (typeof window !== 'undefined') {
      const adUrl = `/ad?redirect=${encodeURIComponent(window.location.pathname)}&token=${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Use router navigation instead of openLink to stay within Mini App
      window.location.href = adUrl;
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
          <AnimatedCharacter type="brain" size="lg" />
          <p className="text-xl text-white mt-4">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Game completed!
  if (!level) {
    return (
      <div className={`min-h-screen bg-gray-900 flex items-center justify-center p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-700">
          <AnimatedCharacter type="star" size="lg" />
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
  const options = (language === 'ar' && level.options_ar) ? level.options_ar : (level.options || []);

  return (
    <div className={`min-h-screen bg-gray-900 relative pb-20 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={getLanguageDirection(language)}>
      {/* Floating Background Icons */}
      <FloatingIcons />
      
      {/* Confetti Animation */}
      <ConfettiAnimation show={showConfetti} />
      
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
                <div className="text-lg font-bold text-white">{stats.currentLevel}/3200</div>
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
                  <LevelIcon type={level.level_type} size="lg" animated />
                  <span className="ml-2">{level.title}</span>
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
              <AnimatedCharacter type="brain" size="sm" className="mr-2" />
              {language === 'ar' ? 'السؤال' : 'Question'}
            </h2>
            <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-gray-700 relative">
              <PuzzlePieces completed={false} />
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap relative z-10">
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

        {/* Answer Options Card */}
        {!result && (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border border-gray-700">
            <label className="block text-white font-bold mb-4 text-lg">
              ✍️ {language === 'ar' ? 'اختر الإجابة الصحيحة' : 'Choose the correct answer'}
            </label>
            
            {options.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.map((option, index) => {
                  const optionLetters = ['A', 'B', 'C', 'D'];
                  const isSelected = selectedAnswer === option;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedAnswer(option);
                        // Auto submit after selection
                        setTimeout(() => handleSubmit(option), 300);
                      }}
                      className={`relative p-4 rounded-xl border-2 transition transform hover:scale-105 text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-gray-600 bg-gray-700 hover:border-blue-400 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {optionLetters[index]}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-lg">{option}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Fallback to text input if no options available
              <div>
                <input
                  type="text"
                  value={selectedAnswer || ''}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && selectedAnswer && handleSubmit()}
                  placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
                  className="w-full px-4 py-4 bg-gray-900 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none text-white text-lg transition placeholder-gray-500"
                  autoFocus
                />
                <button
                  onClick={() => selectedAnswer && handleSubmit()}
                  disabled={!selectedAnswer?.trim()}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 disabled:scale-100 text-lg shadow-lg"
                >
                  {language === 'ar' ? '🚀 إرسال الإجابة' : '🚀 Submit Answer'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className={`bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border-4 ${result.correct ? 'border-green-500' : 'border-red-500'}`}>
            <div className="text-center">
              {result.correct ? (
                <div className="mb-4">
                  <AnimatedCharacter type="star" size="lg" />
                  {showConfetti && <PuzzlePieces completed={true} />}
                </div>
              ) : (
                <div className="text-8xl mb-4 animate-bounce-slow">❌</div>
              )}
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
                    setSelectedAnswer(null);
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

      {/* Navigation Bar */}
      <NavigationBar language={language} />
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}

