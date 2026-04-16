export type HealthProgressCardData = {
  patientId: string;
  patientName: string;
  patientAge: number;
  currentScore: number;
  previousScore: number;
  delta: number;
  currentRecordedAt: string;
  previousRecordedAt: string;
  doctorNote: string;
  explanations: string[];
};

export type HealthProgressPayload = {
  improvedPatients: HealthProgressCardData[];
  patientsNeedingAttention: HealthProgressCardData[];
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

export const healthProgressService = {
  list: async (): Promise<HealthProgressPayload> => {
    const response = await fetch("/api/health-progress", {
      cache: "no-store",
    });

    return parseResponse<HealthProgressPayload>(response);
  },
};
