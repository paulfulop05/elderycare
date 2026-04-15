import type { HealthMetrics, Patient } from "@/lib/domain";
import { patientRepository } from "@/lib/data";

export const patientService = {
  list: (): Patient[] => patientRepository.getAll(),
  getById: (id: string): Patient | undefined => patientRepository.getById(id),
  updateMetrics: (id: string, metrics: HealthMetrics): Patient | undefined =>
    patientRepository.updateMetrics(id, metrics),
};
