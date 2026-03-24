import type { Appointment } from "@/lib/mockData";
import { appointmentRepository } from "@/lib/repositories/inMemoryRepository";

type AppointmentsListener = () => void;

const appointmentListeners = new Set<AppointmentsListener>();

const notifyAppointmentsChanged = (): void => {
  appointmentListeners.forEach((listener) => {
    listener();
  });
};

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
    }
    return updated;
  },
  finish: (id: string): Appointment | undefined => {
    const updated = appointmentRepository.updateStatus(id, "past");
    if (updated) {
      notifyAppointmentsChanged();
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
    return created;
  },
  subscribe: (listener: AppointmentsListener): (() => void) => {
    appointmentListeners.add(listener);
    return () => {
      appointmentListeners.delete(listener);
    };
  },
  getAvailableSlots: (): string[] => appointmentRepository.getAvailableSlots(),
};
