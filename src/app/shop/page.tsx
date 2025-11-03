'use client';

import { useEffect, useState } from 'react';
import { gameEngine } from '@/lib/game-engine';
import NavigationBar from '@/components/NavigationBar';
import FloatingIcons from '@/components/FloatingIcons';
import { getLanguage, getLanguageDirection } from '@/lib/language';
import { initializeTelegramWebApp } from '@/lib/telegram';

export default function ShopPage() {
  const [stats, setStats] = useState({
    sbrBalance: 0,
  });
  const [language, setLanguage] = useState<'en' | 'ar'>(getLanguage());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobilisPhone, setMobilisPhone] = useState('');
  const [binanceId, setBinanceId] = useState('');
  const [processing, setProcessing] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-me.aizetecc.com/api';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeTelegramWebApp();
      const currentLang = getLanguage();
      setLanguage(currentLang);
      loadStats();
    }
  }, []);

  const loadStats = () => {
    if (typeof window === 'undefined') return;
    const gameStats = gameEngine.getStats();
    setStats({ sbrBalance: gameStats.sbrBalance });
  };

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
      const telegramWebApp = (window as any).Telegram?.WebApp;
      const initData = telegramWebApp?.initData;
      const userId = telegramWebApp?.initDataUnsafe?.user?.id;

      if (typeof window !== 'undefined') {
        // Call API to create order
        try {
          if (userId && initData) {
            await fetch(`${apiUrl}/shop/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData,
              },
              body: JSON.stringify({
                type: 'ooredoo',
                phone_number: phoneNumber,
                amount: 10000,
                points_cost: 500,
              }),
            });
          }
        } catch (apiError) {
          console.error('API error:', apiError);
        }

        const newStats = gameEngine.getStats();
        newStats.sbrBalance -= 500;
        newStats.totalEarned -= 500;
        
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
      const telegramWebApp = (window as any).Telegram?.WebApp;
      const initData = telegramWebApp?.initData;
      const userId = telegramWebApp?.initDataUnsafe?.user?.id;

      if (typeof window !== 'undefined') {
        // Call API to create order
        try {
          if (userId && initData) {
            await fetch(`${apiUrl}/shop/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData,
              },
              body: JSON.stringify({
                type: 'mobilis',
                phone_number: mobilisPhone,
                amount: 10000,
                points_cost: 500,
              }),
            });
          }
        } catch (apiError) {
          console.error('API error:', apiError);
        }

        const newStats = gameEngine.getStats();
        newStats.sbrBalance -= 500;
        newStats.totalEarned -= 500;
        
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
      const telegramWebApp = (window as any).Telegram?.WebApp;
      const initData = telegramWebApp?.initData;
      const userId = telegramWebApp?.initDataUnsafe?.user?.id;

      if (typeof window !== 'undefined') {
        // Call API to create order
        try {
          if (userId && initData) {
            await fetch(`${apiUrl}/shop/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': initData,
              },
              body: JSON.stringify({
                type: 'usdt',
                binance_id: binanceId,
                amount: 2,
                points_cost: 1000,
              }),
            });
          }
        } catch (apiError) {
          console.error('API error:', apiError);
        }

        const newStats = gameEngine.getStats();
        newStats.sbrBalance -= 1000;
        newStats.totalEarned -= 1000;
        
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

  return (
    <div className={`min-h-screen bg-gray-900 relative pb-20 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={getLanguageDirection(language)}>
      <FloatingIcons />
      
      {/* Header Stats */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-3">
          <div className="bg-gray-700 rounded-xl p-3 border-l-4 border-green-500">
            <div className="text-xs text-gray-400 mb-1">{language === 'ar' ? 'رصيد' : 'Balance'}</div>
            <div className="text-lg font-bold text-white">{stats.sbrBalance.toFixed(1)} SBR</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">🛒 {language === 'ar' ? 'المتجر' : 'Shop'}</h2>
          
          {/* Ooredoo Recharge */}
          <div className="bg-gray-700 rounded-xl p-4 mb-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">📱 {language === 'ar' ? 'شحن أوريدو' : 'Ooredoo Recharge'}</h3>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? '500 نقطة = 10,000 دينار' : '500 points = 10,000 IQD'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">500</div>
                <div className="text-xs text-gray-400">SBR</div>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                className="w-full px-4 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleOoredooRecharge}
                disabled={stats.sbrBalance < 500 || processing || !phoneNumber}
                className={`w-full py-3 px-4 rounded-lg font-bold transition ${
                  stats.sbrBalance >= 500 && !processing && phoneNumber
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {processing 
                  ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                  : (language === 'ar' ? 'طلب الشحن' : 'Request Recharge')
                }
              </button>
            </div>
          </div>

          {/* Mobilis Recharge */}
          <div className="bg-gray-700 rounded-xl p-4 mb-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">📱 {language === 'ar' ? 'شحن موبايليس' : 'Mobilis Recharge'}</h3>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? '500 نقطة = 10,000 دينار' : '500 points = 10,000 IQD'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">500</div>
                <div className="text-xs text-gray-400">SBR</div>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="tel"
                value={mobilisPhone}
                onChange={(e) => setMobilisPhone(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                className="w-full px-4 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleMobilisRecharge}
                disabled={stats.sbrBalance < 500 || processing || !mobilisPhone}
                className={`w-full py-3 px-4 rounded-lg font-bold transition ${
                  stats.sbrBalance >= 500 && !processing && mobilisPhone
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {processing 
                  ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                  : (language === 'ar' ? 'طلب الشحن' : 'Request Recharge')
                }
              </button>
            </div>
          </div>

          {/* USDT Exchange */}
          <div className="bg-gray-700 rounded-xl p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">💵 {language === 'ar' ? 'تحويل USDT' : 'USDT Exchange'}</h3>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? '1000 نقطة = 2 دولار' : '1000 points = 2$'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">1000</div>
                <div className="text-xs text-gray-400">SBR</div>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={binanceId}
                onChange={(e) => setBinanceId(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل Binance ID' : 'Enter Binance ID'}
                className="w-full px-4 py-2 bg-gray-900 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
              />
              <button
                onClick={handleUSDTExchange}
                disabled={stats.sbrBalance < 1000 || processing || !binanceId}
                className={`w-full py-3 px-4 rounded-lg font-bold transition ${
                  stats.sbrBalance >= 1000 && !processing && binanceId
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {processing 
                  ? (language === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                  : (language === 'ar' ? 'طلب التحويل' : 'Request Exchange')
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <NavigationBar language={language} />
    </div>
  );
}


