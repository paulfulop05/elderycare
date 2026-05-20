import type { UserRole } from "@/lib/domain";

type AuthUser = {
  did: number;
  name: string;
  email: string;
  role: UserRole;
};

const AUTH_ROLE_KEY = "ecare.auth.role";
const AUTH_LOGGED_IN_KEY = "ecare.auth.loggedIn";
const AUTH_USER_KEY = "ecare.auth.user";

const readRole = (): UserRole => {
  if (typeof window === "undefined") {
    return "doctor";
  }

  const role = window.localStorage.getItem(AUTH_ROLE_KEY);
  return role === "admin" ? "admin" : "doctor";
};

const writeRole = (role: UserRole): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_ROLE_KEY, role);
};

const readLoggedIn = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_LOGGED_IN_KEY) === "true";
};

const writeLoggedIn = (loggedIn: boolean): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_LOGGED_IN_KEY, String(loggedIn));
};

const readUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      typeof parsed.did !== "number" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      (parsed.role !== "doctor" && parsed.role !== "admin")
    ) {
      return null;
    }

    return {
      did: parsed.did,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    };
  } catch {
    return null;
  }
};

const writeUser = (user: AuthUser | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const persistSession = (user: AuthUser): AuthUser => {
  writeRole(user.role);
  writeUser(user);
  writeLoggedIn(true);
  return user;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // Keep the default message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> =>
  parseResponse<T>(
    await fetch(url, {
      cache: "no-store",
      credentials: "include",
      ...init,
    }),
  );

export const authService = {
  loginAs: (input: UserRole | AuthUser): void => {
    const user: AuthUser =
      typeof input === "string"
        ? {
            did: 0,
            name: input === "admin" ? "Admin" : "Doctor",
            email: "",
            role: input,
          }
        : input;

    persistSession(user);
  },
  register: async (input: {
    name: string;
    age: number;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): Promise<AuthUser> => {
    const user = await fetchJson<AuthUser>("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        age: input.age,
        email: input.email,
        phoneNumber: input.phone,
        password: input.password,
        role: input.role,
      }),
    });

    return persistSession(user);
  },
  hydrateSession: async (): Promise<AuthUser | null> => {
    try {
      const user = await fetchJson<AuthUser>("/api/auth/me");
      return persistSession(user);
    } catch {
      return null;
    }
  },
  touchSession: async (): Promise<boolean> => {
    if (!readLoggedIn()) {
      return false;
    }

    try {
      const user = await fetchJson<AuthUser>("/api/auth/heartbeat", {
        method: "POST",
      });

      persistSession(user);
      return true;
    } catch {
      authService.logout();
      return false;
    }
  },
  logout: (): void => {
    writeRole("doctor");
    writeUser(null);
    writeLoggedIn(false);
    if (typeof window !== "undefined" && typeof fetch === "function") {
      void fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      }).catch(() => undefined);
    }
  },
  isLoggedIn: (): boolean => readLoggedIn(),
  getUserRole: (): UserRole => readRole(),
  getCurrentUser: (): AuthUser | null => readUser(),
  getCurrentDoctorId: (): string | null => {
    const user = readUser();
    if (!user || user.did <= 0) {
      return null;
    }

    return String(user.did);
  },
  setCurrentUserName: (name: string): void => {
    const user = readUser();
    if (!user) {
      return;
    }

    writeUser({
      ...user,
      name,
    });
  },
  setCurrentUserProfile: (
    profile: Partial<Pick<AuthUser, "name" | "email">>,
  ): void => {
    const user = readUser();
    if (!user) {
      return;
    }

    writeUser({
      ...user,
      ...profile,
    });
  },
  getCurrentUserName: (): string =>
    readUser()?.name ?? (readRole() === "admin" ? "Admin" : "Doctor"),
};
