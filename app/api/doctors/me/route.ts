import {
  DoctorServiceError,
  updateDoctorPassword,
  updateDoctorProfile,
} from "@/lib/services/server/doctorManagementService";
import {
  AuthSessionError,
  requireSession,
} from "@/lib/services/server/authSession";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const session = requireSession(request);
    const body = (await request.json()) as {
      did?: unknown;
      name?: unknown;
      age?: unknown;
      email?: unknown;
      phoneNumber?: unknown;
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    if (body.name !== undefined) {
      if (
        String(body.did ?? "") !== String(session.user.did) &&
        session.user.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "You can only edit your own profile." },
          { status: 403 },
        );
      }

      const doctor = await updateDoctorProfile(body);
      return NextResponse.json(doctor);
    }

    if (body.currentPassword !== undefined || body.newPassword !== undefined) {
      if (String(body.did ?? "") !== String(session.user.did)) {
        return NextResponse.json(
          { error: "You can only change your own password." },
          { status: 403 },
        );
      }

      await updateDoctorPassword(body);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "No supported patch payload provided." },
      { status: 400 },
    );
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
      { error: "Failed to update doctor settings." },
      { status: 500 },
    );
  }
}
