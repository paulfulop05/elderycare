import type { Doctor } from "@/lib/domain";
import { doctorRepository } from "@/lib/data";
import { enqueueOfflineMutation } from "@/lib/client/offlineSync";

const createDoctorMutation = `
  mutation CreateDoctor($input: DoctorInput!) {
    createDoctor(input: $input) {
      id
    }
  }
`;

const deleteDoctorMutation = `
  mutation DeleteDoctor($id: ID!) {
    deleteDoctor(id: $id)
  }
`;

type DoctorsListener = () => void;

const doctorListeners = new Set<DoctorsListener>();

const notifyDoctorsChanged = (): void => {
  doctorListeners.forEach((listener) => {
    listener();
  });
};

const isBrowser = (): boolean => typeof window !== "undefined";

type NewDoctorInput = {
  name: string;
  age: number;
  email: string;
  phone: string;
};

const buildAvatar = (name: string): string =>
  name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("");

export const doctorService = {
  list: (): Doctor[] => doctorRepository.getAll(),
  getById: (id: string): Doctor | undefined => doctorRepository.getById(id),
  add: (input: NewDoctorInput): Doctor => {
    const doctor: Doctor = {
      id: doctorRepository.nextId(),
      name: input.name,
      age: input.age,
      email: input.email,
      phone: input.phone,
      avatar: buildAvatar(input.name),
    };

    const created = doctorRepository.add(doctor);
    notifyDoctorsChanged();

    if (isBrowser()) {
      void enqueueOfflineMutation(createDoctorMutation, { input });
    }

    return created;
  },
  remove: (id: string): void => {
    doctorRepository.remove(id);
    notifyDoctorsChanged();

    if (isBrowser()) {
      void enqueueOfflineMutation(deleteDoctorMutation, { id });
    }
  },
  replaceAll: (doctors: Doctor[]): void => {
    doctorRepository.replaceAll(doctors);
    notifyDoctorsChanged();
  },
  subscribe: (listener: DoctorsListener): (() => void) => {
    doctorListeners.add(listener);
    return () => {
      doctorListeners.delete(listener);
    };
  },
};
