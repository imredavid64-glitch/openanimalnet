import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';
import ar from './locales/ar.json';
import ja from './locales/ja.json';

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ar' | 'ja';

export const LOCALES: { code: Locale; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const translations: Record<Locale, any> = { en, es, fr, de, pt, zh, ar, ja };

export function getTranslation(locale: Locale, key: string, fallback?: string): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  return (typeof value === 'string' ? value : fallback ?? key);
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('oan-locale') as Locale;
  if (stored && translations[stored]) return stored;
  const browserLang = navigator.language.split('-')[0] as Locale;
  return translations[browserLang] ? browserLang : 'en';
}