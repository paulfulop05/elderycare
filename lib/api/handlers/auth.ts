import { badRequest, ok, type ApiResult } from "@/lib/api/types";
import { roleLoginSchema, zodIssuesToDetails } from "@/lib/api/validation";
import { authService } from "@/lib/services/authService";
import type { UserRole } from "@/lib/domain";

type AuthStateDto = {
  loggedIn: boolean;
  role: UserRole;
  displayName: string;
};

const getCurrentAuthState = (): AuthStateDto => ({
  loggedIn: authService.isLoggedIn(),
  role: authService.getUserRole(),
  displayName: authService.getCurrentUserName(),
});

export const login = (body: unknown): ApiResult<AuthStateDto> => {
  const parsed = roleLoginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(
      "Invalid login payload.",
      zodIssuesToDetails(parsed.error.issues),
    );
  }

  authService.loginAs(parsed.data.role);
  return ok(getCurrentAuthState());
};

export const logout = (): ApiResult<AuthStateDto> => {
  authService.logout();
  return ok(getCurrentAuthState());
};

export const me = (): ApiResult<AuthStateDto> => ok(getCurrentAuthState());
