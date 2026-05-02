import { doctorRepository } from "@/lib/data";
import type { Doctor } from "@/lib/domain";

let focusedDoctorId: string | null = null;

export const focusedDoctor = {
  set: (id: string): void => {
    focusedDoctorId = id;
  },
  clear: (): void => {
    focusedDoctorId = null;
  },
  get: (): Doctor | undefined => {
    if (!focusedDoctorId) {
      return undefined;
    }

    return doctorRepository.getById(focusedDoctorId);
  },
};
