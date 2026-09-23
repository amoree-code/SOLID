import { act, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { getDirection, LocaleProvider, useLocale } from '../locale-provider';

function wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

describe('getDirection', () => {
  it('is rtl for Arabic and Sorani, ltr for English and Kurmanji', () => {
    expect(getDirection('ar')).toBe('rtl');
    expect(getDirection('ckb')).toBe('rtl');
    expect(getDirection('en')).toBe('ltr');
    expect(getDirection('ku')).toBe('ltr');
  });
});

describe('LocaleProvider', () => {
  it('defaults to English, left-to-right, on <html>', () => {
    render(<LocaleProvider>content</LocaleProvider>);

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('switches <html> lang and dir together and persists the choice', () => {
    const { result } = renderHook(() => useLocale(), { wrapper });

    act(() => result.current.setLocale('ar'));

    expect(result.current.direction).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(window.localStorage.getItem('app.locale')).toBe('ar');
  });

  it('ignores an unknown stored locale', () => {
    window.localStorage.setItem('app.locale', 'xx');

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('en');
  });

  it('throws when used outside the provider', () => {
    expect(() => renderHook(() => useLocale())).toThrow(/within a LocaleProvider/);
  });
});
