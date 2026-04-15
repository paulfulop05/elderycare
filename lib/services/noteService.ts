import { noteRepository } from "@/lib/data";

export const noteService = {
  getAllByPatientId: (): Record<string, string> =>
    noteRepository.getAllByPatientId(),
  setByPatientId: (patientId: string, value: string): void => {
    noteRepository.setByPatientId(patientId, value);
  },
};
