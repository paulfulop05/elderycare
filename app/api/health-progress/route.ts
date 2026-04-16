import { NextResponse } from "next/server";
import { DoctorServiceError } from "@/lib/services/server/doctorManagementService";
import { getHealthProgressLists } from "@/lib/services/server/healthProgressService";

export async function GET() {
  try {
    const result = await getHealthProgressLists();
    return NextResponse.json(result);
  } catch (error) {
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
