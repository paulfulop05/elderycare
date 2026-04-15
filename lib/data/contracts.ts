import type {
  Appointment,
  Doctor,
  HealthMetrics,
  Patient,
  UserRole,
} from "@/lib/domain";

export type AuthState = {
  loggedIn: boolean;
  role: UserRole;
};

export interface AuthRepository {
  getState: () => AuthState;
  setRole: (role: UserRole) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  clear: () => void;
}

export interface DoctorRepository {
  getAll: () => Doctor[];
  getById: (id: string) => Doctor | undefined;
  add: (doctor: Doctor) => Doctor;
  remove: (id: string) => void;
  nextId: () => string;
}

export interface PatientRepository {
  getAll: () => Patient[];
  getById: (id: string) => Patient | undefined;
  updateMetrics: (id: string, metrics: HealthMetrics) => Patient | undefined;
}

export interface AppointmentRepository {
  getAll: () => Appointment[];
  getByDoctorName: (doctorName: string) => Appointment[];
  updateStatus: (
    id: string,
    status: Appointment["status"],
  ) => Appointment | undefined;
  add: (appointment: Appointment) => Appointment;
  nextId: () => string;
  getAvailableSlots: () => string[];
}

export interface NoteRepository {
  getAllByPatientId: () => Record<string, string>;
  setByPatientId: (patientId: string, value: string) => void;
}

export interface MockDataRepository {
  regenerate: (seed?: number) => void;
  clear: () => void;
  resetToSeed: () => void;
}
