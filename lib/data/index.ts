export type {
  AppointmentRepository,
  AuthRepository,
  AuthState,
  DoctorRepository,
  MockDataRepository,
  NoteRepository,
  PatientRepository,
} from "./contracts";
export {
  appointmentRepository,
  authRepository,
  doctorRepository,
  mockDataRepository,
  noteRepository,
  patientRepository,
} from "@/lib/repositories/inMemoryRepository";
