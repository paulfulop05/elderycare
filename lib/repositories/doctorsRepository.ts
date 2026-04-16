import prisma from "@/lib/prisma";

export async function getAll() {
  return prisma.doctor.findMany();
}

export async function findDoctorById(did: number) {
  return prisma.doctor.findUnique({
    where: { did },
  });
}

export async function findDoctorByEmail(email: string) {
  return prisma.doctor.findUnique({
    where: { email },
  });
}

export async function registerDoctor(
  age: number,
  name: string,
  phoneNumber: string,
  role: boolean,
  email: string,
  password: string,
) {
  return prisma.doctor.create({
    data: {
      email,
      password,
      name,
      age,
      role,
      phoneNumber,
    },
  });
}

export async function removeAppointmentsByDoctorId(doctorId: number) {
  return prisma.appointment.deleteMany({
    where: {
      doctorId,
    },
  });
}

export async function removeDoctorById(did: number) {
  return prisma.doctor.deleteMany({
    where: {
      did,
    },
  });
}

export async function updateDoctorName(did: number, name: string) {
  return prisma.doctor.update({
    where: { did },
    data: { name },
  });
}

export async function updateDoctorProfile(
  did: number,
  profile: {
    name: string;
    age: number;
    email: string;
    phoneNumber: string;
  },
) {
  return prisma.doctor.update({
    where: { did },
    data: profile,
  });
}

export async function updateDoctorPassword(did: number, password: string) {
  return prisma.doctor.update({
    where: { did },
    data: { password },
  });
}
