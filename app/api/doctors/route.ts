import { NextResponse } from "next/server";
import {
  createDoctor,
  DoctorServiceError,
  listDoctors,
} from "@/lib/services/server/doctorManagementService";
import {
  AuthSessionError,
  requireRole,
} from "@/lib/services/server/authSession";

export async function GET(request: Request) {
  try {
    requireRole(request, ["admin"]);
    const doctors = await listDoctors();
    return NextResponse.json(
      doctors.map((doctor) => ({
        did: doctor.did,
        name: doctor.name,
        age: doctor.age,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
      })),
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
      { error: "Failed to fetch doctors." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    requireRole(request, ["admin"]);
    const body = (await request.json()) as Record<string, unknown>;
    const doctor = await createDoctor(body);

    return NextResponse.json(
      {
        did: doctor.did,
        name: doctor.name,
        age: doctor.age,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
      },
      { status: 201 },
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
      { error: "Failed to create doctor." },
      { status: 500 },
    );
  }
}
