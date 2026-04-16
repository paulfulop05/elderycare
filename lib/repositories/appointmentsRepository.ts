import prisma from "@/lib/prisma";

export async function getAllAppointments() {
  return prisma.appointment.findMany({
    orderBy: {
      aid: "asc",
    },
    include: {
      doctor: true,
      patient: true,
    },
  });
}

export async function normalizeAppointmentStatuses() {
  await prisma.appointment.updateMany({
    where: {
      OR: [{ status: "Pending" }, { status: "pending" }],
    },
    data: {
      status: "upcoming",
    },
  });
}

export async function purgeCancelledAppointments() {
  await prisma.appointment.deleteMany({
    where: {
      status: {
        in: ["cancelled", "Cancelled", "canceled", "Canceled"],
      },
    },
  });
}

export async function getAppointmentById(aid: number) {
  return prisma.appointment.findUnique({
    where: { aid },
    include: {
      doctor: true,
      patient: true,
    },
  });
}

export async function updateAppointmentStatus(aid: number, status: string) {
  return prisma.appointment.update({
    where: { aid },
    data: { status },
    include: {
      doctor: true,
      patient: true,
    },
  });
}

export async function deleteAppointmentById(aid: number) {
  return prisma.appointment.delete({
    where: { aid },
  });
}

export async function getDoctorByName(name: string) {
  return prisma.doctor.findFirst({
    where: { name },
  });
}

export async function getDoctorById(did: number) {
  return prisma.doctor.findUnique({
    where: { did },
  });
}

export async function getPatientByNameAndPhone(
  name: string,
  phoneNumber: string,
) {
  return prisma.patient.findUnique({
    where: {
      name_phoneNumber: {
        name,
        phoneNumber,
      },
    },
  });
}

export async function createPatient(input: {
  name: string;
  phoneNumber: string;
  age: number;
}) {
  return prisma.patient.create({
    data: {
      name: input.name,
      phoneNumber: input.phoneNumber,
      age: input.age,
    },
  });
}

export async function createAppointment(input: {
  date: Date;
  reason: string;
  status: string;
  doctorId: number;
  patientId: number;
}) {
  return prisma.appointment.create({
    data: input,
    include: {
      doctor: true,
      patient: true,
    },
  });
}
