import { NextResponse } from "next/server";
import {
  AuthSessionError,
  renewSessionResponse,
} from "@/lib/services/server/authSession";

export async function POST(request: Request) {
  try {
    return renewSessionResponse(request);
  } catch (error) {
    if (error instanceof AuthSessionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to refresh session." },
      { status: 500 },
    );
  }
}
