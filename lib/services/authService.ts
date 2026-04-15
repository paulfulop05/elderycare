import type { UserRole } from "@/lib/domain";
import { authRepository } from "@/lib/data";

export const authService = {
  loginAs: (role: UserRole): void => {
    authRepository.setRole(role);
    authRepository.setLoggedIn(true);
  },
  logout: (): void => {
    authRepository.clear();
  },
  isLoggedIn: (): boolean => authRepository.getState().loggedIn,
  getUserRole: (): UserRole => authRepository.getState().role,
  getCurrentUserName: (): string =>
    authRepository.getState().role === "admin" ? "Admin" : "Dr. Maria",
};
