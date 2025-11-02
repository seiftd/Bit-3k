'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTelegramUser, isInTelegram, initializeTelegramWebApp } from '@/lib/telegram';
import { getLanguage, getLanguageDirection } from '@/lib/language';
import FloatingIcons from '@/components/FloatingIcons';
import NavigationBar from '@/components/NavigationBar';

export default function Home() {
  const [isInTelegramApp, setIsInTelegramApp] = useState(false);
  const [telegramUser, setTelegramUser] = useState<ReturnType<typeof getTelegramUser>>(null);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setMounted(true);
      
      if (typeof window !== 'undefined') {
        try {
          initializeTelegramWebApp();
        } catch (err) {
          console.error('Error initializing Telegram WebApp:', err);
        }
        
        try {
          const inTelegram = isInTelegram();
          setIsInTelegramApp(inTelegram);
          
          if (inTelegram) {
            const user = getTelegramUser();
            setTelegramUser(user);
          }
        } catch (err) {
          console.error('Error checking Telegram:', err);
          setIsInTelegramApp(false);
        }
        
        // Set language
        try {
          const savedLang = getLanguage();
          setLanguage(savedLang);
        } catch (err) {
          console.error('Error loading language:', err);
          setLanguage('en');
        }
      }
    } catch (err) {
      console.error('Error in Home useEffect:', err);
      setMounted(true);
      setLanguage('en');
    }
  }, []);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        welcome: 'Welcome to Bit 3K!',
        welcomeBack: 'Welcome back',
        subtitle: 'Solve 3,000 puzzles, earn SBR coins, and climb the leaderboard!',
        startPlaying: 'Start Playing',
        browseLevels: 'Browse Levels',
        dashboard: 'Dashboard',
        features: 'Features',
        levels: '3,000 Challenging Levels',
        rewards: 'Earn SBR Rewards',
        referrals: 'Referral Bonuses',
        staking: 'Stake & Earn More',
        notInTelegram: 'Please open this game from Telegram bot',
        telegramDesc: 'Open this game from Telegram bot to play',
      },
      ar: {
        welcome: 'مرحباً بك في Bit 3K!',
        welcomeBack: 'مرحباً بعودتك',
        subtitle: 'احل 3,000 لغز، اربح عملات SBR، وتسلق لوحة المتصدرين!',
        startPlaying: 'ابدأ اللعب',
        browseLevels: 'تصفح المستويات',
        dashboard: 'لوحة التحكم',
        features: 'المميزات',
        levels: '3,000 مستوى تحدي',
        rewards: 'اربح مكافآت SBR',
        referrals: 'مكافآت الإحالة',
        staking: 'استثمر واربح أكثر',
        notInTelegram: 'الرجاء فتح اللعبة من بوت التليجرام',
        telegramDesc: 'افتح هذه اللعبة من بوت التليجرام للعب',
      },
    };
    
    return translations[language]?.[key] || key;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If not in Telegram, show welcome message with instructions
  if (!isInTelegramApp) {
    const dir = typeof window !== 'undefined' ? getLanguageDirection(language) : 'ltr';
    return (
      <div className={`min-h-screen bg-gray-900 relative ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={dir}>
        {mounted && <FloatingIcons />}
        
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎮</div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('welcome')}</h1>
              <p className="text-gray-400">{t('notInTelegram')}</p>
            </div>
            
            <div className="space-y-4">
              <a
                href="https://t.me/Bitme3kbot"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 text-center text-lg shadow-lg"
              >
                📱 {t('startPlaying')}
              </a>
              
              <div className="text-center text-gray-400 text-sm">
                {t('telegramDesc')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome page for Telegram users
  const userName = telegramUser?.first_name || telegramUser?.username || 'Player';
  const dir = typeof window !== 'undefined' ? getLanguageDirection(language) : 'ltr';

  return (
    <div className={`min-h-screen bg-gray-900 relative pb-20 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={dir}>
      {mounted && <FloatingIcons />}
      
      {/* Stats Bar */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t('welcomeBack')}, {userName}! 👋
              </h1>
              <p className="text-gray-400">{t('subtitle')}</p>
            </div>
            <div className="text-4xl">🎮</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/play"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl shadow-xl p-6 border border-blue-500 transition transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="text-5xl">🎯</div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{t('startPlaying')}</h2>
                <p className="text-blue-200">Start solving puzzles now!</p>
              </div>
            </div>
          </Link>

          <Link
            href="/levels"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl shadow-xl p-6 border border-purple-500 transition transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="text-5xl">📋</div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{t('browseLevels')}</h2>
                <p className="text-purple-200">Browse all 3,000 levels</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">{t('features')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-xl p-4 border-l-4 border-blue-500">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-lg font-bold text-white mb-1">{t('levels')}</h3>
              <p className="text-gray-400 text-sm">Progressive difficulty</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-4 border-l-4 border-yellow-500">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-lg font-bold text-white mb-1">{t('rewards')}</h3>
              <p className="text-gray-400 text-sm">Earn coins for each level</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-4 border-l-4 border-green-500">
              <div className="text-3xl mb-2">🤝</div>
              <h3 className="text-lg font-bold text-white mb-1">{t('referrals')}</h3>
              <p className="text-gray-400 text-sm">Invite friends and earn</p>
            </div>
            <div className="bg-gray-700 rounded-xl p-4 border-l-4 border-purple-500">
              <div className="text-3xl mb-2">💎</div>
              <h3 className="text-lg font-bold text-white mb-1">{t('staking')}</h3>
              <p className="text-gray-400 text-sm">Stake your coins</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/play"
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition text-center"
          >
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-white font-bold">{t('startPlaying')}</div>
          </Link>
          <Link
            href="/levels"
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition text-center"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="text-white font-bold">{t('browseLevels')}</div>
          </Link>
          <Link
            href="/dashboard"
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-green-500 transition text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-white font-bold">{t('dashboard')}</div>
          </Link>
        </div>
      </div>

      {mounted && <NavigationBar language={language} />}
    </div>
  );
}
