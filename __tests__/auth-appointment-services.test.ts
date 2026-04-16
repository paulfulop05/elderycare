import { appointmentService } from "@/lib/services/client/appointmentService";
import { authService } from "@/lib/services/client/authService";

const mockJsonResponse = (data: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  }) as Response;

const mockEmptyResponse = (status: number) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({}),
  }) as Response;

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
    expect(authService.getCurrentUserName()).toBe("Doctor");
  });
});

describe("appointmentService", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.restoreAllMocks();
    (globalThis as { fetch?: jest.Mock }).fetch = jest.fn();
  });

  afterAll(() => {
    (globalThis as { fetch?: typeof fetch }).fetch = originalFetch;
  });

  it("schedules appointment and notifies subscribers", async () => {
    const listener = jest.fn();

    const fetchMock = (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(
        mockJsonResponse({ appointments: [], availableSlots: ["09:00"] }),
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          id: "101",
          doctorId: "7",
          patientId: "1",
          doctorName: "Dr. Maria",
          patientName: "Test Person",
          date: "2026-04-10",
          time: "09:00",
          reason: "Checkup",
          status: "upcoming",
        }),
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          appointments: [
            {
              id: "101",
              doctorId: "7",
              patientId: "1",
              doctorName: "Dr. Maria",
              patientName: "Test Person",
              date: "2026-04-10",
              time: "09:00",
              reason: "Checkup",
              status: "upcoming",
            },
          ],
          availableSlots: ["09:00"],
        }),
      );

    const unsubscribe = appointmentService.subscribe(listener);

    const created = await appointmentService.schedule({
      doctorName: "Dr. Maria",
      patientName: "Test Person",
      patientPhone: "+1 555-0101",
      date: "2026-04-10",
      time: "09:00",
      reason: "Checkup",
    });

    expect(created.status).toBe("upcoming");
    expect(created.id).toBeTruthy();
    expect(listener).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalled();

    unsubscribe();
  });

  it("cancels and finishes appointments", async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(mockEmptyResponse(204))
      .mockResolvedValueOnce(
        mockJsonResponse({ appointments: [], availableSlots: ["10:00"] }),
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          id: "202",
          doctorId: "7",
          patientId: "2",
          doctorName: "Dr. Maria",
          patientName: "Another Person",
          date: "2026-04-11",
          time: "10:00",
          reason: "Consult",
          status: "completed",
        }),
      )
      .mockResolvedValueOnce(
        mockJsonResponse({ appointments: [], availableSlots: ["10:00"] }),
      );

    await expect(appointmentService.cancel("202")).resolves.toBeUndefined();
    await expect(appointmentService.finish("202")).resolves.toEqual(
      expect.objectContaining({ status: "completed" }),
    );
  });

  it("returns undefined for missing appointment updates", async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce(mockEmptyResponse(404))
      .mockResolvedValueOnce(mockEmptyResponse(404));

    await expect(
      appointmentService.cancel("missing-id"),
    ).resolves.toBeUndefined();
    await expect(
      appointmentService.finish("missing-id"),
    ).resolves.toBeUndefined();
  });

  it("lists appointments and doctor-specific appointments", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse({
        appointments: [
          {
            id: "1",
            doctorId: "7",
            patientId: "1",
            doctorName: "Dr. Maria Santos",
            patientName: "P1",
            date: "2026-04-10",
            time: "09:00",
            reason: "Checkup",
            status: "upcoming",
          },
        ],
        availableSlots: ["09:00"],
      }),
    );

    await appointmentService.refresh();
    const all = appointmentService.list();
    expect(all.length).toBeGreaterThan(0);

    const byDoctor = appointmentService.listByDoctorName("Dr. Maria Santos");
    expect(Array.isArray(byDoctor)).toBe(true);
  });

  it("returns available slots", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue(
      mockJsonResponse({
        appointments: [],
        availableSlots: ["09:00", "09:30"],
      }),
    );

    await appointmentService.refresh();
    const slots = appointmentService.getAvailableSlots();
    expect(slots.length).toBeGreaterThan(0);
  });
});
