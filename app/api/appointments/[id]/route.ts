import { NextResponse } from "next/server";
import { DoctorServiceError } from "@/lib/services/server/doctorManagementService";
import {
  deleteAppointment,
  updateAppointmentStatus,
} from "@/lib/services/server/appointmentManagementService";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: unknown };

    if (body.status !== "completed") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const appointment = await updateAppointmentStatus(id, body.status);
    return NextResponse.json(appointment);
  } catch (error) {
    if (error instanceof DoctorServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to update appointment." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: Params) {
  try {
    const { id } = await context.params;
    await deleteAppointment(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof DoctorServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete appointment." },
      { status: 500 },
    );
  }
}
