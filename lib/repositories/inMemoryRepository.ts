import type {
  Appointment,
  Doctor,
  HealthMetrics,
  Patient,
  UserRole,
} from "@/lib/domain";
import {
  seedAppointments,
  seedAvailableSlots,
  seedDoctors,
  seedPatients,
} from "@/lib/data/mock/seed";
import type { AuthState } from "@/lib/data/contracts";

const clone = <T>(value: T): T => {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

const pseudoRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const generateInMemoryAppointments = (
  count: number,
  doctors: Doctor[],
  patients: Patient[],
  seed: number,
): Appointment[] => {
  const random = pseudoRandom(seed);
  const reasons = [
    "Routine checkup",
    "Medication review",
    "Blood pressure follow-up",
    "Mobility assessment",
    "Nutrition consultation",
  ];
  const slots = seedAvailableSlots;

  return Array.from({ length: count }, (_, index) => {
    const doctor = doctors[Math.floor(random() * doctors.length)];
    const patient = patients[Math.floor(random() * patients.length)];
    const daysOffset = Math.floor(random() * 90) - 45;
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const isoDate = date.toISOString().slice(0, 10);
    const status: Appointment["status"] = daysOffset < 0 ? "past" : "upcoming";

    return {
      id: String(index + 1),
      doctorName: doctor.name,
      patientName: patient.name,
      date: isoDate,
      time: slots[Math.floor(random() * slots.length)],
      status,
      reason: reasons[Math.floor(random() * reasons.length)],
    };
  });
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
  replaceAll: (doctors: Doctor[]): void => {
    store.doctors = clone(doctors);
  },
};

export const patientRepository = {
  getAll: (): Patient[] => clone(store.patients),
  getById: (id: string): Patient | undefined =>
    clone(store.patients.find((patient) => patient.id === id)),
  add: (patient: Patient): Patient => {
    store.patients.push(clone(patient));
    return clone(patient);
  },
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
  nextId: (): string => String(store.patients.length + 1),
  replaceAll: (patients: Patient[]): void => {
    store.patients = clone(patients);
  },
  removeMetricByDate: (id: string, date: string): Patient | undefined => {
    const patientIndex = store.patients.findIndex(
      (patient) => patient.id === id,
    );
    if (patientIndex < 0) {
      return undefined;
    }

    const current = store.patients[patientIndex];
    const nextHistory = current.metricsHistory.filter(
      (metric) => metric.date !== date,
    );
    if (nextHistory.length === current.metricsHistory.length) {
      return clone(current);
    }

    const lastMetric = nextHistory[nextHistory.length - 1] ?? current.metrics;
    const updatedPatient: Patient = {
      ...current,
      metricsHistory: clone(nextHistory),
      metrics: clone(lastMetric),
      lastVisit: lastMetric.date,
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
  replaceAll: (appointments: Appointment[]): void => {
    store.appointments = clone(appointments);
  },
};

export const noteRepository = {
  getAllByPatientId: (): Record<string, string> => ({
    ...store.notesByPatientId,
  }),
  setByPatientId: (patientId: string, value: string): void => {
    store.notesByPatientId[patientId] = value;
  },
  replaceAll: (notesByPatientId: Record<string, string>): void => {
    store.notesByPatientId = { ...notesByPatientId };
  },
};

export const mockDataRepository = {
  regenerate: (seed?: number): void => {
    const activeSeed = seed ?? Date.now();
    store.appointments = clone(
      generateInMemoryAppointments(
        40,
        store.doctors,
        store.patients,
        activeSeed,
      ),
    );
    store.notesByPatientId = {};
  },
  clear: (): void => {
    store.appointments = [];
    store.availableSlots = [];
    store.notesByPatientId = {};
  },
  resetToSeed: (): void => {
    store.doctors = clone(seedDoctors);
    store.patients = clone(seedPatients);
    store.appointments = clone(seedAppointments);
    store.availableSlots = clone(seedAvailableSlots);
    store.notesByPatientId = {};
  },
};
