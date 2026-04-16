import * as patientRepo from "@/lib/repositories/patientsRepository";
import { DoctorServiceError } from "@/lib/services/server/doctorManagementService";
import { isValidPhoneNumber, sanitizeText } from "@/lib/validation";

type PatientMetricsInput = {
  date?: unknown;
  weight?: unknown;
  height?: unknown;
  bmi?: unknown;
  bodyFat?: unknown;
  muscleMass?: unknown;
  bodyWater?: unknown;
  metabolicAge?: unknown;
  leanBodyMass?: unknown;
  inorganicSalts?: unknown;
  smm?: unknown;
  bfp?: unknown;
};

type ParsedMetrics = {
  metrics: {
    weight: number;
    height: number;
    BMI: number;
    bodyFat: number;
    muscleMass: number;
    bodyWater: number;
    metabolicAge: number;
    leanBodyMass: number;
    inorganicSalts: number;
    SMM: number;
    BFP: number;
  };
  metricDate: Date;
};

const toAvatar = (name: string): string =>
  name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

const parsePatientId = (rawId: string): number => {
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    throw new DoctorServiceError("Invalid patient id.", 400);
  }

  return id;
};

const normalizeDate = (date: Date | null): string => {
  if (!date) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const normalizeDateTime = (date: Date | null): string => {
  if (!date) {
    return new Date().toISOString();
  }

  return date.toISOString();
};

const buildHealthMetrics = (
  metrics: {
    weight: number;
    height: number;
    BMI: number;
    bodyFat: number;
    muscleMass: number;
    bodyWater: number;
    metabolicAge: number;
    leanBodyMass: number;
    inorganicSalts: number;
    SMM: number;
    BFP: number;
  } | null,
  date: string,
) => ({
  date,
  weight: metrics?.weight ?? 0,
  height: metrics?.height ?? 0,
  bmi: metrics?.BMI ?? 0,
  bodyFat: metrics?.bodyFat ?? 0,
  muscleMass: metrics?.muscleMass ?? 0,
  bodyWater: metrics?.bodyWater ?? 0,
  metabolicAge: metrics?.metabolicAge ?? 0,
  leanBodyMass: metrics?.leanBodyMass ?? 0,
  inorganicSalts: metrics?.inorganicSalts ?? 0,
  smm: metrics?.SMM ?? 0,
  bfp: metrics?.BFP ?? 0,
});

const mapPatient = (patient: {
  pid: number;
  name: string;
  phoneNumber: string;
  age: number;
  lastVisit: Date | null;
  doctorNote: string | null;
  appointments: { date: Date }[];
  healthMetricsHistory: {
    recordedAt: Date;
    weight: number;
    height: number;
    BMI: number;
    bodyFat: number;
    muscleMass: number;
    bodyWater: number;
    metabolicAge: number;
    leanBodyMass: number;
    inorganicSalts: number;
    SMM: number;
    BFP: number;
  }[];
  healthMetrics: {
    weight: number;
    height: number;
    BMI: number;
    bodyFat: number;
    muscleMass: number;
    bodyWater: number;
    metabolicAge: number;
    leanBodyMass: number;
    inorganicSalts: number;
    SMM: number;
    BFP: number;
  } | null;
}) => {
  const latestAppointmentDate =
    patient.appointments.length > 0
      ? patient.appointments[patient.appointments.length - 1].date
      : null;

  const fallbackDate = normalizeDate(
    latestAppointmentDate ?? patient.lastVisit,
  );
  const metrics = buildHealthMetrics(patient.healthMetrics, fallbackDate);

  const metricsHistory =
    patient.healthMetricsHistory.length > 0
      ? patient.healthMetricsHistory.map((entry) => ({
          date: normalizeDateTime(entry.recordedAt),
          weight: entry.weight,
          height: entry.height,
          bmi: entry.BMI,
          bodyFat: entry.bodyFat,
          muscleMass: entry.muscleMass,
          bodyWater: entry.bodyWater,
          metabolicAge: entry.metabolicAge,
          leanBodyMass: entry.leanBodyMass,
          inorganicSalts: entry.inorganicSalts,
          smm: entry.SMM,
          bfp: entry.BFP,
        }))
      : [metrics];

  return {
    id: String(patient.pid),
    name: patient.name,
    age: patient.age,
    email: "",
    phone: patient.phoneNumber,
    avatar: toAvatar(patient.name),
    lastVisit: fallbackDate,
    doctorNote: patient.doctorNote ?? "",
    hasMetricsData:
      patient.healthMetrics !== null || patient.healthMetricsHistory.length > 0,
    metrics,
    metricsHistory,
  };
};

const parseNumberMetric = (value: unknown, fieldName: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new DoctorServiceError(`${fieldName} is required.`, 400);
  }

  return parsed;
};

const parseMetrics = (raw: PatientMetricsInput): ParsedMetrics => {
  const metrics = {
    weight: parseNumberMetric(raw.weight, "weight"),
    height: parseNumberMetric(raw.height, "height"),
    BMI: parseNumberMetric(raw.bmi, "bmi"),
    bodyFat: parseNumberMetric(raw.bodyFat, "bodyFat"),
    muscleMass: parseNumberMetric(raw.muscleMass, "muscleMass"),
    bodyWater: parseNumberMetric(raw.bodyWater, "bodyWater"),
    metabolicAge: parseNumberMetric(raw.metabolicAge, "metabolicAge"),
    leanBodyMass: parseNumberMetric(raw.leanBodyMass, "leanBodyMass"),
    inorganicSalts: parseNumberMetric(raw.inorganicSalts, "inorganicSalts"),
    SMM: parseNumberMetric(raw.smm, "smm"),
    BFP: parseNumberMetric(raw.bfp, "bfp"),
  };

  const rawDate = typeof raw.date === "string" ? raw.date.trim() : "";
  let parsedDate = new Date(rawDate);

  if (
    rawDate &&
    Number.isNaN(parsedDate.getTime()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
  ) {
    parsedDate = new Date(`${rawDate}T00:00:00`);
  }

  const metricDate = Number.isNaN(parsedDate.getTime())
    ? new Date()
    : parsedDate;

  return {
    metrics,
    metricDate,
  };
};

const parsePatientAge = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 130) {
    throw new DoctorServiceError("Patient age must be between 0 and 130.", 400);
  }

  return Math.round(parsed);
};

export async function listPatients() {
  const patients = await patientRepo.getAllPatients();
  return patients.map(mapPatient);
}

export async function getPatientById(rawId: string) {
  const patientId = parsePatientId(rawId);
  const patient = await patientRepo.getPatientById(patientId);

  if (!patient) {
    throw new DoctorServiceError("Patient not found.", 404);
  }

  return mapPatient(patient);
}

export async function updatePatientMetrics(
  rawId: string,
  rawMetrics: PatientMetricsInput,
  rawAge?: unknown,
) {
  const patientId = parsePatientId(rawId);
  const { metrics, metricDate } = parseMetrics(rawMetrics);
  const age = rawAge === undefined ? undefined : parsePatientAge(rawAge);
  const patient = await patientRepo.upsertPatientMetrics(
    patientId,
    metrics,
    metricDate,
    age,
  );

  return mapPatient(patient);
}

export async function updatePatientAge(rawId: string, value: unknown) {
  const patientId = parsePatientId(rawId);
  const age = parsePatientAge(value);
  const patient = await patientRepo.updatePatientAge(patientId, age);

  return mapPatient(patient);
}

export async function updatePatientDoctorNote(rawId: string, value: unknown) {
  const patientId = parsePatientId(rawId);

  if (typeof value !== "string") {
    throw new DoctorServiceError("Doctor note must be a string.", 400);
  }

  const note = sanitizeText(value);
  if (note.length > 400) {
    throw new DoctorServiceError(
      "Doctor note must be at most 400 characters.",
      400,
    );
  }

  const patient = await patientRepo.updateDoctorNote(patientId, note);
  return mapPatient(patient);
}

export function validateSchedulePatientInput(name: string, phone: string) {
  const safeName = sanitizeText(name);
  const safePhone = sanitizeText(phone);

  if (!safeName || safeName.length < 2 || safeName.length > 80) {
    throw new DoctorServiceError("Patient name must be 2-80 characters.", 400);
  }

  if (!isValidPhoneNumber(safePhone)) {
    throw new DoctorServiceError("Enter a valid patient phone number.", 400);
  }

  return {
    name: safeName,
    phoneNumber: safePhone,
  };
}
