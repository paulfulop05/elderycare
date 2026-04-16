import { NextResponse } from "next/server";
import {
  authenticateDoctorLogin,
  DoctorServiceError,
} from "@/lib/services/server/doctorManagementService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const user = await authenticateDoctorLogin(body);

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof DoctorServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
  }
}
