import { NextResponse } from "next/server";
import {
  createDoctor,
  DoctorServiceError,
} from "@/lib/services/server/doctorManagementService";
import { createSessionResponse } from "@/lib/services/server/authSession";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const user = await createDoctor({
      ...body,
      role: body.role === "admin",
    });

    return createSessionResponse(
      request,
      {
        did: user.did,
        name: user.name,
        email: user.email,
        role: user.role ? "admin" : "doctor",
      },
      201,
    );
  } catch (error) {
    if (error instanceof DoctorServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json({ error: "Failed to register." }, { status: 500 });
  }
}
