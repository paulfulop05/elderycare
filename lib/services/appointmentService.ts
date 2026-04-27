import type { Appointment } from "@/lib/domain";
import { appointmentRepository } from "@/lib/data";
import { enqueueOfflineMutation } from "@/lib/client/offlineSync";

const scheduleAppointmentMutation = `
  mutation ScheduleAppointment($input: AppointmentInput!) {
    scheduleAppointment(input: $input) {
      id
    }
  }
`;

const cancelAppointmentMutation = `
  mutation CancelAppointment($id: ID!) {
    cancelAppointment(id: $id) {
      id
    }
  }
`;

const finishAppointmentMutation = `
  mutation FinishAppointment($id: ID!) {
    finishAppointment(id: $id) {
      id
    }
  }
`;

type AppointmentsListener = () => void;

const appointmentListeners = new Set<AppointmentsListener>();

const notifyAppointmentsChanged = (): void => {
  appointmentListeners.forEach((listener) => {
    listener();
  });
};

const isBrowser = (): boolean => typeof window !== "undefined";

type NewAppointmentInput = {
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
};

export const appointmentService = {
  list: (): Appointment[] => appointmentRepository.getAll(),
  listByDoctorName: (doctorName: string): Appointment[] =>
    appointmentRepository.getByDoctorName(doctorName),
  cancel: (id: string): Appointment | undefined => {
    const updated = appointmentRepository.updateStatus(id, "cancelled");
    if (updated) {
      notifyAppointmentsChanged();

      if (isBrowser()) {
        void enqueueOfflineMutation(cancelAppointmentMutation, { id });
      }
    }

    return updated;
  },
  finish: (id: string): Appointment | undefined => {
    const updated = appointmentRepository.updateStatus(id, "past");
    if (updated) {
      notifyAppointmentsChanged();

      if (isBrowser()) {
        void enqueueOfflineMutation(finishAppointmentMutation, { id });
      }
    }

    return updated;
  },
  schedule: (input: NewAppointmentInput): Appointment => {
    const created = appointmentRepository.add({
      id: appointmentRepository.nextId(),
      doctorName: input.doctorName,
      patientName: input.patientName,
      date: input.date,
      time: input.time,
      status: "upcoming",
      reason: input.reason,
    });
    notifyAppointmentsChanged();

    if (isBrowser()) {
      void enqueueOfflineMutation(scheduleAppointmentMutation, { input });
    }

    return created;
  },
  subscribe: (listener: AppointmentsListener): (() => void) => {
    appointmentListeners.add(listener);
    return () => {
      appointmentListeners.delete(listener);
    };
  },
  getAvailableSlots: (): string[] => appointmentRepository.getAvailableSlots(),
  replaceAll: (appointments: Appointment[]): void => {
    appointmentRepository.replaceAll(appointments);
    notifyAppointmentsChanged();
  },
};
