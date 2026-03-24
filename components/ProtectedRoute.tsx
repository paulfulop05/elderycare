"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const authorized = authService.isLoggedIn();

  useEffect(() => {
    if (!authorized) {
      const redirectTarget = pathname
        ? `?from=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/login${redirectTarget}`);
    }
  }, [authorized, pathname, router]);

  if (authorized !== true) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
