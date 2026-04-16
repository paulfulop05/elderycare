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

    writeRole(user.role);
    writeUser(user);
    writeLoggedIn(true);
  },
  logout: (): void => {
    writeRole("doctor");
    writeUser(null);
    writeLoggedIn(false);
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
