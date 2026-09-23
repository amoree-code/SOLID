import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

window.scrollTo = () => {};

// jsdom has no matchMedia; the sidebar and theme provider both read it.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

// jsdom lacks the pointer-capture and scrolling APIs Radix Select/DropdownMenu call.
Element.prototype.hasPointerCapture = () => false;
Element.prototype.releasePointerCapture = () => {};
Element.prototype.scrollIntoView = () => {};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});
