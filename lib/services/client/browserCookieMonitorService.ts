type ActivityType = "page_view" | "click" | "keydown";

type ActivityCounters = {
  pageView: number;
  click: number;
  keydown: number;
};

export type BrowserActivitySnapshot = {
  sessionStartedAt: string;
  lastActiveAt: string;
  totalEvents: number;
  counters: ActivityCounters;
  recentPaths: string[];
};

export type BrowserPreferences = {
  updatedAt: string;
  values: Record<string, string>;
};

const ACTIVITY_COOKIE_NAME = "ec_activity";
const PREFERENCES_COOKIE_NAME = "ec_preferences";
const ACTIVITY_COOKIE_DAYS = 30;
const PREFERENCES_COOKIE_DAYS = 365;
const MAX_RECENT_PATHS = 10;

const isBrowser = (): boolean => typeof document !== "undefined";

const buildCookie = (
  name: string,
  value: string,
  maxAgeDays: number,
): string => {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  return `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const readCookie = (name: string): string | null => {
  if (!isBrowser()) {
    return null;
  }

  const cookiePrefix = `${name}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const cookie = part.trim();
    if (cookie.startsWith(cookiePrefix)) {
      return decodeURIComponent(cookie.slice(cookiePrefix.length));
    }
  }

  return null;
};

const writeCookie = (name: string, value: string, maxAgeDays: number): void => {
  if (!isBrowser()) {
    return;
  }

  document.cookie = buildCookie(name, value, maxAgeDays);
};

const defaultActivitySnapshot = (): BrowserActivitySnapshot => {
  const now = new Date().toISOString();
  return {
    sessionStartedAt: now,
    lastActiveAt: now,
    totalEvents: 0,
    counters: {
      pageView: 0,
      click: 0,
      keydown: 0,
    },
    recentPaths: [],
  };
};

const defaultPreferences = (): BrowserPreferences => ({
  updatedAt: new Date().toISOString(),
  values: {},
});

const readJsonCookie = <T>(cookieName: string, fallback: T): T => {
  const value = readCookie(cookieName);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const browserCookieMonitorService = {
  recordActivity: (
    type: ActivityType,
    path?: string,
  ): BrowserActivitySnapshot => {
    const current = readJsonCookie<BrowserActivitySnapshot>(
      ACTIVITY_COOKIE_NAME,
      defaultActivitySnapshot(),
    );

    const next: BrowserActivitySnapshot = {
      ...current,
      lastActiveAt: new Date().toISOString(),
      totalEvents: current.totalEvents + 1,
      counters: {
        ...current.counters,
      },
      recentPaths: [...current.recentPaths],
    };

    if (type === "page_view") {
      next.counters.pageView += 1;
      if (path) {
        next.recentPaths = [...next.recentPaths, path].slice(-MAX_RECENT_PATHS);
      }
    }

    if (type === "click") {
      next.counters.click += 1;
    }

    if (type === "keydown") {
      next.counters.keydown += 1;
    }

    writeCookie(
      ACTIVITY_COOKIE_NAME,
      JSON.stringify(next),
      ACTIVITY_COOKIE_DAYS,
    );
    return next;
  },

  getActivitySnapshot: (): BrowserActivitySnapshot =>
    readJsonCookie<BrowserActivitySnapshot>(
      ACTIVITY_COOKIE_NAME,
      defaultActivitySnapshot(),
    ),

  setPreference: (key: string, value: string): BrowserPreferences => {
    const current = readJsonCookie<BrowserPreferences>(
      PREFERENCES_COOKIE_NAME,
      defaultPreferences(),
    );

    const next: BrowserPreferences = {
      updatedAt: new Date().toISOString(),
      values: {
        ...current.values,
        [key]: value,
      },
    };

    writeCookie(
      PREFERENCES_COOKIE_NAME,
      JSON.stringify(next),
      PREFERENCES_COOKIE_DAYS,
    );

    return next;
  },

  getPreferences: (): BrowserPreferences =>
    readJsonCookie<BrowserPreferences>(
      PREFERENCES_COOKIE_NAME,
      defaultPreferences(),
    ),

  getPreference: (key: string): string | undefined => {
    const preferences = readJsonCookie<BrowserPreferences>(
      PREFERENCES_COOKIE_NAME,
      defaultPreferences(),
    );
    return preferences.values[key];
  },
};
