// Language management utility

export type Language = 'en' | 'ar';

const LANGUAGE_KEY = 'bit3k_language';

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  // Check Telegram user language first
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user?.language_code) {
    const langCode = tg.initDataUnsafe.user.language_code;
    if (langCode.startsWith('ar')) return 'ar';
  }
  
  // Check localStorage
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === 'ar' || saved === 'en') {
    return saved;
  }
  
  // Default
  return 'en';
}

export function setLanguage(language: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANGUAGE_KEY, language);
}

export function getLanguageDirection(language: Language): 'ltr' | 'rtl' {
  return language === 'ar' ? 'rtl' : 'ltr';
}

