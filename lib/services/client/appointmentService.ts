import type { Appointment } from "@/lib/domain";

type AppointmentsListener = () => void;

const appointmentListeners = new Set<AppointmentsListener>();
let cachedAppointments: Appointment[] = [];
let cachedAvailableSlots: string[] = [];
let hasLoaded = false;

const notifyAppointmentsChanged = (): void => {
  appointmentListeners.forEach((listener) => {
    listener();
  });
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // ignore response parse errors
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

const refreshFromApi = async (): Promise<void> => {
  const data = await parseResponse<{
    appointments: Appointment[];
    availableSlots: string[];
  }>(await fetch("/api/appointments", { cache: "no-store" }));

  cachedAppointments = data.appointments;
  cachedAvailableSlots = data.availableSlots;
  hasLoaded = true;
  notifyAppointmentsChanged();
};

type NewAppointmentInput = {
  doctorId?: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
};

export const appointmentService = {
  list: (): Appointment[] => {
    if (!hasLoaded) {
      void refreshFromApi();
    }

    return cachedAppointments;
  },
  listByDoctorName: (doctorName: string): Appointment[] =>
    cachedAppointments.filter(
      (appointment) => appointment.doctorName === doctorName,
    ),
  listByDoctorId: (doctorId: string): Appointment[] =>
    cachedAppointments.filter(
      (appointment) => appointment.doctorId === doctorId,
    ),
  cancel: async (id: string): Promise<void> => {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "DELETE",
    });

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      await parseResponse<{ ok: true }>(response);
    }

    await refreshFromApi();
  },
  finish: async (id: string): Promise<Appointment | undefined> => {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "completed" }),
    });

    if (response.status === 404) {
      return undefined;
    }

    const updated = await parseResponse<Appointment>(response);
    await refreshFromApi();
    return updated;
  },
  schedule: async (input: NewAppointmentInput): Promise<Appointment> => {
    const created = await parseResponse<Appointment>(
      await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }),
    );

    await refreshFromApi();
    return created;
  },
  subscribe: (listener: AppointmentsListener): (() => void) => {
    appointmentListeners.add(listener);
    if (!hasLoaded) {
      void refreshFromApi();
    }

    return () => {
      appointmentListeners.delete(listener);
    };
  },
  getAvailableSlots: (): string[] => {
    if (!hasLoaded) {
      void refreshFromApi();
    }

    return cachedAvailableSlots;
  },
  refresh: async (): Promise<void> => {
    await refreshFromApi();
  },
};
