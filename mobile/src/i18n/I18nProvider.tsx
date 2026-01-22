import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Locale, getLocale, setLocale as setI18nLocale, supportedLocales, translate } from "./i18n";
import { loadStoredLocale, saveStoredLocale } from "../storage/localeStorage";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLocales: { code: Locale; label: string }[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => {
    let mounted = true;
    loadStoredLocale().then((stored) => {
      if (!mounted) {
        return;
      }
      setI18nLocale(stored);
      setLocaleState(stored);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setI18nLocale(next);
    setLocaleState(next);
    void saveStoredLocale(next);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => translate(key, params), [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      supportedLocales
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
