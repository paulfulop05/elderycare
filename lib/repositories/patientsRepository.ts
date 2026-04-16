import prisma from "@/lib/prisma";

export async function getAllPatients() {
  return prisma.patient.findMany({
    orderBy: {
      pid: "asc",
    },
    include: {
      healthMetrics: true,
      healthMetricsHistory: {
        orderBy: {
          recordedAt: "asc",
        },
      },
      appointments: {
        select: {
          date: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });
}

export async function getPatientById(pid: number) {
  return prisma.patient.findUnique({
    where: { pid },
    include: {
      healthMetrics: true,
      healthMetricsHistory: {
        orderBy: {
          recordedAt: "asc",
        },
      },
      appointments: {
        select: {
          date: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });
}

export async function upsertPatientMetrics(
  pid: number,
  metrics: {
    weight: number;
    height: number;
    BMI: number;
    bodyFat: number;
    muscleMass: number;
    bodyWater: number;
    metabolicAge: number;
    leanBodyMass: number;
    inorganicSalts: number;
    SMM: number;
    BFP: number;
  },
  recordedAt: Date,
  age?: number,
) {
  await prisma.healthMetrics.upsert({
    where: {
      patientId: pid,
    },
    update: metrics,
    create: {
      ...metrics,
      patientId: pid,
    },
  });

  await prisma.healthMetricsHistory.create({
    data: {
      ...metrics,
      patientId: pid,
      recordedAt,
    },
  });

  return prisma.patient.update({
    where: { pid },
    data: {
      lastVisit: recordedAt,
      ...(typeof age === "number" ? { age } : {}),
    },
    include: {
      healthMetrics: true,
      healthMetricsHistory: {
        orderBy: {
          recordedAt: "asc",
        },
      },
      appointments: {
        select: {
          date: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });
}

export async function updatePatientAge(pid: number, age: number) {
  return prisma.patient.update({
    where: { pid },
    data: {
      age,
    },
    include: {
      healthMetrics: true,
      healthMetricsHistory: {
        orderBy: {
          recordedAt: "asc",
        },
      },
      appointments: {
        select: {
          date: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });
}

export async function updateDoctorNote(pid: number, doctorNote: string) {
  return prisma.patient.update({
    where: { pid },
    data: {
      doctorNote,
    },
    include: {
      healthMetrics: true,
      healthMetricsHistory: {
        orderBy: {
          recordedAt: "asc",
        },
      },
      appointments: {
        select: {
          date: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });
}

export async function getLatestTwoHealthMetricsHistoryByPatientId(pid: number) {
  return prisma.healthMetricsHistory.findMany({
    where: {
      patientId: pid,
    },
    orderBy: {
      recordedAt: "desc",
    },
    take: 2,
  });
}

export async function getAllPatientsForHealthProgress() {
  return prisma.patient.findMany({
    orderBy: {
      pid: "asc",
    },
    select: {
      pid: true,
      name: true,
      age: true,
      doctorNote: true,
      healthMetricsHistory: {
        orderBy: {
          recordedAt: "desc",
        },
        take: 2,
      },
    },
  });
}
