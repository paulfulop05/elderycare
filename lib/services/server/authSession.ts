import crypto from "node:crypto";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/domain";

export type SessionUser = {
  did: number;
  name: string;
  email: string;
  role: UserRole;
};

type SessionTokenPayload = {
  user: SessionUser;
  issuedAt: number;
  lastActiveAt: number;
  expiresAt: number;
};

export class AuthSessionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthSessionError";
    this.statusCode = statusCode;
  }
}

const SESSION_COOKIE_NAME = "ec_session";
const SESSION_IDLE_TIMEOUT_MS = 0.3 * 60 * 1000;
const SESSION_ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const DEFAULT_SECRET = "eldery-care-dev-session-secret";

const getSecret = (): string => process.env.AUTH_TOKEN_SECRET ?? DEFAULT_SECRET;

const encode = (value: string): string =>
  Buffer.from(value).toString("base64url");
const decode = (value: string): string =>
  Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string): string =>
  crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");

const now = (): number => Date.now();

const isSecureRequest = (request: Request): boolean => {
  if (process.env.AUTH_COOKIE_SECURE === "true") {
    return true;
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
};

const readCookieValue = (
  request: Request,
  cookieName: string,
): string | null => {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === cookieName) {
      return rest.join("=");
    }
  }

  return null;
};

const signPayload = (payload: SessionTokenPayload): string => {
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export const buildSessionToken = (user: SessionUser): string =>
  signPayload({
    user,
    issuedAt: now(),
    lastActiveAt: now(),
    expiresAt: now() + SESSION_IDLE_TIMEOUT_MS,
  });

export const parseSessionToken = (
  token: string | null | undefined,
): SessionTokenPayload | null => {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(encodedPayload)) as SessionTokenPayload;
    if (
      typeof parsed !== "object" ||
      !parsed ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.lastActiveAt !== "number" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.user?.did !== "number" ||
      typeof parsed.user?.name !== "string" ||
      typeof parsed.user?.email !== "string" ||
      (parsed.user.role !== "doctor" && parsed.user.role !== "admin")
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const getSessionFromRequest = (
  request: Request,
): SessionTokenPayload | null => {
  const parsed = parseSessionToken(
    readCookieValue(request, SESSION_COOKIE_NAME),
  );
  if (!parsed) {
    return null;
  }

  const currentTime = now();
  if (
    currentTime > parsed.expiresAt ||
    currentTime - parsed.lastActiveAt > SESSION_IDLE_TIMEOUT_MS ||
    currentTime - parsed.issuedAt > SESSION_ABSOLUTE_TIMEOUT_MS
  ) {
    return null;
  }

  return parsed;
};

export const requireSession = (request: Request): SessionTokenPayload => {
  const session = getSessionFromRequest(request);
  if (!session) {
    throw new AuthSessionError(
      "Your session has expired. Please log in again.",
      401,
    );
  }

  return session;
};

export const requireRole = (
  request: Request,
  allowedRoles: UserRole[],
): SessionTokenPayload => {
  const session = requireSession(request);
  if (!allowedRoles.includes(session.user.role)) {
    throw new AuthSessionError(
      "You do not have permission to perform this action.",
      403,
    );
  }

  return session;
};

const cookieParts = (request: Request, expiresAt: number): string[] => {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(signSession(request, expiresAt))}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(1, Math.floor((expiresAt - now()) / 1000))}`,
  ];

  if (isSecureRequest(request)) {
    parts.push("Secure");
  }

  return parts;
};

const signSession = (request: Request, expiresAt: number): string => {
  const session = requireSession(request);
  const payload: SessionTokenPayload = {
    user: session.user,
    issuedAt: session.issuedAt,
    lastActiveAt: now(),
    expiresAt: Math.min(
      expiresAt,
      session.issuedAt + SESSION_ABSOLUTE_TIMEOUT_MS,
    ),
  };

  return signPayload(payload);
};

export const createSessionResponse = (
  request: Request,
  user: SessionUser,
  status = 200,
): NextResponse => {
  const response = NextResponse.json(user, { status });
  response.headers.set("Cache-Control", "no-store");

  const token = buildSessionToken(user);
  const expiresAt = now() + SESSION_IDLE_TIMEOUT_MS;
  response.headers.append(
    "Set-Cookie",
    [
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${Math.floor(SESSION_IDLE_TIMEOUT_MS / 1000)}`,
      isSecureRequest(request) ? "Secure" : null,
    ]
      .filter(Boolean)
      .join("; "),
  );

  return response;
};

export const renewSessionResponse = (request: Request): NextResponse => {
  const session = requireSession(request);
  const response = NextResponse.json(session.user, { status: 200 });
  response.headers.set("Cache-Control", "no-store");

  const expiresAt = Math.min(
    now() + SESSION_IDLE_TIMEOUT_MS,
    session.issuedAt + SESSION_ABSOLUTE_TIMEOUT_MS,
  );
  response.headers.append(
    "Set-Cookie",
    cookieParts(request, expiresAt).join("; "),
  );

  return response;
};

export const clearSessionResponse = (): NextResponse => {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  response.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
};
