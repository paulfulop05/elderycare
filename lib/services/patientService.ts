import type { HealthMetrics, Patient } from "@/lib/domain";
import { patientRepository } from "@/lib/data";
import { enqueueOfflineMutation } from "@/lib/client/offlineSync";

const updatePatientMetricsMutation = `
  mutation UpdatePatientMetrics($id: ID!, $metrics: HealthMetricsInput!) {
    updatePatientMetrics(id: $id, metrics: $metrics) {
      id
    }
  }
`;

const deletePatientMetricMutation = `
  mutation DeletePatientMetric($id: ID!, $date: String!) {
    deletePatientMetric(id: $id, date: $date) {
      id
    }
  }
`;

type PatientsListener = () => void;

const patientListeners = new Set<PatientsListener>();

const notifyPatientsChanged = (): void => {
  patientListeners.forEach((listener) => {
    listener();
  });
};

const isBrowser = (): boolean => typeof window !== "undefined";

export const patientService = {
  list: (): Patient[] => patientRepository.getAll(),
  getById: (id: string): Patient | undefined => patientRepository.getById(id),
  updateMetrics: (id: string, metrics: HealthMetrics): Patient | undefined => {
    const updated = patientRepository.updateMetrics(id, metrics);
    if (updated) {
      notifyPatientsChanged();
    }

    if (updated && isBrowser()) {
      void enqueueOfflineMutation(updatePatientMetricsMutation, {
        id,
        metrics,
      });
    }

    return updated;
  },
  removeMetricByDate: (id: string, date: string): Patient | undefined => {
    const updated = patientRepository.removeMetricByDate(id, date);
    if (updated) {
      notifyPatientsChanged();
    }

    if (updated && isBrowser()) {
      void enqueueOfflineMutation(deletePatientMetricMutation, { id, date });
    }

    return updated;
  },
  replaceAll: (patients: Patient[]): void => {
    patientRepository.replaceAll(patients);
    notifyPatientsChanged();
  },
  subscribe: (listener: PatientsListener): (() => void) => {
    patientListeners.add(listener);
    return () => {
      patientListeners.delete(listener);
    };
  },
};
