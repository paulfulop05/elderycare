import { z } from "zod";
import type { HealthMetrics } from "@/lib/domain";
import {
  isValidPhoneNumber,
  validateDoctorNote,
  validatePatientMetrics,
} from "@/lib/validation";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const doctorCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  age: z.number().int().min(24).max(90),
  email: z.string().trim().toLowerCase().email(),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => isValidPhoneNumber(value),
      "Enter a valid phone number.",
    ),
});

export const appointmentCreateSchema = z.object({
  doctorName: z.string().trim().min(2).max(80),
  patientName: z.string().trim().min(2).max(80),
  date: z
    .string()
    .trim()
    .regex(isoDatePattern, "Date must be in YYYY-MM-DD format.")
    .refine(
      (value) => !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()),
      {
        message: "Date must be a valid calendar date.",
      },
    ),
  time: z.string().trim().regex(timePattern, "Time must be in HH:mm format."),
  reason: z.string().trim().min(3).max(120),
});

export const appointmentActionSchema = z.object({
  action: z.enum(["cancel", "finish"]),
});

export const roleLoginSchema = z.object({
  role: z.enum(["doctor", "admin"]),
});

const patientMetricsInputSchema = z.object({
  weight: z.number(),
  height: z.number(),
  bmi: z.number(),
  bodyFat: z.number(),
  muscleMass: z.number(),
  bodyWater: z.number(),
  metabolicAge: z.number(),
  leanBodyMass: z.number(),
  inorganicSalts: z.number(),
  smm: z.number(),
  bfp: z.number(),
});

export const noteInputSchema = z.object({
  value: z.string(),
});

export const zodIssuesToDetails = (
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
): Record<string, string> => {
  const details: Record<string, string> = {};
  issues.forEach((issue) => {
    const key = issue.path[0]?.toString() ?? "body";
    if (!details[key]) {
      details[key] = issue.message;
    }
  });
  return details;
};

export const parsePatientMetrics = (
  value: unknown,
):
  | { success: true; data: HealthMetrics }
  | { success: false; details: Record<string, string> } => {
  const parsed = patientMetricsInputSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      details: zodIssuesToDetails(parsed.error.issues),
    };
  }

  const metrics: HealthMetrics = {
    date: new Date().toISOString().slice(0, 10),
    ...parsed.data,
  };

  const rangeValidation = validatePatientMetrics(metrics);
  if (!rangeValidation.isValid) {
    return {
      success: false,
      details: rangeValidation.errors as Record<string, string>,
    };
  }

  return {
    success: true,
    data: metrics,
  };
};

export const parseNoteInput = (
  value: unknown,
):
  | { success: true; data: string }
  | { success: false; details: Record<string, string> } => {
  const parsed = noteInputSchema.safeParse(value);
  if (!parsed.success) {
    return {
      success: false,
      details: zodIssuesToDetails(parsed.error.issues),
    };
  }

  const noteValidation = validateDoctorNote(parsed.data.value);
  if (!noteValidation.isValid) {
    return {
      success: false,
      details: {
        value: noteValidation.error ?? "Invalid note.",
      },
    };
  }

  return {
    success: true,
    data: noteValidation.sanitized,
  };
};
