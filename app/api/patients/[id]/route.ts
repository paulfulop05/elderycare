import { NextResponse } from "next/server";
import { DoctorServiceError } from "@/lib/services/server/doctorManagementService";
import {
  getPatientById,
  updatePatientAge,
  updatePatientDoctorNote,
  updatePatientMetrics,
} from "@/lib/services/server/patientManagementService";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const patient = await getPatientById(id);
    return NextResponse.json(patient);
  } catch (error) {
    if (error instanceof DoctorServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch patient." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      metrics?: Record<string, unknown>;
      age?: unknown;
      doctorNote?: unknown;
    };

    if (body.metrics) {
      const patient = await updatePatientMetrics(id, body.metrics, body.age);
      return NextResponse.json(patient);
    }

    if (body.age !== undefined) {
      const patient = await updatePatientAge(id, body.age);
      return NextResponse.json(patient);
    }

    if (body.doctorNote !== undefined) {
      const patient = await updatePatientDoctorNote(id, body.doctorNote);
      return NextResponse.json(patient);
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
      { error: "Failed to update patient." },
      { status: 500 },
    );
  }
}
