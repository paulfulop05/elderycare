"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { browserCookieMonitorService } from "@/lib/services/browserCookieMonitorService";

const EVENT_THROTTLE_MS = 2000;

const shouldCaptureEvent = (
  lastCapturedAt: React.MutableRefObject<Record<string, number>>,
  eventType: "click" | "keydown",
): boolean => {
  const now = Date.now();
  const lastTimestamp = lastCapturedAt.current[eventType] ?? 0;

  if (now - lastTimestamp < EVENT_THROTTLE_MS) {
    return false;
  }

  lastCapturedAt.current[eventType] = now;
  return true;
};

export default function BrowserActivityMonitor() {
  const pathname = usePathname();
  const lastCapturedAt = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!pathname) {
      return;
    }

    browserCookieMonitorService.recordActivity("page_view", pathname);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (): void => {
      if (shouldCaptureEvent(lastCapturedAt, "click")) {
        browserCookieMonitorService.recordActivity("click");
      }
    };

    const handleKeyDown = (): void => {
      if (shouldCaptureEvent(lastCapturedAt, "keydown")) {
        browserCookieMonitorService.recordActivity("keydown");
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
