// Arabic translations for common answer options

export const arabicTranslations: Record<string, string> = {
  // Common words
  'echo': 'صدى',
  'shadow': 'ظل',
  'wind': 'ريح',
  'mirror': 'مرآة',
  'sound': 'صوت',
  'voice': 'صوت',
  'light': 'ضوء',
  'dark': 'ظلام',
  'silence': 'صمت',
  'music': 'موسيقى',
  'noise': 'ضجيج',
  'whisper': 'همس',
  'door': 'باب',
  'key': 'مفتاح',
  'lock': 'قفل',
  'window': 'نافذة',
  'house': 'بيت',
  'room': 'غرفة',
  'clock': 'ساعة',
  'time': 'وقت',
  'hour': 'ساعة',
  'minute': 'دقيقة',
  'second': 'ثانية',
  'map': 'خريطة',
  'globe': 'كرة أرضية',
  'world': 'عالم',
  'earth': 'أرض',
  'planet': 'كوكب',
  'towel': 'منشفة',
  'cloth': 'قماش',
  'sponge': 'إسفنج',
  'paper': 'ورق',
  'tissue': 'مناديل',
  'keyboard': 'لوحة مفاتيح',
  'safe': 'خزنة',
  'car': 'سيارة',
  'atlas': 'أطلس',
  'book': 'كتاب',
  'person': 'شخص',
  'robot': 'روبوت',
  'doll': 'دمية',
  'apple': 'تفاحة',
  'water': 'ماء',
  'happy': 'سعيد',
  'sad': 'حزين',
  'word': 'كلمة',
  'text': 'نص',
  'letter': 'حرف',
  'sentence': 'جملة',
  'phrase': 'عبارة',
  'page': 'صفحة',
  'read': 'قرأ',
  'write': 'كتب',
  'draw': 'رسم',
  'paint': 'رسم',
  'poison': 'سم',
  'suicide': 'انتحار',
  'answer': 'إجابة',
  'solution': 'حل',
  'result': 'نتيجة',
  'choice': 'خيار',
  'option': 'خيار',
  'question': 'سؤال',
  'puzzle': 'لغز',
  'riddle': 'لغز',
  'challenge': 'تحدي',
  'game': 'لعبة',
};

// Convert English numbers to Arabic numerals
function convertToArabicNumerals(num: string): string {
  const arabicNumerals: Record<string, string> = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };
  
  return num.split('').map(char => arabicNumerals[char] || char).join('');
}

// Convert Arabic numerals back to English
function convertToEnglishNumerals(num: string): string {
  const englishNumerals: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  return num.split('').map(char => englishNumerals[char] || char).join('');
}

// Reverse translation: convert Arabic back to English
export function translateArabicToEnglish(arabicOption: string, originalOptions: string[]): string {
  const trimmed = arabicOption.trim();
  
  // Check if it's an Arabic numeral
  if (/[٠-٩]/.test(trimmed)) {
    return convertToEnglishNumerals(trimmed);
  }
  
  // Find the English equivalent in the translations
  for (const [english, arabic] of Object.entries(arabicTranslations)) {
    if (arabic === trimmed) {
      // Find the original English option
      const matchingOption = originalOptions.find(opt => opt.toLowerCase() === english);
      if (matchingOption) return matchingOption;
      return english;
    }
  }
  
  // If not found, try to find in original options (maybe it's already in English)
  const found = originalOptions.find(opt => 
    opt.toLowerCase() === trimmed.toLowerCase() ||
    arabicTranslations[opt.toLowerCase()] === trimmed
  );
  
  return found || arabicOption;
}

// Translate English options to Arabic
export function translateOptionsToArabic(options: string[]): string[] {
  return options.map(option => {
    const lower = option.toLowerCase().trim();
    // For numbers, convert to Arabic numerals
    if (!isNaN(Number(lower))) {
      return convertToArabicNumerals(option);
    }
    // Return Arabic translation if available
    return arabicTranslations[lower] || option;
  });
}

