import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Locale and direction only — no translation resources, no loading. A real
 * project plugs its own translation system in on top of `locale`.
 */
export const SUPPORTED_LOCALES = ['en', 'ar', 'ckb', 'ku'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type Direction = 'ltr' | 'rtl';

const DEFAULT_LOCALE: Locale = 'en';

const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar', 'ckb']);

const LOCALE_STORAGE_KEY = 'app.locale';

export function getDirection(locale: Locale): Direction {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

function isLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

function readStoredLocale(): Locale {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

type LocaleContextValue = {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
};

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? readStoredLocale());
  const direction = getDirection(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const value = useMemo(() => ({ locale, direction, setLocale }), [locale, direction, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
}
