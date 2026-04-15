import type { Doctor } from "@/lib/domain";
import { doctorRepository } from "@/lib/data";

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

    return doctorRepository.add(doctor);
  },
  remove: (id: string): void => {
    doctorRepository.remove(id);
  },
};
