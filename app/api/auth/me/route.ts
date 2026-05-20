import { NextResponse } from "next/server";
import {
  AuthSessionError,
  requireSession,
} from "@/lib/services/server/authSession";

export async function GET(request: Request) {
  try {
    const session = requireSession(request);
    return NextResponse.json(session.user, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AuthSessionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to load session." },
      { status: 500 },
    );
  }
}
