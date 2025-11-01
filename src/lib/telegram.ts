// Telegram WebApp utilities

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export function getTelegramUser(): TelegramUser | null {
  if (typeof window === 'undefined') return null;
  
  const tg = window.Telegram?.WebApp;
  if (!tg || !tg.initDataUnsafe?.user) {
    return null;
  }
  
  return tg.initDataUnsafe.user as TelegramUser;
}

export function getReferralCode(): string {
  const user = getTelegramUser();
  if (user) {
    // Generate referral code from Telegram ID
    return `BIT3K${user.id}`;
  }
  return 'BIT3K123'; // Fallback
}

export function getReferralLink(): string {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'Bitme3kbot';
  const referralCode = getReferralCode();
  // Telegram bot deep link with start parameter
  return `https://t.me/${botUsername}?start=${referralCode}`;
}

export function isInTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.Telegram?.WebApp;
}

export function initializeTelegramWebApp() {
  if (typeof window === 'undefined') return;
  
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }
}

