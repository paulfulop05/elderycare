import { NextResponse } from "next/server";
import { sendDoctorWelcomeEmail } from "@/lib/services/server/emailService";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      name?: unknown;
      password?: unknown;
    };

    const email = body.email;
    const name = body.name;
    const password = body.password;

    if (
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields." },
        { status: 400 },
      );
    }

    await sendDoctorWelcomeEmail(email, name, password);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email." },
      { status: 500 },
    );
  }
}
