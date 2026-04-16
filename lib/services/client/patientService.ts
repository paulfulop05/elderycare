import type { HealthMetrics, Patient } from "@/lib/domain";

let cachedPatients: Patient[] = [];
let hasLoaded = false;

const parseResponse = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> => {
  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // ignore json parse errors
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

const refresh = async (): Promise<void> => {
  let response: Response;
  try {
    response = await fetch("/api/patients", { cache: "no-store" });
  } catch {
    throw new Error("Failed to fetch patients.");
  }

  cachedPatients = await parseResponse<Patient[]>(
    response,
    "Failed to fetch patients.",
  );

  hasLoaded = true;
};

export const patientService = {
  list: (): Patient[] => {
    if (!hasLoaded) {
      void refresh();
    }

    return cachedPatients;
  },
  getById: async (id: string): Promise<Patient | undefined> => {
    let response: Response;
    try {
      response = await fetch(`/api/patients/${id}`, { cache: "no-store" });
    } catch {
      throw new Error("Failed to fetch patient.");
    }

    if (response.status === 404) {
      return undefined;
    }

    return parseResponse<Patient>(response, "Failed to fetch patient.");
  },
  updateMetrics: async (
    id: string,
    metrics: HealthMetrics,
  ): Promise<Patient | undefined> => {
    const response = await fetch(`/api/patients/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metrics }),
    });

    if (response.status === 404) {
      return undefined;
    }

    const updated = await parseResponse<Patient>(
      response,
      "Failed to update patient.",
    );
    await refresh();
    return updated;
  },
  updateData: async (
    id: string,
    input: { metrics: HealthMetrics; age: number },
  ): Promise<Patient | undefined> => {
    const response = await fetch(`/api/patients/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (response.status === 404) {
      return undefined;
    }

    const updated = await parseResponse<Patient>(
      response,
      "Failed to update patient.",
    );
    await refresh();
    return updated;
  },
  refresh: async (): Promise<void> => {
    await refresh();
  },
};
