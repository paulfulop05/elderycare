import { noteRepository } from "@/lib/data";
import { enqueueOfflineMutation } from "@/lib/client/offlineSync";

const setPatientNoteMutation = `
  mutation SetPatientNote($patientId: ID!, $value: String!) {
    setPatientNote(patientId: $patientId, value: $value)
  }
`;

type NotesListener = () => void;

const noteListeners = new Set<NotesListener>();

const notifyNotesChanged = (): void => {
  noteListeners.forEach((listener) => {
    listener();
  });
};

const isBrowser = (): boolean => typeof window !== "undefined";

export const noteService = {
  getAllByPatientId: (): Record<string, string> =>
    noteRepository.getAllByPatientId(),
  setByPatientId: (patientId: string, value: string): void => {
    noteRepository.setByPatientId(patientId, value);
    notifyNotesChanged();

    if (isBrowser()) {
      void enqueueOfflineMutation(setPatientNoteMutation, { patientId, value });
    }
  },
  replaceAll: (notesByPatientId: Record<string, string>): void => {
    noteRepository.replaceAll(notesByPatientId);
    notifyNotesChanged();
  },
  subscribe: (listener: NotesListener): (() => void) => {
    noteListeners.add(listener);
    return () => {
      noteListeners.delete(listener);
    };
  },
};
