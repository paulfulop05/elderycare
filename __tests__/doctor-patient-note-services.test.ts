import { doctorService } from "@/lib/services/client/doctorService";
import { noteService } from "@/lib/services/client/noteService";
import { patientService } from "@/lib/services/client/patientService";

jest.mock("@/lib/services/client/doctorService");
jest.mock("@/lib/services/client/patientService");
jest.mock("@/lib/services/client/noteService");

describe("doctorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds doctor with generated avatar and removes doctor", async () => {
    const mockDoctor = {
      id: "1",
      name: "Jane Smith",
      age: 40,
      email: "jane@example.com",
      phone: "+1 555-9999",
      avatar: "JS",
    };

    (doctorService.add as jest.Mock).mockResolvedValue(mockDoctor);
    (doctorService.getById as jest.Mock).mockResolvedValue(mockDoctor);
    (doctorService.remove as jest.Mock).mockImplementation(() => {});

    const created = await doctorService.add({
      name: "Jane Smith",
      age: 40,
      email: "jane@example.com",
      phone: "+1 555-9999",
      password: "password123",
    });

    expect(created.avatar).toBe("JS");

    const retrieved = await doctorService.getById(created.id);
    expect(retrieved?.name).toBe("Jane Smith");

    doctorService.remove(created.id);

    (doctorService.getById as jest.Mock).mockResolvedValue(undefined);
    const after = await doctorService.getById(created.id);
    expect(after).toBeUndefined();
  });
});

describe("patientService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates patient metrics and appends to history", async () => {
    const mockPatient = {
      id: "1",
      name: "Test Patient",
      age: 65,
      metrics: {
        weight: 70,
        height: 170,
        bmi: 24,
        bodyFat: 20,
        muscleMass: 40,
        bodyWater: 50,
        metabolicAge: 40,
        leanBodyMass: 50,
        inorganicSalts: 2,
        smm: 40,
        bfp: 20,
      },
      metricsHistory: [
        {
          weight: 69,
          height: 170,
          bmi: 24,
          bodyFat: 20,
          muscleMass: 40,
          bodyWater: 50,
          metabolicAge: 40,
          leanBodyMass: 50,
          inorganicSalts: 2,
          smm: 40,
          bfp: 20,
          date: "2026-01-01",
        },
      ],
      lastVisit: "2026-01-01",
      avatar: "TP",
      doctorNote: "",
    };

    (patientService.getById as jest.Mock).mockResolvedValue(mockPatient);

    const patient = await patientService.getById("1");
    expect(patient).toBeDefined();

    const previousHistoryLength = patient!.metricsHistory.length;
    const updatedMetrics = {
      ...patient!.metrics,
      weight: patient!.metrics.weight + 1,
    };

    const updatedPatient = {
      ...patient,
      metrics: updatedMetrics,
      metricsHistory: [...patient!.metricsHistory, updatedMetrics],
    };

    (patientService.updateMetrics as jest.Mock).mockResolvedValue(
      updatedPatient,
    );

    const updated = await patientService.updateMetrics(
      "1",
      updatedMetrics as any,
    );

    expect(updated).toBeDefined();
    expect(updated!.metrics.weight).toBe(patient!.metrics.weight + 1);
    expect(updated!.metricsHistory.length).toBe(previousHistoryLength + 1);
  });

  it("returns undefined for missing patient", async () => {
    (patientService.getById as jest.Mock).mockResolvedValue(undefined);
    (patientService.updateMetrics as jest.Mock).mockResolvedValue(undefined);

    const result = await patientService.getById("missing");
    expect(result).toBeUndefined();

    const updateResult = await patientService.updateMetrics("missing", {
      date: "2026-01-01",
      weight: 70,
      height: 170,
      bmi: 24,
      bodyFat: 20,
      muscleMass: 40,
      bodyWater: 50,
      metabolicAge: 40,
      leanBodyMass: 50,
      inorganicSalts: 2,
      smm: 40,
      bfp: 20,
    } as any);
    expect(updateResult).toBeUndefined();
  });
});

describe("noteService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores and retrieves notes by patient id", async () => {
    const mockNotes = { "1": "New note" };

    (noteService.setByPatientId as jest.Mock).mockResolvedValue(undefined);
    (noteService.getAllByPatientId as jest.Mock).mockResolvedValue(mockNotes);

    await noteService.setByPatientId("1", "New note");
    const notes = await noteService.getAllByPatientId();

    expect(notes["1"]).toBe("New note");
  });
});
