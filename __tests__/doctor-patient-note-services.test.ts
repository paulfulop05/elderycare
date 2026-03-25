import { doctorService } from "@/lib/services/doctorService";
import { noteService } from "@/lib/services/noteService";
import { patientService } from "@/lib/services/patientService";

describe("doctorService", () => {
  it("adds doctor with generated avatar and removes doctor", () => {
    const created = doctorService.add({
      name: "Jane Smith",
      age: 40,
      email: "jane@example.com",
      phone: "+1 555-9999",
    });

    expect(created.avatar).toBe("JS");
    expect(doctorService.getById(created.id)?.name).toBe("Jane Smith");

    doctorService.remove(created.id);
    expect(doctorService.getById(created.id)).toBeUndefined();
  });
});

describe("patientService", () => {
  it("updates patient metrics and appends to history", () => {
    const patient = patientService.getById("1");
    expect(patient).toBeDefined();

    const previousHistoryLength = patient!.metricsHistory.length;
    const updated = patientService.updateMetrics("1", {
      ...patient!.metrics,
      weight: patient!.metrics.weight + 1,
    });

    expect(updated).toBeDefined();
    expect(updated!.metrics.weight).toBe(patient!.metrics.weight + 1);
    expect(updated!.metricsHistory.length).toBe(previousHistoryLength + 1);
  });

  it("returns undefined for missing patient", () => {
    expect(patientService.getById("missing")).toBeUndefined();
    expect(
      patientService.updateMetrics("missing", {
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
      }),
    ).toBeUndefined();
  });
});

describe("noteService", () => {
  it("stores and retrieves notes by patient id", () => {
    noteService.setByPatientId("1", "New note");
    const notes = noteService.getAllByPatientId();

    expect(notes["1"]).toBe("New note");
  });
});
