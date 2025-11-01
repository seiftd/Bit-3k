'use client';

import { useEffect, useState } from 'react';
import { gameEngine } from '@/lib/game-engine';
import { getLevel } from '@/lib/level-generator';
import Link from 'next/link';
import NavigationBar from '@/components/NavigationBar';
import LevelIcon from '@/components/LevelIcon';
import FloatingIcons from '@/components/FloatingIcons';
import { getLanguage, getLanguageDirection } from '@/lib/language';
import { initializeTelegramWebApp } from '@/lib/telegram';

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
  const [language, setLanguage] = useState<'en' | 'ar'>(getLanguage());
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
  const [currentPage, setCurrentPage] = useState(1);
  const levelsPerPage = 24;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    initializeTelegramWebApp();
    setLanguage(getLanguage());
    loadLevels();
  }, []);

  const loadLevels = () => {
    if (typeof window === 'undefined') return;
    
    const currentStats = gameEngine.getStats();
    setStats(currentStats);
    
    // Generate levels for current page
    const start = (currentPage - 1) * levelsPerPage + 1;
    const end = Math.min(start + levelsPerPage - 1, 3000);
    
    const levelStatuses: LevelWithStatus[] = [];
    for (let i = start; i <= end; i++) {
      const level = getLevel(i);
      if (level) {
        levelStatuses.push({
          level_number: level.level_number,
          title: level.title,
          level_type: level.level_type,
          difficulty: level.difficulty,
          sbr_reward: level.sbr_reward,
          completed: gameEngine.isLevelCompleted(level.level_number),
          unlocked: gameEngine.isLevelUnlocked(level.level_number),
        });
      }
    }

    setLevels(levelStatuses);
  };

  useEffect(() => {
    loadLevels();
  }, [currentPage]);

  const getDifficultyColor = (difficulty: number): string => {
    const colors: Record<number, string> = {
      1: 'border-green-500',
      2: 'border-blue-500',
      3: 'border-orange-500',
      4: 'border-red-500',
      5: 'border-purple-500',
    };
    return colors[difficulty] || 'border-gray-500';
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

  const totalPages = Math.ceil(3000 / levelsPerPage);

  return (
    <div className={`min-h-screen bg-gray-900 relative pb-20 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={getLanguageDirection(language)}>
      <FloatingIcons />
      
      {/* Stats Cards Bar - Like play page */}
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

      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">
              {language === 'ar' ? '🎮 جميع المستويات' : '🎮 All Levels'}
            </h1>
            <Link href="/play" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition">
              {language === 'ar' ? '▶️ العب' : '▶️ Play'}
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 font-semibold">{language === 'ar' ? 'التقدم' : 'Progress'}</span>
              <span className="text-gray-300 font-bold">{stats.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full transition-all duration-500"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
            <p className="text-center text-gray-400 mt-2 text-sm">
              {stats.levelsCompleted} / 3000 {language === 'ar' ? 'مستويات مكتملة' : 'levels completed'}
            </p>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {levels.map((level) => (
            <Link
              key={level.level_number}
              href={`/play`}
              onClick={(e) => {
                if (!level.unlocked) {
                  e.preventDefault();
                  alert(language === 'ar' ? 'المستوى غير مقفول بعد!' : 'Level not unlocked yet!');
                } else {
                  const state = gameEngine.getState();
                  state.currentLevel = level.level_number;
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('bit3k_game_state', JSON.stringify(state));
                  }
                }
              }}
            >
              <div
                className={`relative bg-gray-800 rounded-2xl shadow-xl p-6 transition transform hover:scale-105 cursor-pointer border-2 ${
                  level.completed ? 'border-green-500' : 
                  level.unlocked ? 'border-blue-500' : 
                  'border-gray-600 opacity-60'
                }`}
              >
                {/* Badge */}
                {level.completed && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                )}

                {/* Level Icon */}
                <div className="mb-3 flex justify-center">
                  <LevelIcon 
                    type={level.level_type as any} 
                    size="lg" 
                    animated={level.unlocked}
                  />
                </div>

                {/* Level Info */}
                <div className="mb-3 text-center">
                  <div className="text-sm text-gray-400 mb-1">
                    {language === 'ar' ? 'المستوى' : 'Level'} {level.level_number}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {level.title}
                  </h3>
                </div>

                {/* Difficulty & Reward */}
                <div className={`border-l-4 rounded-lg p-3 bg-gray-700 ${getDifficultyColor(level.difficulty)}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-sm">
                      {getDifficultyText(level.difficulty)}
                    </span>
                    <span className="font-bold text-yellow-400">
                      💰 {level.sbr_reward}
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
                  <div className="mt-3 text-center text-sm text-blue-400 font-semibold">
                    ▶️ {language === 'ar' ? 'العب' : 'Play'}
                  </div>
                )}
                {level.completed && (
                  <div className="mt-3 text-center text-sm text-green-400 font-semibold">
                    ✅ {language === 'ar' ? 'مكتمل' : 'Completed'}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mb-20">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            {language === 'ar' ? '← السابق' : '← Previous'}
          </button>
          <span className="text-gray-300">
            {language === 'ar' ? 'صفحة' : 'Page'} {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            {language === 'ar' ? 'التالي →' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <NavigationBar language={language} />
    </div>
  );
}
