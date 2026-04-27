import {
  createAppointment,
  listAppointments,
  listAvailableSlots,
  updateAppointment,
} from "@/lib/api/handlers/appointments";
import { login, logout, me } from "@/lib/api/handlers/auth";
import {
  createDoctor,
  deleteDoctor,
  getDoctor,
  listDoctors,
} from "@/lib/api/handlers/doctors";
import { getPatientNote, setPatientNote } from "@/lib/api/handlers/notes";
import {
  getPatientMetrics,
  listPatients,
  updatePatientMetrics,
} from "@/lib/api/handlers/patients";
import { mockDataRepository } from "@/lib/data";
import { authService } from "@/lib/services/authService";
import { patientService } from "@/lib/services/patientService";

describe("API handlers", () => {
  beforeEach(() => {
    mockDataRepository.resetToSeed();
    authService.logout();
  });

  describe("doctors", () => {
    it("lists doctors with pagination metadata", () => {
      const result = listDoctors({ page: "1", pageSize: "2" });

      expect(result.status).toBe(200);
      if (!("data" in result.body)) {
        throw new Error("Expected success response body.");
      }

      expect(result.body.data.items).toHaveLength(2);
      expect(result.body.data.pagination.page).toBe(1);
      expect(result.body.data.pagination.pageSize).toBe(2);
      expect(result.body.data.pagination.total).toBeGreaterThan(0);
    });

    it("returns bad request for invalid doctor pagination", () => {
      const result = listDoctors({ page: "0" });

      expect(result.status).toBe(400);
      expect(result.body).toMatchObject({
        error: "Invalid pagination query.",
      });

      if (!("details" in result.body) || !result.body.details) {
        throw new Error("Expected validation details for pagination.");
      }
      expect(result.body.details.page).toBeDefined();
    });

    it("creates, fetches and deletes doctor", () => {
      const createdResult = createDoctor({
        name: "Dr. Jane Doe",
        age: 40,
        email: "jane.doe@example.com",
        phone: "+40 712 345 678",
      });

      expect(createdResult.status).toBe(201);
      if (!("data" in createdResult.body)) {
        throw new Error("Expected created doctor.");
      }

      const doctorId = createdResult.body.data.id;
      const fetchedResult = getDoctor(doctorId);
      expect(fetchedResult.status).toBe(200);

      const deleteResult = deleteDoctor(doctorId);
      expect(deleteResult.status).toBe(200);

      const missingResult = getDoctor(doctorId);
      expect(missingResult.status).toBe(404);
    });

    it("validates doctor payload server side", () => {
      const result = createDoctor({
        name: "D",
        age: 10,
        email: "invalid-email",
        phone: "abc",
      });

      expect(result.status).toBe(400);
      expect(result.body).toMatchObject({
        error: "Invalid doctor payload.",
      });

      if (!("details" in result.body) || !result.body.details) {
        throw new Error("Expected validation details for doctor payload.");
      }
      expect(result.body.details.name).toBeDefined();
      expect(result.body.details.email).toBeDefined();
    });
  });

  describe("appointments", () => {
    it("lists appointments with doctor filter and pagination", () => {
      const allResult = listAppointments({ page: "1", pageSize: "5" });
      const doctorFilteredResult = listAppointments({
        page: "1",
        pageSize: "5",
        doctorName: "Dr. Maria Santos",
      });

      expect(allResult.status).toBe(200);
      expect(doctorFilteredResult.status).toBe(200);

      if (
        !("data" in allResult.body) ||
        !("data" in doctorFilteredResult.body)
      ) {
        throw new Error("Expected successful appointment list responses.");
      }

      expect(allResult.body.data.items.length).toBeLessThanOrEqual(5);
      expect(
        doctorFilteredResult.body.data.items.every(
          (item) => item.doctorName === "Dr. Maria Santos",
        ),
      ).toBe(true);
    });

    it("creates and updates appointment status", () => {
      const created = createAppointment({
        doctorName: "Dr. Maria",
        patientName: "Patient X",
        date: "2026-05-10",
        time: "11:00",
        reason: "Follow up",
      });

      expect(created.status).toBe(201);
      if (!("data" in created.body)) {
        throw new Error("Expected created appointment.");
      }

      const id = created.body.data.id;

      const cancelled = updateAppointment(id, { action: "cancel" });
      expect(cancelled.status).toBe(200);
      if (!("data" in cancelled.body)) {
        throw new Error("Expected cancelled appointment.");
      }
      expect(cancelled.body.data.status).toBe("cancelled");

      const finished = updateAppointment(id, { action: "finish" });
      expect(finished.status).toBe(200);
      if (!("data" in finished.body)) {
        throw new Error("Expected finished appointment.");
      }
      expect(finished.body.data.status).toBe("past");
    });

    it("validates appointment payload and action", () => {
      const invalidCreate = createAppointment({
        doctorName: "",
        patientName: "",
        date: "10-02-2026",
        time: "25:80",
        reason: "x",
      });

      expect(invalidCreate.status).toBe(400);
      expect(invalidCreate.body).toMatchObject({
        error: "Invalid appointment payload.",
      });

      if (!("details" in invalidCreate.body) || !invalidCreate.body.details) {
        throw new Error("Expected appointment payload validation details.");
      }
      expect(invalidCreate.body.details.date).toBeDefined();
      expect(invalidCreate.body.details.time).toBeDefined();

      const invalidAction = updateAppointment("missing", { action: "noop" });
      expect(invalidAction.status).toBe(400);
      expect(invalidAction.body).toMatchObject({
        error: "Invalid appointment action payload.",
      });

      if (!("details" in invalidAction.body) || !invalidAction.body.details) {
        throw new Error("Expected appointment action validation details.");
      }
      expect(invalidAction.body.details.action).toBeDefined();

      const missing = updateAppointment("missing", { action: "cancel" });
      expect(missing.status).toBe(404);
    });

    it("returns available slots", () => {
      const result = listAvailableSlots();

      expect(result.status).toBe(200);
      if (!("data" in result.body)) {
        throw new Error("Expected slots list response.");
      }
      expect(result.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("patients", () => {
    it("lists patients with pagination", () => {
      const result = listPatients({ page: "2", pageSize: "1" });

      expect(result.status).toBe(200);
      if (!("data" in result.body)) {
        throw new Error("Expected patient list response.");
      }

      expect(result.body.data.items).toHaveLength(1);
      expect(result.body.data.pagination.page).toBe(2);
    });

    it("gets and updates patient metrics", () => {
      const patient = patientService.list()[0];
      const metricsResult = getPatientMetrics(patient.id);
      expect(metricsResult.status).toBe(200);

      const updatedResult = updatePatientMetrics(patient.id, {
        weight: 80,
        height: 175,
        bmi: 26.1,
        bodyFat: 19,
        muscleMass: 45,
        bodyWater: 58,
        metabolicAge: 40,
        leanBodyMass: 55,
        inorganicSalts: 3,
        smm: 36,
        bfp: 19,
      });

      expect(updatedResult.status).toBe(200);
      if (!("data" in updatedResult.body)) {
        throw new Error("Expected updated patient response.");
      }

      expect(updatedResult.body.data.metrics.weight).toBe(80);
    });

    it("validates metrics payload and handles missing patients", () => {
      const invalidResult = updatePatientMetrics("missing", {
        weight: 999,
        height: 50,
        bmi: 99,
        bodyFat: 99,
        muscleMass: 1,
        bodyWater: 1,
        metabolicAge: 5,
        leanBodyMass: 1,
        inorganicSalts: 99,
        smm: 1,
        bfp: 99,
      });

      expect(invalidResult.status).toBe(400);
      expect(invalidResult.body).toMatchObject({
        error: "Invalid metrics payload.",
      });

      if (!("details" in invalidResult.body) || !invalidResult.body.details) {
        throw new Error("Expected metrics validation details.");
      }
      expect(invalidResult.body.details.weight).toBeDefined();

      const missingMetricsResult = getPatientMetrics("missing");
      expect(missingMetricsResult.status).toBe(404);
    });
  });

  describe("notes", () => {
    it("gets default note and updates note", () => {
      const patientId = patientService.list()[0].id;

      const empty = getPatientNote(patientId);
      expect(empty.status).toBe(200);
      if (!("data" in empty.body)) {
        throw new Error("Expected default note response.");
      }
      expect(empty.body.data.value).toBe("");

      const updated = setPatientNote(patientId, {
        value: "  Follow-up required in two weeks.  ",
      });
      expect(updated.status).toBe(200);

      const after = getPatientNote(patientId);
      if (!("data" in after.body)) {
        throw new Error("Expected note response after update.");
      }
      expect(after.body.data.value).toBe("Follow-up required in two weeks. ");
    });

    it("validates note payload", () => {
      const patientId = patientService.list()[0].id;
      const tooLong = "a".repeat(201);

      const result = setPatientNote(patientId, { value: tooLong });

      expect(result.status).toBe(400);
      expect(result.body).toMatchObject({
        error: "Invalid note payload.",
      });

      if (!("details" in result.body) || !result.body.details) {
        throw new Error("Expected note validation details.");
      }
      expect(result.body.details.value).toBeDefined();
    });
  });

  describe("auth", () => {
    it("returns current auth state", () => {
      const result = me();

      expect(result.status).toBe(200);
      if (!("data" in result.body)) {
        throw new Error("Expected auth state.");
      }

      expect(result.body.data.loggedIn).toBe(false);
      expect(result.body.data.role).toBe("doctor");
    });

    it("logs in and out with validation", () => {
      const invalidLogin = login({ role: "guest" });
      expect(invalidLogin.status).toBe(400);

      if (!("details" in invalidLogin.body) || !invalidLogin.body.details) {
        throw new Error("Expected login validation details.");
      }
      expect(invalidLogin.body.details.role).toBeDefined();

      const validLogin = login({ role: "admin" });
      expect(validLogin.status).toBe(200);
      if (!("data" in validLogin.body)) {
        throw new Error("Expected login response.");
      }
      expect(validLogin.body.data.loggedIn).toBe(true);
      expect(validLogin.body.data.role).toBe("admin");

      const loggedOut = logout();
      expect(loggedOut.status).toBe(200);
      if (!("data" in loggedOut.body)) {
        throw new Error("Expected logout response.");
      }
      expect(loggedOut.body.data.loggedIn).toBe(false);
      expect(loggedOut.body.data.role).toBe("doctor");
    });
  });
});
