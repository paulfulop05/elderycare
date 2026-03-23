"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/mockData";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    setAuthorized(loggedIn);

    if (!loggedIn) {
      const redirectTarget = pathname
        ? `?from=${encodeURIComponent(pathname)}`
        : "";
      router.replace(`/login${redirectTarget}`);
    }
  }, [pathname, router]);

  if (authorized !== true) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
