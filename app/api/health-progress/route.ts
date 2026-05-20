import { NextResponse } from "next/server";
import { DoctorServiceError } from "@/lib/services/server/doctorManagementService";
import {
  AuthSessionError,
  requireSession,
} from "@/lib/services/server/authSession";
import { getHealthProgressLists } from "@/lib/services/server/healthProgressService";

export async function GET(request: Request) {
  try {
    requireSession(request);
    const result = await getHealthProgressLists();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthSessionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof DoctorServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to load health progress." },
      { status: 500 },
    );
  }
}
