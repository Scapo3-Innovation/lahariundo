import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeTransitionOrigin {
  x: number;
  y: number;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (origin?: ThemeTransitionOrigin) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_PAGE_COLORS: Record<Theme, string> = {
  light: '#fafafa',
  dark: '#09090b',
};

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('lahariundo-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDom(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('lahariundo-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    THEME_PAGE_COLORS[theme],
  );
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setRevealOrigin(x: number, y: number) {
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  ) + 24;

  const root = document.documentElement;
  root.style.setProperty('--theme-x', `${x}px`);
  root.style.setProperty('--theme-y', `${y}px`);
  root.style.setProperty('--theme-r-end', `${endRadius}px`);
}

function clearRevealOrigin() {
  const root = document.documentElement;
  root.style.removeProperty('--theme-x');
  root.style.removeProperty('--theme-y');
  root.style.removeProperty('--theme-r-end');
}

function runFallbackReveal(next: Theme, x: number, y: number, onDone: () => void) {
  setRevealOrigin(x, y);
  document.documentElement.classList.add('theme-reveal-active');

  const overlay = document.createElement('div');
  overlay.className = 'theme-reveal-overlay';
  overlay.style.background = THEME_PAGE_COLORS[next];
  document.body.appendChild(overlay);

  const finish = () => {
    overlay.remove();
    document.documentElement.classList.remove('theme-reveal-active');
    clearRevealOrigin();
    onDone();
  };

  overlay.addEventListener('animationend', finish, { once: true });
  window.setTimeout(finish, 1200);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyThemeToDom(theme);
  }, []);

  const transitionToTheme = useCallback((next: Theme, origin?: ThemeTransitionOrigin) => {
    if (prefersReducedMotion()) {
      setThemeState(next);
      applyThemeToDom(next);
      return;
    }

    const x = origin?.x ?? 36;
    const y = origin?.y ?? 36;
    setRevealOrigin(x, y);

    const commit = () => {
      setThemeState(next);
      applyThemeToDom(next);
    };

    const cleanup = () => {
      document.documentElement.classList.remove('theme-reveal-active');
      clearRevealOrigin();
    };

    if (typeof document.startViewTransition === 'function') {
      document.documentElement.classList.add('theme-reveal-active');
      document.startViewTransition(commit).finished.finally(cleanup);
    } else {
      document.documentElement.classList.add('theme-reveal-active');
      runFallbackReveal(next, x, y, () => {
        commit();
        cleanup();
      });
    }
  }, []);

  const setTheme = useCallback(
    (next: Theme) => transitionToTheme(next),
    [transitionToTheme],
  );

  const toggleTheme = useCallback(
    (origin?: ThemeTransitionOrigin) => {
      transitionToTheme(theme === 'light' ? 'dark' : 'light', origin);
    },
    [theme, transitionToTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
