import {
  appointments as seedAppointments,
  availableSlots as seedAvailableSlots,
  doctors as seedDoctors,
  patients as seedPatients,
  type Appointment,
  type Doctor,
  type HealthMetrics,
  type Patient,
  type UserRole,
} from "@/lib/mockData";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

type AuthState = {
  loggedIn: boolean;
  role: UserRole;
};

const store: {
  auth: AuthState;
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  notesByPatientId: Record<string, string>;
  availableSlots: string[];
} = {
  auth: {
    loggedIn: false,
    role: "doctor",
  },
  doctors: clone(seedDoctors),
  patients: clone(seedPatients),
  appointments: clone(seedAppointments),
  notesByPatientId: {},
  availableSlots: clone(seedAvailableSlots),
};

export const authRepository = {
  getState: (): AuthState => ({ ...store.auth }),
  setRole: (role: UserRole): void => {
    store.auth.role = role;
  },
  setLoggedIn: (loggedIn: boolean): void => {
    store.auth.loggedIn = loggedIn;
  },
  clear: (): void => {
    store.auth.loggedIn = false;
    store.auth.role = "doctor";
  },
};

export const doctorRepository = {
  getAll: (): Doctor[] => clone(store.doctors),
  getById: (id: string): Doctor | undefined =>
    clone(store.doctors.find((doctor) => doctor.id === id)),
  add: (doctor: Doctor): Doctor => {
    store.doctors.push(clone(doctor));
    return clone(doctor);
  },
  remove: (id: string): void => {
    store.doctors = store.doctors.filter((doctor) => doctor.id !== id);
  },
  nextId: (): string => String(store.doctors.length + 1),
};

export const patientRepository = {
  getAll: (): Patient[] => clone(store.patients),
  getById: (id: string): Patient | undefined =>
    clone(store.patients.find((patient) => patient.id === id)),
  updateMetrics: (id: string, metrics: HealthMetrics): Patient | undefined => {
    const patientIndex = store.patients.findIndex(
      (patient) => patient.id === id,
    );
    if (patientIndex < 0) {
      return undefined;
    }

    const updatedMetric = {
      ...metrics,
      date: new Date().toISOString().slice(0, 10),
    };

    const current = store.patients[patientIndex];
    const updatedPatient: Patient = {
      ...current,
      metrics: clone(updatedMetric),
      lastVisit: updatedMetric.date,
      metricsHistory: [...current.metricsHistory, clone(updatedMetric)],
    };

    store.patients[patientIndex] = updatedPatient;
    return clone(updatedPatient);
  },
};

export const appointmentRepository = {
  getAll: (): Appointment[] => clone(store.appointments),
  getByDoctorName: (doctorName: string): Appointment[] =>
    clone(
      store.appointments.filter(
        (appointment) => appointment.doctorName === doctorName,
      ),
    ),
  updateStatus: (
    id: string,
    status: Appointment["status"],
  ): Appointment | undefined => {
    const appointmentIndex = store.appointments.findIndex(
      (appointment) => appointment.id === id,
    );

    if (appointmentIndex < 0) {
      return undefined;
    }

    store.appointments[appointmentIndex] = {
      ...store.appointments[appointmentIndex],
      status,
    };

    return clone(store.appointments[appointmentIndex]);
  },
  add: (appointment: Appointment): Appointment => {
    store.appointments.push(clone(appointment));
    return clone(appointment);
  },
  nextId: (): string => String(store.appointments.length + 1),
  getAvailableSlots: (): string[] => clone(store.availableSlots),
};

export const noteRepository = {
  getAllByPatientId: (): Record<string, string> => ({
    ...store.notesByPatientId,
  }),
  setByPatientId: (patientId: string, value: string): void => {
    store.notesByPatientId[patientId] = value;
  },
};
