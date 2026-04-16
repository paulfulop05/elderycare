import {
  createDoctor,
  DoctorServiceError,
  listDoctors,
} from "@/lib/services/server/doctorManagementService";
import { NextResponse } from "next/server";

export async function GET() {
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
}

export async function POST(request: Request) {
  try {
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
