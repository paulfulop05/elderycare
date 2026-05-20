import { NextResponse } from "next/server";
import {
  deleteDoctor,
  DoctorServiceError,
  getDoctorById,
} from "@/lib/services/server/doctorManagementService";
import {
  AuthSessionError,
  requireRole,
} from "@/lib/services/server/authSession";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Params) {
  try {
    requireRole(request, ["admin"]);
    const { id } = await context.params;
    const doctor = await getDoctorById(id);

    return NextResponse.json({
      did: doctor.did,
      name: doctor.name,
      age: doctor.age,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
    });
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
      { error: "Failed to fetch doctor." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: Params) {
  try {
    requireRole(request, ["admin"]);
    const { id } = await context.params;
    await deleteDoctor(id);
    return NextResponse.json({ ok: true });
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
      { error: "Failed to delete doctor." },
      { status: 500 },
    );
  }
}
