'use client';

import { useEffect, useState } from 'react';
import { gameEngine } from '@/lib/game-engine';
import Link from 'next/link';
import NavigationBar from '@/components/NavigationBar';
import FloatingIcons from '@/components/FloatingIcons';
import { getTelegramUser, getReferralCode, getReferralLink, isInTelegram } from '@/lib/telegram';
import { getLanguage, setLanguage, getLanguageDirection } from '@/lib/language';
import { initializeTelegramWebApp } from '@/lib/telegram';

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    currentLevel: number;
    sbrBalance: number;
    totalEarned: number;
    levelsCompleted: number;
    totalAdsWatched: number;
    attempts: Record<number, number>;
    completedLevels: number[];
    lastPlayedAt: Date;
    totalEmbeddedLevels: number;
    progressPercentage: number;
    averageAttempts: number;
  }>({
    currentLevel: 1,
    sbrBalance: 0,
    totalEarned: 0,
    levelsCompleted: 0,
    totalAdsWatched: 0,
    attempts: {},
    completedLevels: [],
    lastPlayedAt: new Date(),
    totalEmbeddedLevels: 3200,
    progressPercentage: 0,
    averageAttempts: 0,
  });
  
  const [language, setLanguageState] = useState<'en' | 'ar'>(getLanguage());
  const [telegramUser, setTelegramUser] = useState<ReturnType<typeof getTelegramUser>>(null);
  const [referrals, setReferrals] = useState({ total: 0, level1: 0, level2: 0 });
  const [referralCode, setReferralCode] = useState('BIT3K123');
  const [referralLink, setReferralLink] = useState('');
  // Shop states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobilisPhone, setMobilisPhone] = useState('');
  const [binanceId, setBinanceId] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Daily Missions
  const [dailyMissions, setDailyMissions] = useState({
    login: { completed: false, reward: 5 },
    subscribe: { completed: false, reward: 10 },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    initializeTelegramWebApp();
    
    // Get Telegram user data
    const user = getTelegramUser();
    if (user) {
      setTelegramUser(user);
      setReferralCode(getReferralCode());
      setReferralLink(getReferralLink());
      
      // Set language from Telegram or localStorage
      const savedLang = getLanguage();
      setLanguageState(savedLang);
    }

    // Load stats
    loadStats();
  }, []);

  const loadStats = () => {
    if (typeof window === 'undefined') return;
    
    const currentStats = gameEngine.getStats();
    setStats(currentStats);
    
    // TODO: Fetch real referrals from API when backend is ready
    // For now, use game engine data
    setReferrals({
      total: 0, // Will be fetched from API
      level1: 0,
      level2: 0,
    });
  };

  const handleLanguageChange = (newLang: 'en' | 'ar') => {
    setLanguage(newLang);
    setLanguageState(newLang);
    // Reload page to apply language changes
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
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
        missionSubscribe: 'Subscribe to Telegram Channel',
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
        changeLanguage: 'Change Language',
        english: 'English',
        arabic: 'Arabic',
        userName: 'Username',
        telegramId: 'Telegram ID',
        memberSince: 'Member Since',
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
        missionSubscribe: 'الاشتراك في قناة التليجرام',
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
        changeLanguage: 'تغيير اللغة',
        english: 'الإنجليزية',
        arabic: 'العربية',
        userName: 'اسم المستخدم',
        telegramId: 'معرف التليجرام',
        memberSince: 'عضو منذ',
      },
    };
    return translations[language][key] || key;
  };

  const copyReferralLink = () => {
    if (typeof window === 'undefined') return;
    const linkToCopy = referralLink || getReferralLink();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(linkToCopy);
      alert(t('copied'));
    }
  };

  const shareReferralLink = () => {
    if (typeof window === 'undefined') return;
    const linkToShare = referralLink || getReferralLink();
    const message = language === 'ar' 
      ? `انضم إلى Bit 3K - لعبة الألغاز! 🎮\n${linkToShare}`
      : `Join Bit 3K - Puzzle Game! 🎮\n${linkToShare}`;
    
    // Try Web Share API first
    if (navigator.share) {
      navigator.share({
        title: 'Bit 3K',
        text: message,
        url: linkToShare,
      }).catch(() => {
        // Fallback to copy
        copyReferralLink();
      });
    } else {
      // Fallback: try Telegram WebApp share or copy
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.openLink) {
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(linkToShare)}&text=${encodeURIComponent(message)}`;
        tg.openLink(telegramShareUrl);
      } else {
        copyReferralLink();
      }
    }
  };

  const claimMission = (missionKey: string) => {
    const mission = dailyMissions[missionKey as keyof typeof dailyMissions];
    if (!mission.completed) {
      alert(language === 'ar' ? 'المهمة غير مكتملة' : 'Mission not completed');
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
      
      alert(language === 'ar' ? `تم الحصول على ${mission.reward} نقطة!` : `Earned ${mission.reward} SBR!`);
      loadStats();
    }
  };

  // Shop functions
  const handleOoredooRecharge = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      alert(language === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }

    if (stats.sbrBalance < 500) {
      alert(language === 'ar' ? 'رصيدك غير كافٍ! تحتاج 500 نقطة' : 'Insufficient balance! You need 500 points');
      return;
    }

    setProcessing(true);
    try {
      // TODO: Send to API
      // For now, simulate the transaction
      if (typeof window !== 'undefined') {
        const newStats = gameEngine.getStats();
        newStats.sbrBalance -= 500;
        newStats.totalEarned -= 500;
        
        // TODO: Call API to process Ooredoo recharge
        // await fetch(`${apiUrl}/shop/ooredoo`, { ... });
        
        alert(language === 'ar' 
          ? `تم طلب شحن أوريدو بنجاح! سيتم شحن 10,000 دينار لرقم ${phoneNumber}` 
          : `Ooredoo recharge requested! 10,000 IQD will be charged to ${phoneNumber}`);
        
        setPhoneNumber('');
        loadStats();
      }
    } catch (error) {
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleMobilisRecharge = async () => {
    if (!mobilisPhone || mobilisPhone.length < 8) {
      alert(language === 'ar' ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }

    if (stats.sbrBalance < 500) {
      alert(language === 'ar' ? 'رصيدك غير كافٍ! تحتاج 500 نقطة' : 'Insufficient balance! You need 500 points');
      return;
    }

    setProcessing(true);
    try {
      // TODO: Send to API
      // For now, simulate the transaction
      if (typeof window !== 'undefined') {
        const newStats = gameEngine.getStats();
        newStats.sbrBalance -= 500;
        newStats.totalEarned -= 500;
        
        // TODO: Call API to process Mobilis recharge
        // await fetch(`${apiUrl}/shop/mobilis`, { ... });
        
        alert(language === 'ar' 
          ? `تم طلب شحن موبايليس بنجاح! سيتم شحن 10,000 دينار لرقم ${mobilisPhone}` 
          : `Mobilis recharge requested! 10,000 IQD will be charged to ${mobilisPhone}`);
        
        setMobilisPhone('');
        loadStats();
      }
    } catch (error) {
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleUSDTExchange = async () => {
    if (!binanceId || binanceId.length < 5) {
      alert(language === 'ar' ? 'يرجى إدخال Binance ID صحيح' : 'Please enter a valid Binance ID');
      return;
    }

    if (stats.sbrBalance < 1000) {
      alert(language === 'ar' ? 'رصيدك غير كافٍ! تحتاج 1000 نقطة' : 'Insufficient balance! You need 1000 points');
      return;
    }

    setProcessing(true);
    try {
      // TODO: Send to API
      // For now, simulate the transaction
      if (typeof window !== 'undefined') {
        const newStats = gameEngine.getStats();
        newStats.sbrBalance -= 1000;
        newStats.totalEarned -= 1000;
        
        // TODO: Call API to process USDT exchange
        // await fetch(`${apiUrl}/shop/usdt`, { ... });
        
        alert(language === 'ar' 
          ? `تم طلب تحويل USDT بنجاح! سيتم تحويل 2$ إلى Binance ID: ${binanceId}` 
          : `USDT exchange requested! 2$ will be transferred to Binance ID: ${binanceId}`);
        
        setBinanceId('');
        loadStats();
      }
    } catch (error) {
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    // Check daily missions
    if (typeof window !== 'undefined') {
      // Check login mission (always true if user is here)
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem('lastLogin');
      if (lastLogin !== today) {
        setDailyMissions(prev => ({
          ...prev,
          login: { completed: true, reward: 5 },
        }));
        localStorage.setItem('lastLogin', today);
      }

      // Check subscribe mission (check if user is subscribed to channel)
      // TODO: Check Telegram channel subscription via API
      // For now, allow manual completion
    }
  }, []);


  const userName = telegramUser?.username 
    ? `@${telegramUser.username}` 
    : telegramUser?.first_name || 'Guest';
  const fullName = telegramUser 
    ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim()
    : 'Guest User';
  const telegramId = telegramUser?.id?.toString() || 'N/A';

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
                <div className="text-xs text-gray-400">{t('balance')}</div>
                <div className="text-lg font-bold text-white">{stats.sbrBalance.toFixed(1)} SBR</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-xl p-3 border-l-4 border-yellow-500">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="text-xs text-gray-400">{t('currentLevel')}</div>
                <div className="text-lg font-bold text-white">{stats.currentLevel}/3200</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 rounded-xl p-3 border-l-4 border-green-500">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">✅</div>
              <div>
                <div className="text-xs text-gray-400">{t('levelsCompleted')}</div>
                <div className="text-lg font-bold text-white">{stats.levelsCompleted}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-4">
            {/* User Profile Card */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{t('profile')}</h2>
                {/* Language Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{t('changeLanguage')}:</span>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                      language === 'en' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🇺🇸 {t('english')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ar')}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                      language === 'ar' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🇸🇦 {t('arabic')}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{fullName}</div>
                  <div className="text-gray-400">{userName}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t('telegramId')}: {telegramId}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Missions */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-white">🎯 {t('dailyMissions')}</h2>
              <div className="space-y-3">
                {Object.entries(dailyMissions).map(([key, mission]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mission.completed ? 'bg-green-500' : 'bg-gray-600'}`}>
                        {mission.completed ? '✓' : ''}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{t(`mission${key.charAt(0).toUpperCase() + key.slice(1)}`)}</div>
                        <div className="text-sm text-gray-400">+{mission.reward} SBR</div>
                      </div>
                    </div>
                    <button
                      onClick={() => claimMission(key)}
                      disabled={!mission.completed}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        mission.completed
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {mission.completed ? (language === 'ar' ? 'مطالبة' : 'Claim') : (language === 'ar' ? 'غير مكتمل' : 'Incomplete')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-white">🏆 {t('leaderboard')}</h2>
              <div className="space-y-2">
                {(() => {
                  const leaderboard = gameEngine.getLeaderboard();
                  if (leaderboard.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-400">
                        {language === 'ar' ? 'لا توجد نتائج بعد' : 'No rankings yet'}
                      </div>
                    );
                  }
                  return leaderboard.slice(0, 5).map((entry, index) => {
                    const isCurrentUser = telegramUser?.id?.toString() === entry.name.split('@')[1] || 
                                          (telegramUser?.username && entry.name.includes(telegramUser.username)) ||
                                          (telegramUser?.first_name && entry.name.includes(telegramUser.first_name));
                    return (
                      <div 
                        key={entry.rank} 
                        className={`flex items-center justify-between bg-gray-700 rounded-xl p-3 ${
                          isCurrentUser ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {entry.name}
                              {isCurrentUser && <span className="text-xs text-blue-400">({language === 'ar' ? 'أنت' : 'You'})</span>}
                            </div>
                            <div className="text-sm text-gray-400">{entry.score.toLocaleString()} SBR</div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Right Column - Referrals */}
          <div className="space-y-4">
            {/* Referral Code Card */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-white">🤝 {t('referrals')}</h2>
              <div className="bg-gray-700 rounded-xl p-4 mb-4">
                <div className="text-sm text-gray-400 mb-2">{t('referralCode')}</div>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg font-mono font-bold text-blue-400 text-sm"
                  />
                </div>
                <div className="text-sm text-gray-400 mb-2">🔗 {language === 'ar' ? 'رابط الدعوة' : 'Referral Link'}</div>
                <div className="mb-3">
                  <input
                    type="text"
                    value={referralLink || getReferralLink()}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg font-mono text-sm text-blue-400 break-all mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={copyReferralLink}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                      title={language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
                    >
                      📋 {language === 'ar' ? 'نسخ' : 'Copy'}
                    </button>
                    <button
                      onClick={shareReferralLink}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                      title={language === 'ar' ? 'مشاركة الرابط' : 'Share Link'}
                    >
                      🔗 {language === 'ar' ? 'مشاركة' : 'Share'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 text-center">
                  {language === 'ar' ? 'شارك هذا الرابط مع أصدقائك!' : 'Share this link with your friends!'}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-700 rounded-xl p-4 border-l-4 border-green-500">
                  <div className="text-sm text-gray-400 mb-1">{t('totalReferrals')}</div>
                  <div className="text-2xl font-bold text-green-400">{referrals.total}</div>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 border-l-4 border-blue-500">
                  <div className="text-sm text-gray-400 mb-1">{t('level1Referrals')}</div>
                  <div className="text-2xl font-bold text-blue-400">{referrals.level1}</div>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 border-l-4 border-purple-500">
                  <div className="text-sm text-gray-400 mb-1">{t('level2Referrals')}</div>
                  <div className="text-2xl font-bold text-purple-400">{referrals.level2}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-white">⚡ {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
              <div className="space-y-3">
                <Link href="/play" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition text-center">
                  🎮 {t('play')}
                </Link>
                <Link href="/levels" className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition text-center">
                  📋 {language === 'ar' ? 'المستويات' : 'Levels'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <NavigationBar language={language} />
    </div>
  );
}
