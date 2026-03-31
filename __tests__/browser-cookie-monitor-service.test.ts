import {
  browserCookieMonitorService,
  type BrowserActivitySnapshot,
} from "@/lib/services/browserCookieMonitorService";

const clearCookies = (): void => {
  document.cookie.split(";").forEach((cookie) => {
    const [name] = cookie.split("=");
    if (name?.trim()) {
      document.cookie = `${name.trim()}=; Max-Age=0; path=/`;
    }
  });
};

describe("browserCookieMonitorService", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("stores page-view activity in cookie", () => {
    const snapshot = browserCookieMonitorService.recordActivity(
      "page_view",
      "/dashboard",
    );

    expect(snapshot.totalEvents).toBe(1);
    expect(snapshot.counters.pageView).toBe(1);
    expect(snapshot.recentPaths).toEqual(["/dashboard"]);

    const stored = browserCookieMonitorService.getActivitySnapshot();
    expect(stored.counters.pageView).toBe(1);
    expect(stored.recentPaths).toEqual(["/dashboard"]);
  });

  it("increments click and keydown counters", () => {
    browserCookieMonitorService.recordActivity("click");
    browserCookieMonitorService.recordActivity("keydown");

    const snapshot =
      browserCookieMonitorService.getActivitySnapshot() as BrowserActivitySnapshot;

    expect(snapshot.totalEvents).toBe(2);
    expect(snapshot.counters.click).toBe(1);
    expect(snapshot.counters.keydown).toBe(1);
  });

  it("stores and reads preferences", () => {
    browserCookieMonitorService.setPreference("theme", "light");
    browserCookieMonitorService.setPreference("language", "en");

    expect(browserCookieMonitorService.getPreference("theme")).toBe("light");
    expect(browserCookieMonitorService.getPreference("language")).toBe("en");

    const preferences = browserCookieMonitorService.getPreferences();
    expect(preferences.values.theme).toBe("light");
    expect(preferences.values.language).toBe("en");
  });

  it("recovers when activity cookie contains invalid json", () => {
    document.cookie = "ec_activity=not-json; path=/";

    expect(() => {
      browserCookieMonitorService.recordActivity("click");
    }).not.toThrow();

    const snapshot = browserCookieMonitorService.getActivitySnapshot();
    expect(snapshot.totalEvents).toBe(1);
    expect(snapshot.counters.click).toBe(1);
  });
});
