import { NextResponse } from "next/server";
import { DoctorServiceError } from "@/lib/services/server/doctorManagementService";
import { listPatients } from "@/lib/services/server/patientManagementService";

export async function GET() {
  try {
    const patients = await listPatients();
    return NextResponse.json(patients);
  } catch (error) {
    if (error instanceof DoctorServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch patients." },
      { status: 500 },
    );
  }
}
