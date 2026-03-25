import { appointmentService } from "@/lib/services/appointmentService";
import { authService } from "@/lib/services/authService";

describe("authService", () => {
  beforeEach(() => {
    authService.logout();
  });

  it("logs in as role and reads auth state", () => {
    authService.loginAs("admin");

    expect(authService.isLoggedIn()).toBe(true);
    expect(authService.getUserRole()).toBe("admin");
    expect(authService.getCurrentUserName()).toBe("Admin");
  });

  it("logs out and resets auth state", () => {
    authService.loginAs("admin");
    authService.logout();

    expect(authService.isLoggedIn()).toBe(false);
    expect(authService.getUserRole()).toBe("doctor");
    expect(authService.getCurrentUserName()).toBe("Dr. Maria");
  });
});

describe("appointmentService", () => {
  it("schedules appointment and notifies subscribers", () => {
    const listener = jest.fn();
    const unsubscribe = appointmentService.subscribe(listener);

    const created = appointmentService.schedule({
      doctorName: "Dr. Maria",
      patientName: "Test Person",
      date: "2026-04-10",
      time: "09:00",
      reason: "Checkup",
    });

    expect(created.status).toBe("upcoming");
    expect(created.id).toBeTruthy();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("cancels and finishes appointments", () => {
    const created = appointmentService.schedule({
      doctorName: "Dr. Maria",
      patientName: "Another Person",
      date: "2026-04-11",
      time: "10:00",
      reason: "Consult",
    });

    const cancelled = appointmentService.cancel(created.id);
    expect(cancelled?.status).toBe("cancelled");

    const finished = appointmentService.finish(created.id);
    expect(finished?.status).toBe("past");
  });

  it("returns undefined for missing appointment updates", () => {
    expect(appointmentService.cancel("missing-id")).toBeUndefined();
    expect(appointmentService.finish("missing-id")).toBeUndefined();
  });

  it("lists appointments and doctor-specific appointments", () => {
    const all = appointmentService.list();
    expect(all.length).toBeGreaterThan(0);

    const byDoctor = appointmentService.listByDoctorName("Dr. Maria Santos");
    expect(Array.isArray(byDoctor)).toBe(true);
  });

  it("returns available slots", () => {
    const slots = appointmentService.getAvailableSlots();
    expect(slots.length).toBeGreaterThan(0);
  });
});
