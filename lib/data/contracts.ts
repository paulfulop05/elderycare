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
  replaceAll: (doctors: Doctor[]) => void;
}

export interface PatientRepository {
  getAll: () => Patient[];
  getById: (id: string) => Patient | undefined;
  add: (patient: Patient) => Patient;
  updateMetrics: (id: string, metrics: HealthMetrics) => Patient | undefined;
  nextId: () => string;
  replaceAll: (patients: Patient[]) => void;
  removeMetricByDate: (id: string, date: string) => Patient | undefined;
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
  replaceAll: (appointments: Appointment[]) => void;
}

export interface NoteRepository {
  getAllByPatientId: () => Record<string, string>;
  setByPatientId: (patientId: string, value: string) => void;
  replaceAll: (notesByPatientId: Record<string, string>) => void;
}

export interface MockDataRepository {
  regenerate: (seed?: number) => void;
  clear: () => void;
  resetToSeed: () => void;
}
