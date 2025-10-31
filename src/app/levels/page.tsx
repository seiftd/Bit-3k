'use client';

import { useEffect, useState } from 'react';
import { gameEngine } from '@/lib/game-engine';
import { embeddedLevels, getEmbeddedLevel } from '@/data/levels';
import Link from 'next/link';

interface LevelWithStatus {
  level_number: number;
  title: string;
  level_type: string;
  difficulty: number;
  sbr_reward: number;
  completed: boolean;
  unlocked: boolean;
}

export default function LevelsPage() {
  const [levels, setLevels] = useState<LevelWithStatus[]>([]);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [stats, setStats] = useState(gameEngine.getStats());

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

    // Load all levels with status
    loadLevels();
  }, []);

  const loadLevels = () => {
    const levelStatuses: LevelWithStatus[] = embeddedLevels.map(level => ({
      level_number: level.level_number,
      title: level.title,
      level_type: level.level_type,
      difficulty: level.difficulty,
      sbr_reward: level.sbr_reward,
      completed: gameEngine.isLevelCompleted(level.level_number),
      unlocked: gameEngine.isLevelUnlocked(level.level_number),
    }));

    setLevels(levelStatuses);
    setStats(gameEngine.getStats());
  };

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      math: '🔢',
      riddle: '🧩',
      detective: '🕵️',
      cartoon: '🎨',
      jigsaw: '🧩',
    };
    return icons[type] || '❓';
  };

  const getDifficultyColor = (difficulty: number): string => {
    const colors: Record<number, string> = {
      1: 'border-green-500 bg-green-50',
      2: 'border-blue-500 bg-blue-50',
      3: 'border-orange-500 bg-orange-50',
      4: 'border-red-500 bg-red-50',
      5: 'border-purple-500 bg-purple-50',
    };
    return colors[difficulty] || 'border-gray-500 bg-gray-50';
  };

  const getDifficultyText = (difficulty: number): string => {
    const texts: Record<number, string> = {
      1: language === 'ar' ? 'سهل' : 'Easy',
      2: language === 'ar' ? 'متوسط' : 'Medium',
      3: language === 'ar' ? 'صعب' : 'Hard',
      4: language === 'ar' ? 'خبير' : 'Expert',
      5: language === 'ar' ? 'ماستر' : 'Master',
    };
    return texts[difficulty] || 'Unknown';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-800">
              {language === 'ar' ? '🎮 جميع المستويات' : '🎮 All Levels'}
            </h1>
            <Link href="/play" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">
              {language === 'ar' ? '▶️ العب' : '▶️ Play'}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl p-4 text-white text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold">{stats.sbrBalance.toFixed(1)}</div>
              <div className="text-sm opacity-90">{language === 'ar' ? 'SBR' : 'Balance'}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl p-4 text-white text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold">{stats.levelsCompleted}</div>
              <div className="text-sm opacity-90">{language === 'ar' ? 'مكتمل' : 'Completed'}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl p-4 text-white text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold">{stats.progressPercentage}%</div>
              <div className="text-sm opacity-90">{language === 'ar' ? 'التقدم' : 'Progress'}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-xl p-4 text-white text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold">{stats.averageAttempts}</div>
              <div className="text-sm opacity-90">{language === 'ar' ? 'متوسط محاولات' : 'Avg Attempts'}</div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <Link
              key={level.level_number}
              href={`/play`}
              onClick={(e) => {
                if (!level.unlocked) {
                  e.preventDefault();
                  alert(language === 'ar' ? 'المستوى غير مقفول بعد!' : 'Level not unlocked yet!');
                } else {
                  // Set current level in engine
                  gameEngine.getState().currentLevel = level.level_number;
                  localStorage.setItem('bit3k_game_state', JSON.stringify(gameEngine.getState()));
                }
              }}
            >
              <div
                className={`relative bg-white rounded-2xl shadow-lg p-6 transition transform hover:scale-105 cursor-pointer ${
                  level.completed ? 'border-4 border-green-500' : 
                  level.unlocked ? 'border-4 border-blue-500' : 
                  'border-4 border-gray-300 opacity-60'
                }`}
              >
                {/* Badge */}
                {level.completed && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    ✓
                  </div>
                )}

                {/* Level Number */}
                <div className={`text-6xl mb-2 ${level.unlocked ? '' : 'grayscale'}`}>
                  {getTypeIcon(level.level_type)}
                </div>

                {/* Level Info */}
                <div className="mb-3">
                  <div className="text-sm text-gray-500 mb-1">
                    {language === 'ar' ? 'المستوى' : 'Level'} {level.level_number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {level.title}
                  </h3>
                </div>

                {/* Difficulty & Reward */}
                <div className={`border-l-4 rounded p-3 ${getDifficultyColor(level.difficulty)}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">
                      {getDifficultyText(level.difficulty)}
                    </span>
                    <span className="font-bold text-gray-800">
                      💰 {level.sbr_reward} SBR
                    </span>
                  </div>
                </div>

                {/* Status */}
                {!level.unlocked && (
                  <div className="mt-3 text-center text-sm text-gray-500">
                    🔒 {language === 'ar' ? 'مقفل' : 'Locked'}
                  </div>
                )}
                {level.unlocked && !level.completed && (
                  <div className="mt-3 text-center text-sm text-blue-600 font-semibold">
                    ▶️ {language === 'ar' ? 'العب' : 'Play'}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {language === 'ar' ? '📊 إجمالي التقدم' : '📊 Overall Progress'}
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full transition-all duration-500 flex items-center justify-center text-white font-bold"
              style={{ width: `${stats.progressPercentage}%` }}
            >
              {stats.progressPercentage}%
            </div>
          </div>
          <p className="text-center text-gray-600 mt-2">
            {stats.levelsCompleted} / {stats.totalEmbeddedLevels} {language === 'ar' ? 'مستويات مكتملة' : 'levels completed'}
          </p>
        </div>
      </div>
    </div>
  );
}

