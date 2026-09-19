const ACCESS_TOKEN_KEY = 'auth.access-token';

/**
 * Isolates token persistence behind one module. Swap the implementation
 * (e.g. in-memory only) here without touching any component or page.
 */
export const sessionStorage = {
  getAccessToken(): string | null {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string): void {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear(): void {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
