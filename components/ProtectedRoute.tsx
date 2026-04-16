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

  useEffect(() => {
    setMounted(true);
  }, []);

  const authorized = mounted && authService.isLoggedIn();

  useEffect(() => {
    if (mounted && !authorized) {
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
