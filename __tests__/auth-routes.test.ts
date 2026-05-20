/** @jest-environment node */

import { buildSessionToken } from "@/lib/services/server/authSession";
import {
  authenticateDoctorLogin,
  createDoctor,
} from "@/lib/services/server/doctorManagementService";
import { POST as heartbeatPOST } from "@/app/api/auth/heartbeat/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { GET as meGET } from "@/app/api/auth/me/route";
import { POST as registerPOST } from "@/app/api/auth/register/route";

jest.mock("@/lib/services/server/doctorManagementService", () => ({
  __esModule: true,
  authenticateDoctorLogin: jest.fn(),
  createDoctor: jest.fn(),
  DoctorServiceError: class DoctorServiceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
      super(message);
      this.name = "DoctorServiceError";
      this.statusCode = statusCode;
    }
  },
}));

describe("auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in and sets a session cookie", async () => {
    (authenticateDoctorLogin as jest.Mock).mockResolvedValue({
      did: 7,
      name: "Dr. Alice",
      email: "alice@elderycare.com",
      role: "doctor",
    });

    const response = await loginPOST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "alice@elderycare.com",
          password: "password123",
          role: "doctor",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("ec_session=");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    await expect(response.json()).resolves.toEqual({
      did: 7,
      name: "Dr. Alice",
      email: "alice@elderycare.com",
      role: "doctor",
    });
  });

  it("registers a user and sets a session cookie", async () => {
    (createDoctor as jest.Mock).mockResolvedValue({
      did: 9,
      name: "Dr. Maria",
      email: "maria@elderycare.com",
      role: true,
    });

    const response = await registerPOST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Dr. Maria",
          age: 40,
          email: "maria@elderycare.com",
          phoneNumber: "+1 555 0101",
          password: "password123",
          role: true,
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("set-cookie")).toContain("ec_session=");
    await expect(response.json()).resolves.toEqual({
      did: 9,
      name: "Dr. Maria",
      email: "maria@elderycare.com",
      role: "admin",
    });
  });

  it("returns the current session user", async () => {
    const cookie = buildSessionToken({
      did: 11,
      name: "Doctor One",
      email: "doctor@elderycare.com",
      role: "doctor",
    });

    const response = await meGET(
      new Request("http://localhost/api/auth/me", {
        headers: { cookie: `ec_session=${cookie}` },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      did: 11,
      name: "Doctor One",
      email: "doctor@elderycare.com",
      role: "doctor",
    });
  });

  it("rejects an expired session", async () => {
    const response = await meGET(new Request("http://localhost/api/auth/me"));

    expect(response.status).toBe(401);
  });

  it("refreshes the session on heartbeat", async () => {
    const cookie = buildSessionToken({
      did: 12,
      name: "Doctor Two",
      email: "doctor2@elderycare.com",
      role: "doctor",
    });

    const response = await heartbeatPOST(
      new Request("http://localhost/api/auth/heartbeat", {
        method: "POST",
        headers: { cookie: `ec_session=${cookie}` },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("ec_session=");
  });

  it("clears the session on logout", async () => {
    const response = await logoutPOST();
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
