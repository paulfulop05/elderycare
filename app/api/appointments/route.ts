import { NextResponse } from "next/server";
import { DoctorServiceError } from "@/lib/services/server/doctorManagementService";
import {
  AuthSessionError,
  requireSession,
} from "@/lib/services/server/authSession";
import {
  listAppointments,
  listAvailableSlots,
  scheduleAppointment,
} from "@/lib/services/server/appointmentManagementService";

export async function GET(request: Request) {
  try {
    requireSession(request);
    const appointments = await listAppointments();
    return NextResponse.json({
      appointments,
      availableSlots: listAvailableSlots(),
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
      { error: "Failed to fetch appointments." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    requireSession(request);
    const body = (await request.json()) as Record<string, unknown>;
    const appointment = await scheduleAppointment(body);
    return NextResponse.json(appointment, { status: 201 });
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
      { error: "Failed to schedule appointment." },
      { status: 500 },
    );
  }
}
