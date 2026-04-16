import type { UserRole } from "@/lib/domain";
import * as doctorRepo from "@/lib/repositories/doctorsRepository";
import { isValidPhoneNumber, sanitizeText } from "@/lib/validation";

type CreateDoctorInput = {
  name?: unknown;
  age?: unknown;
  email?: unknown;
  phoneNumber?: unknown;
  password?: unknown;
  role?: unknown;
};

type LoginDoctorInput = {
  email?: unknown;
  password?: unknown;
  role?: unknown;
};

type UpdateDoctorProfileInput = {
  did?: unknown;
  name?: unknown;
  age?: unknown;
  email?: unknown;
  phoneNumber?: unknown;
};

type UpdateDoctorPasswordInput = {
  did?: unknown;
  currentPassword?: unknown;
  newPassword?: unknown;
};

export class DoctorServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "DoctorServiceError";
    this.statusCode = statusCode;
  }
}

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = sanitizeText(value);
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseDoctorId = (rawId: string): number => {
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new DoctorServiceError("Invalid doctor id.", 400);
  }

  return parsed;
};

const parseCreateDoctorInput = (input: CreateDoctorInput) => {
  const name = asNonEmptyString(input.name);
  const email = asNonEmptyString(input.email)?.toLowerCase();
  const phoneNumber = asNonEmptyString(input.phoneNumber);
  const password = typeof input.password === "string" ? input.password : "";
  const age = Number(input.age);
  const role = Boolean(input.role);

  if (!name || !email || !phoneNumber || !password || !Number.isFinite(age)) {
    throw new DoctorServiceError("Missing required doctor fields.", 400);
  }

  if (name.length < 2 || name.length > 80) {
    throw new DoctorServiceError("Doctor name must be 2-80 characters.", 400);
  }

  if (age < 24 || age > 90) {
    throw new DoctorServiceError("Age must be between 24 and 90.", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new DoctorServiceError("Enter a valid email address.", 400);
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    throw new DoctorServiceError("Enter a valid phone number.", 400);
  }

  if (password.length < 6 || password.length > 72) {
    throw new DoctorServiceError(
      "Password must be between 6 and 72 characters.",
      400,
    );
  }

  return {
    name,
    age,
    email,
    phoneNumber,
    password,
    role,
  };
};

const parseLoginDoctorInput = (input: LoginDoctorInput) => {
  const email = asNonEmptyString(input.email)?.toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const role =
    input.role === "admin"
      ? "admin"
      : input.role === "doctor"
        ? "doctor"
        : undefined;

  if (!email || !password || !role) {
    throw new DoctorServiceError("Missing login credentials.", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new DoctorServiceError("Enter a valid email address.", 400);
  }

  return {
    email,
    password,
    role,
  };
};

export async function listDoctors() {
  return doctorRepo.getAll();
}

export async function getDoctorById(rawId: string) {
  const doctorId = parseDoctorId(rawId);
  const doctor = await doctorRepo.findDoctorById(doctorId);

  if (!doctor) {
    throw new DoctorServiceError("Doctor not found.", 404);
  }

  return doctor;
}

export async function createDoctor(rawInput: CreateDoctorInput) {
  const input = parseCreateDoctorInput(rawInput);
  const existing = await doctorRepo.findDoctorByEmail(input.email);

  if (existing) {
    throw new DoctorServiceError(
      "An account with this email already exists.",
      409,
    );
  }

  // TODO: replace with hashed password before production use.
  return doctorRepo.registerDoctor(
    input.age,
    input.name,
    input.phoneNumber,
    input.role,
    input.email,
    input.password,
  );
}

export async function deleteDoctor(rawId: string) {
  const doctorId = parseDoctorId(rawId);

  await doctorRepo.removeAppointmentsByDoctorId(doctorId);
  const deleted = await doctorRepo.removeDoctorById(doctorId);

  if (deleted.count === 0) {
    throw new DoctorServiceError("Doctor not found.", 404);
  }
}

export async function authenticateDoctorLogin(rawInput: LoginDoctorInput) {
  const input = parseLoginDoctorInput(rawInput);
  const doctor = await doctorRepo.findDoctorByEmail(input.email);

  if (!doctor || doctor.password !== input.password) {
    throw new DoctorServiceError("Invalid email or password.", 401);
  }

  const accountRole: UserRole = doctor.role ? "admin" : "doctor";
  if (accountRole !== input.role) {
    throw new DoctorServiceError(
      "This account does not have access to the selected role.",
      403,
    );
  }

  return {
    did: doctor.did,
    name: doctor.name,
    email: doctor.email,
    role: accountRole,
  };
}

export async function updateDoctorProfile(rawInput: UpdateDoctorProfileInput) {
  const rawDid = String(rawInput.did ?? "");
  const did = parseDoctorId(rawDid);
  const name = asNonEmptyString(rawInput.name);
  const age = Number(rawInput.age);
  const email = asNonEmptyString(rawInput.email)?.toLowerCase();
  const phoneNumber = asNonEmptyString(rawInput.phoneNumber);

  if (!name || !email || !phoneNumber || !Number.isFinite(age)) {
    throw new DoctorServiceError("Missing required profile fields.", 400);
  }

  if (name.length < 2 || name.length > 80) {
    throw new DoctorServiceError("Doctor name must be 2-80 characters.", 400);
  }

  if (age < 24 || age > 90) {
    throw new DoctorServiceError("Age must be between 24 and 90.", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new DoctorServiceError("Enter a valid email address.", 400);
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    throw new DoctorServiceError("Enter a valid phone number.", 400);
  }

  const existing = await doctorRepo.findDoctorById(did);
  if (!existing) {
    throw new DoctorServiceError("Doctor not found.", 404);
  }

  const existingByEmail = await doctorRepo.findDoctorByEmail(email);
  if (existingByEmail && existingByEmail.did !== did) {
    throw new DoctorServiceError(
      "An account with this email already exists.",
      409,
    );
  }

  const updated = await doctorRepo.updateDoctorProfile(did, {
    name,
    age,
    email,
    phoneNumber,
  });

  return {
    did: updated.did,
    name: updated.name,
    age: updated.age,
    email: updated.email,
    phoneNumber: updated.phoneNumber,
    role: updated.role ? "admin" : "doctor",
  } as const;
}

export async function updateDoctorPassword(
  rawInput: UpdateDoctorPasswordInput,
) {
  const rawDid = String(rawInput.did ?? "");
  const did = parseDoctorId(rawDid);
  const currentPassword =
    typeof rawInput.currentPassword === "string"
      ? rawInput.currentPassword
      : "";
  const newPassword =
    typeof rawInput.newPassword === "string" ? rawInput.newPassword : "";

  if (!currentPassword || !newPassword) {
    throw new DoctorServiceError("Both password fields are required.", 400);
  }

  if (newPassword.length < 6 || newPassword.length > 72) {
    throw new DoctorServiceError(
      "Password must be between 6 and 72 characters.",
      400,
    );
  }

  const existing = await doctorRepo.findDoctorById(did);
  if (!existing) {
    throw new DoctorServiceError("Doctor not found.", 404);
  }

  if (existing.password !== currentPassword) {
    throw new DoctorServiceError("Current password is incorrect.", 401);
  }

  await doctorRepo.updateDoctorPassword(did, newPassword);
}
