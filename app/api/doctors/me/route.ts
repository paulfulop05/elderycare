import {
  DoctorServiceError,
  updateDoctorPassword,
  updateDoctorProfile,
} from "@/lib/services/server/doctorManagementService";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
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
      const doctor = await updateDoctorProfile(body);
      return NextResponse.json(doctor);
    }

    if (body.currentPassword !== undefined || body.newPassword !== undefined) {
      await updateDoctorPassword(body);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "No supported patch payload provided." },
      { status: 400 },
    );
  } catch (error) {
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
