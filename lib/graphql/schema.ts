import { buildSchema } from "graphql";
import { doctorService } from "@/lib/services/doctorService";
import { patientService } from "@/lib/services/patientService";
import { appointmentService } from "@/lib/services/appointmentService";
import { noteService } from "@/lib/services/noteService";
import { mockDataService } from "@/lib/services/mockDataService";
import { paginate } from "@/lib/api/pagination";
import { deletePatientMetric } from "@/lib/api/handlers/patients";
import { fakeDataLoop } from "@/lib/server/fakeDataLoop";
import type { Appointment } from "@/lib/domain";

type PaginationArgs = {
  page?: number;
  pageSize?: number;
};

const normalizePagination = (args: PaginationArgs) => ({
  page: args.page ?? 1,
  pageSize: args.pageSize ?? 10,
});

export const appGraphqlSchema = buildSchema(`
  type PaginationMeta {
    page: Int!
    pageSize: Int!
    total: Int!
    totalPages: Int!
  }

  type Doctor {
    id: ID!
    name: String!
    age: Int!
    email: String!
    phone: String!
    avatar: String!
  }

  type HealthMetrics {
    date: String!
    weight: Float!
    height: Float!
    bmi: Float!
    bodyFat: Float!
    muscleMass: Float!
    bodyWater: Float!
    metabolicAge: Float!
    leanBodyMass: Float!
    inorganicSalts: Float!
    smm: Float!
    bfp: Float!
  }

  type Patient {
    id: ID!
    name: String!
    age: Int!
    email: String!
    phone: String!
    avatar: String!
    lastVisit: String!
    metrics: HealthMetrics!
    metricsHistory: [HealthMetrics!]!
  }

  type Appointment {
    id: ID!
    doctorName: String!
    patientName: String!
    date: String!
    time: String!
    status: String!
    reason: String!
  }

  type NoteEntry {
    patientId: ID!
    value: String!
  }

  type DoctorsPage {
    items: [Doctor!]!
    pagination: PaginationMeta!
  }

  type PatientsPage {
    items: [Patient!]!
    pagination: PaginationMeta!
  }

  type AppointmentsPage {
    items: [Appointment!]!
    pagination: PaginationMeta!
  }

  input DoctorInput {
    name: String!
    age: Int!
    email: String!
    phone: String!
  }

  input AppointmentInput {
    doctorName: String!
    patientName: String!
    date: String!
    time: String!
    reason: String!
  }

  input HealthMetricsInput {
    weight: Float!
    height: Float!
    bmi: Float!
    bodyFat: Float!
    muscleMass: Float!
    bodyWater: Float!
    metabolicAge: Float!
    leanBodyMass: Float!
    inorganicSalts: Float!
    smm: Float!
    bfp: Float!
  }

  type DoctorStats {
    appointmentCount: Int!
    cancelledCount: Int!
    upcomingCount: Int!
  }

  type PatientStats {
    appointmentCount: Int!
    cancelledCount: Int!
    latestBmi: Float!
    metricsEntries: Int!
  }

  type Query {
    doctors(page: Int, pageSize: Int): DoctorsPage!
    patients(page: Int, pageSize: Int, search: String): PatientsPage!
    appointments(page: Int, pageSize: Int): AppointmentsPage!
    patientNote(patientId: ID!): String!
    notes: [NoteEntry!]!
    doctorStats(id: ID!): DoctorStats!
    patientStats(id: ID!): PatientStats!
  }

  type Mutation {
    createDoctor(input: DoctorInput!): Doctor!
    deleteDoctor(id: ID!): Boolean!
    scheduleAppointment(input: AppointmentInput!): Appointment!
    cancelAppointment(id: ID!): Appointment
    finishAppointment(id: ID!): Appointment
    updatePatientMetrics(id: ID!, metrics: HealthMetricsInput!): Patient
    deletePatientMetric(id: ID!, date: String!): Patient
    setPatientNote(patientId: ID!, value: String!): String!
    startMockGeneration(batchSize: Int, intervalMs: Int): Boolean!
    stopMockGeneration: Boolean!
    generateMockBatch(batchSize: Int): Boolean!
    clearMockData: Boolean!
  }
`);

export const appGraphqlRoot = {
  doctors: ({ page, pageSize }: PaginationArgs) => {
    const data = paginate(
      doctorService.list(),
      normalizePagination({ page, pageSize }),
    );
    return { items: data.data, pagination: data.pagination };
  },
  patients: async ({
    page,
    pageSize,
    search,
  }: PaginationArgs & { search?: string }) => {
    const norm = normalizePagination({ page, pageSize });

    let filtered = search
      ? patientService
          .list()
          .filter((patient) =>
            patient.name.toLowerCase().includes(search.toLowerCase()),
          )
      : patientService.list();

    const startIndex = (norm.page - 1) * norm.pageSize;
    const endIndex = startIndex + norm.pageSize;

    // If client requests a page beyond available items, generate more on-demand.
    // Limit attempts to avoid runaway generation.
    let attempts = 0;
    const maxAttempts = 6;
    while (filtered.length < endIndex && attempts < maxAttempts) {
      // create at least one page worth of patients (or 6 as a minimum chunk)
      await fakeDataLoop.runBatch(Math.max(norm.pageSize, 6));

      filtered = search
        ? patientService
            .list()
            .filter((patient) =>
              patient.name.toLowerCase().includes(search.toLowerCase()),
            )
        : patientService.list();

      attempts += 1;
    }

    const data = paginate(filtered, norm);
    return { items: data.data, pagination: data.pagination };
  },
  appointments: ({ page, pageSize }: PaginationArgs) => {
    const data = paginate(
      appointmentService.list(),
      normalizePagination({ page, pageSize }),
    );
    return { items: data.data, pagination: data.pagination };
  },
  patientNote: ({ patientId }: { patientId: string }) =>
    noteService.getAllByPatientId()[patientId] ?? "",
  notes: () =>
    Object.entries(noteService.getAllByPatientId()).map(
      ([patientId, value]) => ({
        patientId,
        value,
      }),
    ),
  doctorStats: ({ id }: { id: string }) => {
    const doctor = doctorService.getById(id);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const doctorAppointments = appointmentService
      .list()
      .filter(
        (appointment: Appointment) => appointment.doctorName === doctor.name,
      );

    return {
      appointmentCount: doctorAppointments.length,
      cancelledCount: doctorAppointments.filter(
        (item: Appointment) => item.status === "cancelled",
      ).length,
      upcomingCount: doctorAppointments.filter(
        (item: Appointment) => item.status === "upcoming",
      ).length,
    };
  },
  patientStats: ({ id }: { id: string }) => {
    const patient = patientService.getById(id);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const patientAppointments = appointmentService
      .list()
      .filter(
        (appointment: Appointment) => appointment.patientName === patient.name,
      );

    return {
      appointmentCount: patientAppointments.length,
      cancelledCount: patientAppointments.filter(
        (item: Appointment) => item.status === "cancelled",
      ).length,
      latestBmi: patient.metrics.bmi,
      metricsEntries: patient.metricsHistory.length,
    };
  },
  createDoctor: ({
    input,
  }: {
    input: Parameters<typeof doctorService.add>[0];
  }) => doctorService.add(input),
  deleteDoctor: ({ id }: { id: string }) => {
    const found = doctorService.getById(id);
    if (!found) {
      return false;
    }

    doctorService.remove(id);
    return true;
  },
  scheduleAppointment: ({
    input,
  }: {
    input: Parameters<typeof appointmentService.schedule>[0];
  }) => appointmentService.schedule(input),
  cancelAppointment: ({ id }: { id: string }) => appointmentService.cancel(id),
  finishAppointment: ({ id }: { id: string }) => appointmentService.finish(id),
  updatePatientMetrics: ({
    id,
    metrics,
  }: {
    id: string;
    metrics: Omit<Parameters<typeof patientService.updateMetrics>[1], "date">;
  }) =>
    patientService.updateMetrics(id, {
      ...metrics,
      date: new Date().toISOString().slice(0, 10),
    }),
  deletePatientMetric: ({ id, date }: { id: string; date: string }) => {
    const result = deletePatientMetric(id, date);
    return result.body && "data" in result.body ? result.body.data : null;
  },
  setPatientNote: ({
    patientId,
    value,
  }: {
    patientId: string;
    value: string;
  }) => {
    noteService.setByPatientId(patientId, value);
    return value;
  },
  startMockGeneration: ({
    batchSize,
    intervalMs,
  }: {
    batchSize?: number;
    intervalMs?: number;
  }) => {
    fakeDataLoop.start(batchSize ?? 3, intervalMs ?? 3000);
    return true;
  },
  stopMockGeneration: () => {
    fakeDataLoop.stop();
    return true;
  },
  generateMockBatch: ({ batchSize }: { batchSize?: number }) => {
    void fakeDataLoop.runBatch(batchSize ?? 3);
    return true;
  },
  clearMockData: () => {
    mockDataService.clear();
    return true;
  },
};
