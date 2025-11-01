'use client';

import { useEffect, useState } from 'react';
import { gameEngine } from '@/lib/game-engine';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    currentLevel: 1,
    sbrBalance: 0,
    totalEarned: 0,
    levelsCompleted: 0,
    totalAdsWatched: 0,
    attempts: {},
    completedLevels: [],
    lastPlayedAt: new Date(),
    totalEmbeddedLevels: 50,
    progressPercentage: 0,
    averageAttempts: 0,
  });
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [referrals, setReferrals] = useState({ total: 0, level1: 0, level2: 0 });
  const [referralCode, setReferralCode] = useState('BIT3K123');
  const [dailyMissions, setDailyMissions] = useState({
    login: { completed: false, reward: 5 },
    play: { completed: false, reward: 3 },
    ad: { completed: false, reward: 2 },
    referral: { completed: false, reward: 10 },
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Initialize Telegram WebApp if available
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setLanguage((user.language_code || 'en').startsWith('ar') ? 'ar' : 'en');
        setReferralCode('BIT3K' + user.id);
      }
    }

    // Load stats
    loadStats();
  }, []);

  const loadStats = () => {
    if (typeof window === 'undefined') return;
    
    const currentStats = gameEngine.getStats();
    setStats(currentStats);
    
    // Simulate referrals data (in real app, fetch from API)
    setReferrals({
      total: 12,
      level1: 8,
      level2: 4,
    });
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        dashboard: 'User Dashboard',
        profile: 'Profile',
        stats: 'Statistics',
        play: 'Play Game',
        balance: 'SBR Balance',
        totalEarned: 'Total Earned',
        currentLevel: 'Current Level',
        levelsCompleted: 'Levels Completed',
        progress: 'Progress',
        averageAttempts: 'Avg Attempts',
        referrals: 'Referrals',
        referralCode: 'Referral Code',
        totalReferrals: 'Total Referrals',
        level1Referrals: 'Level 1 Referrals',
        level2Referrals: 'Level 2 Referrals',
        dailyMissions: 'Daily Missions',
        missionLogin: 'Daily Login',
        missionPlay: 'Play 3 Levels',
        missionAd: 'Watch Ad',
        missionReferral: 'Invite Friend',
        completed: 'Completed',
        claim: 'Claim',
        copyCode: 'Copy Code',
        copied: 'Copied!',
        leaderboard: 'Leaderboard',
        rank: 'Rank',
        player: 'Player',
        score: 'Score',
        yourRank: 'Your Rank',
        viewAll: 'View All',
      },
      ar: {
        dashboard: 'لوحة التحكم',
        profile: 'الملف الشخصي',
        stats: 'الإحصائيات',
        play: 'العب',
        balance: 'رصيد SBR',
        totalEarned: 'إجمالي المكتسب',
        currentLevel: 'المستوى الحالي',
        levelsCompleted: 'المستويات المكتملة',
        progress: 'التقدم',
        averageAttempts: 'متوسط المحاولات',
        referrals: 'الإحالات',
        referralCode: 'كود الإحالة',
        totalReferrals: 'إجمالي الإحالات',
        level1Referrals: 'إحالات المستوى 1',
        level2Referrals: 'إحالات المستوى 2',
        dailyMissions: 'المهام اليومية',
        missionLogin: 'تسجيل دخول يومي',
        missionPlay: 'العب 3 مستويات',
        missionAd: 'شاهد إعلان',
        missionReferral: 'دعوة صديق',
        completed: 'مكتمل',
        claim: 'استلم',
        copyCode: 'نسخ الكود',
        copied: 'تم النسخ!',
        leaderboard: 'لوحة المتصدرين',
        rank: 'الترتيب',
        player: 'اللاعب',
        score: 'النقاط',
        yourRank: 'ترتيبك',
        viewAll: 'عرض الكل',
      },
    };
    return translations[language][key] || key;
  };

  const copyReferralCode = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(referralCode);
    alert(t('copied'));
  };

  const claimMission = (missionKey: string) => {
    const mission = dailyMissions[missionKey as keyof typeof dailyMissions];
    if (!mission.completed) {
      alert(t('missionLogin') + ' ' + t('completed'));
      return;
    }
    
    // Award SBR
    if (typeof window !== 'undefined') {
      const newStats = gameEngine.getStats();
      newStats.sbrBalance += mission.reward;
      newStats.totalEarned += mission.reward;
      
      // Mark as claimed
      setDailyMissions(prev => ({
        ...prev,
        [missionKey]: { ...prev[missionKey as keyof typeof prev], completed: false },
      }));
      
      alert(`${t('claim')} +${mission.reward} SBR!`);
      loadStats();
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">
              {t('dashboard')}
            </h1>
            <Link href="/play" className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-6 rounded-xl transition">
              {t('play')}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-4">
            {/* Balance Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('stats')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl p-4 text-white">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-sm opacity-90 mb-1">{t('balance')}</div>
                  <div className="text-3xl font-bold">{stats.sbrBalance.toFixed(1)} SBR</div>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl p-4 text-white">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-sm opacity-90 mb-1">{t('totalEarned')}</div>
                  <div className="text-3xl font-bold">{stats.totalEarned.toFixed(1)} SBR</div>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl p-4 text-white">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm opacity-90 mb-1">{t('currentLevel')}</div>
                  <div className="text-3xl font-bold">{stats.currentLevel}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-xl p-4 text-white">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm opacity-90 mb-1">{t('levelsCompleted')}</div>
                  <div className="text-3xl font-bold">{stats.levelsCompleted}</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-semibold">{t('progress')}</span>
                  <span className="text-gray-700 font-bold">{stats.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full transition-all duration-500"
                    style={{ width: `${stats.progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {stats.levelsCompleted} / {stats.totalEmbeddedLevels} {language === 'ar' ? 'مستويات' : 'levels'}
                </p>
              </div>
            </div>

            {/* Daily Missions */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">🎯 {t('dailyMissions')}</h2>
              <div className="space-y-3">
                {Object.entries(dailyMissions).map(([key, mission]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mission.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {mission.completed ? '✓' : ''}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{t(`mission${key.charAt(0).toUpperCase() + key.slice(1)}`)}</div>
                        <div className="text-sm text-gray-500">+{mission.reward} SBR</div>
                      </div>
                    </div>
                    <button
                      onClick={() => claimMission(key)}
                      disabled={!mission.completed}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        mission.completed
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {mission.completed ? t('claim') : t('completed')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">🏆 {t('leaderboard')}</h2>
              <div className="space-y-2">
                {gameEngine.getLeaderboard().slice(0, 5).map((entry, index) => (
                  <div key={entry.rank} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{entry.name}</div>
                        <div className="text-sm text-gray-500">{entry.score} SBR</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Referrals */}
          <div className="space-y-4">
            {/* Referral Code Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">🤝 {t('referrals')}</h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">{t('referralCode')}</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg font-mono font-bold text-blue-600"
                  />
                  <button
                    onClick={copyReferralCode}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">{t('totalReferrals')}</div>
                  <div className="text-2xl font-bold text-green-600">{referrals.total}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">{t('level1Referrals')}</div>
                  <div className="text-2xl font-bold text-blue-600">{referrals.level1}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">{t('level2Referrals')}</div>
                  <div className="text-2xl font-bold text-purple-600">{referrals.level2}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">⚡ {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
              <div className="space-y-3">
                <Link href="/play" className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition text-center">
                  🎮 {t('play')}
                </Link>
                <Link href="/levels" className="block w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl transition text-center">
                  📋 {language === 'ar' ? 'المستويات' : 'Levels'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

