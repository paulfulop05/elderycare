import { NextRequest, NextResponse } from "next/server";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function middleware(request: NextRequest) {
  const enforceHttps = process.env.ENFORCE_HTTPS === "true";
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "";
  const isHttps =
    forwardedProto === "https" || request.nextUrl.protocol === "https:";
  const isLocalHost = LOCAL_HOSTS.has(request.nextUrl.hostname);

  if (enforceHttps && !isHttps && !isLocalHost) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https:";
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.next();
  if (enforceHttps && isHttps) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
