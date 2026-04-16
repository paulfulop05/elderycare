import * as appointmentRepo from "@/lib/repositories/appointmentsRepository";
import { DoctorServiceError } from "@/lib/services/server/doctorManagementService";
import { validateSchedulePatientInput } from "@/lib/services/server/patientManagementService";
import { sanitizeText } from "@/lib/validation";

const AVAILABLE_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

type ScheduleAppointmentInput = {
  doctorId?: unknown;
  doctorName?: unknown;
  patientName?: unknown;
  patientPhone?: unknown;
  date?: unknown;
  time?: unknown;
  reason?: unknown;
};

const parseAppointmentId = (rawId: string): number => {
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    throw new DoctorServiceError("Invalid appointment id.", 400);
  }

  return id;
};

const toStatus = (value: string): "upcoming" | "completed" => {
  const normalized = value.toLowerCase();
  if (normalized === "completed" || normalized === "past") {
    return "completed";
  }

  if (normalized === "upcoming" || normalized === "pending") {
    return "upcoming";
  }

  return "upcoming";
};

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const formatTime = (date: Date): string => date.toTimeString().slice(0, 5);

const mapAppointment = (appointment: {
  aid: number;
  date: Date;
  reason: string;
  status: string;
  doctorId: number;
  patientId: number;
  doctor: { name: string };
  patient: { name: string };
}) => ({
  id: String(appointment.aid),
  doctorId: String(appointment.doctorId),
  patientId: String(appointment.patientId),
  doctorName: appointment.doctor.name,
  patientName: appointment.patient.name,
  date: formatDate(appointment.date),
  time: formatTime(appointment.date),
  status: toStatus(appointment.status),
  reason: appointment.reason,
});

const parseDateTime = (date: string, time: string): Date => {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new DoctorServiceError("Invalid appointment date or time.", 400);
  }

  return parsed;
};

export async function listAppointments() {
  await appointmentRepo.purgeCancelledAppointments();
  await appointmentRepo.normalizeAppointmentStatuses();
  const appointments = await appointmentRepo.getAllAppointments();
  return appointments.map(mapAppointment);
}

export async function updateAppointmentStatus(
  rawId: string,
  status: "completed",
) {
  const appointmentId = parseAppointmentId(rawId);
  const existing = await appointmentRepo.getAppointmentById(appointmentId);

  if (!existing) {
    throw new DoctorServiceError("Appointment not found.", 404);
  }

  const updated = await appointmentRepo.updateAppointmentStatus(
    appointmentId,
    status,
  );
  return mapAppointment(updated);
}

export async function deleteAppointment(rawId: string) {
  const appointmentId = parseAppointmentId(rawId);
  const existing = await appointmentRepo.getAppointmentById(appointmentId);

  if (!existing) {
    throw new DoctorServiceError("Appointment not found.", 404);
  }

  await appointmentRepo.deleteAppointmentById(appointmentId);
}

export async function scheduleAppointment(input: ScheduleAppointmentInput) {
  const rawDoctorId = Number(input.doctorId);
  const parsedDoctorId =
    Number.isFinite(rawDoctorId) && rawDoctorId > 0 ? rawDoctorId : undefined;

  if (!parsedDoctorId && typeof input.doctorName !== "string") {
    throw new DoctorServiceError("Doctor name is required.", 400);
  }

  if (typeof input.date !== "string" || typeof input.time !== "string") {
    throw new DoctorServiceError(
      "Appointment date and time are required.",
      400,
    );
  }

  if (typeof input.reason !== "string") {
    throw new DoctorServiceError("Appointment reason is required.", 400);
  }

  const doctorName = sanitizeText(String(input.doctorName ?? ""));
  const reason = sanitizeText(input.reason);
  const patient = validateSchedulePatientInput(
    String(input.patientName ?? ""),
    String(input.patientPhone ?? ""),
  );

  if (!reason || reason.length < 3 || reason.length > 120) {
    throw new DoctorServiceError("Reason must be 3-120 characters.", 400);
  }

  if (!AVAILABLE_SLOTS.includes(input.time)) {
    throw new DoctorServiceError("Selected time is not available.", 400);
  }

  const doctor = parsedDoctorId
    ? await appointmentRepo.getDoctorById(parsedDoctorId)
    : await appointmentRepo.getDoctorByName(doctorName);
  if (!doctor) {
    throw new DoctorServiceError("Doctor not found.", 404);
  }

  const dateTime = parseDateTime(input.date, input.time);

  let patientRecord = await appointmentRepo.getPatientByNameAndPhone(
    patient.name,
    patient.phoneNumber,
  );

  if (!patientRecord) {
    patientRecord = await appointmentRepo.createPatient({
      name: patient.name,
      phoneNumber: patient.phoneNumber,
      age: 65,
    });
  }

  const created = await appointmentRepo.createAppointment({
    date: dateTime,
    reason,
    status: "upcoming",
    doctorId: doctor.did,
    patientId: patientRecord.pid,
  });

  return mapAppointment(created);
}

export function listAvailableSlots() {
  return [...AVAILABLE_SLOTS];
}
