import { patientService } from "@/lib/services/client/patientService";

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const noteService = {
  getAllByPatientId: async (): Promise<Record<string, string>> => {
    await patientService.refresh();
    const patients = patientService.list();
    return patients.reduce<Record<string, string>>((acc, patient) => {
      acc[patient.id] = patient.doctorNote ?? "";
      return acc;
    }, {});
  },
  setByPatientId: async (patientId: string, value: string): Promise<void> => {
    await parseResponse(
      await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctorNote: value }),
      }),
    );
    await patientService.refresh();
  },
};
