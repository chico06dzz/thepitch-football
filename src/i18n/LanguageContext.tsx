import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppLanguage } from '../types/football';
import { getLocaleCode, TRANSLATIONS, Translations } from './translations';

const LANG_STORAGE_KEY = 'thepitch_lang';

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  t: Translations;
  locale: string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'fr' || saved === 'ar' || saved === 'en') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'fr';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<AppLanguage>(() => readInitialLanguage());

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = TRANSLATIONS[lang].documentTitle;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang: setLangState,
      t: TRANSLATIONS[lang],
      locale: getLocaleCode(lang),
      isRtl: lang === 'ar',
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
