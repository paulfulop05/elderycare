"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/services/client/authService";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    let cancelled = false;

    const validateAuth = async () => {
      if (!authService.isLoggedIn()) {
        if (!cancelled) {
          setAuthorized(false);
        }
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.did <= 0) {
        if (!cancelled) {
          setAuthorized(true);
        }
        return;
      }

      try {
        const response = await fetch(`/api/doctors/${currentUser.did}`, {
          cache: "no-store",
        });

        if (!cancelled) {
          if (response.ok) {
            setAuthorized(true);
            return;
          }

          if (response.status === 404) {
            authService.logout();
          }

          setAuthorized(false);
        }
      } catch {
        if (!cancelled) {
          setAuthorized(false);
        }
      }
    };

    void validateAuth();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  useEffect(() => {
    if (mounted && authorized === false) {
      const redirectTarget = pathname
        ? `?from=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/login${redirectTarget}`);
    }
  }, [authorized, mounted, pathname, router]);

  if (!mounted || authorized !== true) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
