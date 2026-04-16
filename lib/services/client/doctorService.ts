import type { Doctor, UserRole } from "@/lib/domain";

type DoctorApiRecord = {
  did: number;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
};

type CreateDoctorInput = {
  name: string;
  age: number;
  email: string;
  phone: string;
  password: string;
};

type LoginApiResponse = {
  did: number;
  name: string;
  email: string;
  role: UserRole;
};

type UpdateProfileApiResponse = {
  did: number;
  name: string;
  age: number;
  email: string;
  phoneNumber: string;
  role: UserRole;
};

const buildAvatar = (name: string): string =>
  name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("");

const mapDoctor = (doctor: DoctorApiRecord): Doctor => ({
  id: String(doctor.did),
  name: doctor.name,
  age: doctor.age,
  email: doctor.email,
  phone: doctor.phoneNumber,
  avatar: buildAvatar(doctor.name),
});

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      // Keep the default message when the response body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const doctorService = {
  list: async (): Promise<Doctor[]> => {
    const doctors = await parseResponse<DoctorApiRecord[]>(
      await fetch("/api/doctors", { cache: "no-store" }),
    );
    return doctors.map(mapDoctor);
  },

  getById: async (id: string): Promise<Doctor | undefined> => {
    const response = await fetch(`/api/doctors/${id}`, { cache: "no-store" });
    if (response.status === 404) {
      return undefined;
    }

    const doctor = await parseResponse<DoctorApiRecord>(response);
    return mapDoctor(doctor);
  },

  add: async (input: CreateDoctorInput): Promise<Doctor> => {
    const doctor = await parseResponse<DoctorApiRecord>(
      await fetch("/api/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          age: input.age,
          email: input.email,
          phoneNumber: input.phone,
          password: input.password,
          role: false,
        }),
      }),
    );

    return mapDoctor(doctor);
  },

  remove: async (id: string): Promise<void> => {
    const response = await fetch(`/api/doctors/${id}`, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 404) {
      throw new Error("Failed to delete doctor");
    }
  },

  login: async (
    email: string,
    password: string,
    role: UserRole,
  ): Promise<LoginApiResponse> => {
    return parseResponse<LoginApiResponse>(
      await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      }),
    );
  },

  updateMyName: async (
    did: string,
    name: string,
  ): Promise<LoginApiResponse> => {
    return parseResponse<LoginApiResponse>(
      await fetch("/api/doctors/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          did,
          name,
        }),
      }),
    );
  },

  updateMyProfile: async (input: {
    did: string;
    name: string;
    age: number;
    email: string;
    phoneNumber: string;
  }): Promise<UpdateProfileApiResponse> => {
    return parseResponse<UpdateProfileApiResponse>(
      await fetch("/api/doctors/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }),
    );
  },

  updateMyPassword: async (
    did: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    await parseResponse<{ ok: true }>(
      await fetch("/api/doctors/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          did,
          currentPassword,
          newPassword,
        }),
      }),
    );
  },
};
