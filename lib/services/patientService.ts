import type { HealthMetrics, Patient } from "@/lib/mockData";
import { patientRepository } from "@/lib/repositories/inMemoryRepository";

export const patientService = {
  list: (): Patient[] => patientRepository.getAll(),
  getById: (id: string): Patient | undefined => patientRepository.getById(id),
  updateMetrics: (id: string, metrics: HealthMetrics): Patient | undefined =>
    patientRepository.updateMetrics(id, metrics),
};
