import {
  doctorRepository,
  patientRepository,
  appointmentRepository,
} from "@/lib/data";
import { publishRealtimeEvent } from "@/lib/server/realtimeHub";
import type { Appointment, Doctor, Patient } from "@/lib/domain";
import { focusedDoctor } from "./focusedDoctor";

let generatorTimer: NodeJS.Timeout | null = null;
let demoSeeded = false;

const buildAvatar = (name: string): string =>
  name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("");

const makeFutureIsoDate = (dayOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString().slice(0, 10);
};

const createBatch = async (count: number): Promise<void> => {
  const { faker } = await import("@faker-js/faker");

  const doctors = doctorRepository.getAll();
  const patients = patientRepository.getAll();
  const selectedDoctor = focusedDoctor.get();
  const availableSlots = [
    "08:00",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  for (let index = 0; index < count; index += 1) {
    if (
      !selectedDoctor &&
      (doctors.length === 0 ||
        index === 0 ||
        faker.datatype.boolean({ probability: 0.4 }))
    ) {
      const newDoctor: Doctor = {
        id: doctorRepository.nextId(),
        name: `Dr. ${faker.person.fullName()}`,
        age: faker.number.int({ min: 30, max: 75 }),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number({ style: "international" }),
        avatar: "DR",
      };
      newDoctor.avatar = buildAvatar(newDoctor.name);
      doctors.push(doctorRepository.add(newDoctor));
    }

    // Always create a patient on first iteration, then ~60% chance
    if (
      patients.length === 0 ||
      index === 0 ||
      faker.datatype.boolean({ probability: 0.6 })
    ) {
      const weight = faker.number.float({
        min: 48,
        max: 110,
        fractionDigits: 1,
      });
      const height = faker.number.float({
        min: 145,
        max: 195,
        fractionDigits: 1,
      });
      const bmi = Number(
        (weight / ((height / 100) * (height / 100))).toFixed(1),
      );
      const newPatient: Patient = {
        id: patientRepository.nextId(),
        name: faker.person.fullName(),
        age: faker.number.int({ min: 55, max: 90 }),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number({ style: "international" }),
        avatar: "PT",
        lastVisit: makeFutureIsoDate(-faker.number.int({ min: 1, max: 45 })),
        metrics: {
          date: new Date().toISOString().slice(0, 10),
          weight,
          height,
          bmi,
          bodyFat: faker.number.float({ min: 15, max: 45, fractionDigits: 1 }),
          muscleMass: faker.number.float({
            min: 20,
            max: 42,
            fractionDigits: 1,
          }),
          bodyWater: faker.number.float({
            min: 42,
            max: 63,
            fractionDigits: 1,
          }),
          metabolicAge: faker.number.int({ min: 35, max: 95 }),
          leanBodyMass: faker.number.float({
            min: 32,
            max: 64,
            fractionDigits: 1,
          }),
          inorganicSalts: faker.number.float({
            min: 1.8,
            max: 4.9,
            fractionDigits: 1,
          }),
          smm: faker.number.float({ min: 16, max: 40, fractionDigits: 1 }),
          bfp: faker.number.float({ min: 15, max: 42, fractionDigits: 1 }),
        },
        metricsHistory: [],
      };
      newPatient.metricsHistory = [newPatient.metrics];
      newPatient.avatar = buildAvatar(newPatient.name);
      patients.push(patientRepository.add(newPatient));
    }

    if (doctors.length === 0 || patients.length === 0) continue;

    const randomDoctor =
      selectedDoctor ??
      doctors[faker.number.int({ min: 0, max: doctors.length - 1 })];
    const randomPatient =
      patients[faker.number.int({ min: 0, max: patients.length - 1 })];

    const appointment: Appointment = {
      id: appointmentRepository.nextId(),
      doctorName: randomDoctor.name,
      patientName: randomPatient.name,
      date: makeFutureIsoDate(faker.number.int({ min: -30, max: 60 })),
      time: availableSlots[
        faker.number.int({ min: 0, max: availableSlots.length - 1 })
      ],
      status: faker.helpers.arrayElement([
        "upcoming",
        "upcoming",
        "upcoming",
        "past",
        "cancelled",
      ]),
      reason: faker.helpers.arrayElement([
        "Routine checkup",
        "Post-treatment follow-up",
        "Medication monitoring",
        "Mobility and balance review",
        "Blood pressure follow-up",
        "Nutrition consultation",
        "Mental health assessment",
        "Physical therapy review",
        "Lab results discussion",
        "Diabetes management",
      ]),
    };

    appointmentRepository.add(appointment);
  }

  publishRealtimeEvent({
    type: "batch_generated",
    entity: "all",
    source: "generator",
    timestamp: Date.now(),
  });
};

const seedPatientBatch = async (count: number): Promise<void> => {
  const { faker } = await import("@faker-js/faker");

  for (let index = 0; index < count; index += 1) {
    const weight = faker.number.float({ min: 48, max: 110, fractionDigits: 1 });
    const height = faker.number.float({
      min: 145,
      max: 195,
      fractionDigits: 1,
    });
    const bmi = Number((weight / ((height / 100) * (height / 100))).toFixed(1));

    const newPatient: Patient = {
      id: patientRepository.nextId(),
      name: faker.person.fullName(),
      age: faker.number.int({ min: 55, max: 90 }),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number({ style: "international" }),
      avatar: "PT",
      lastVisit: makeFutureIsoDate(-faker.number.int({ min: 1, max: 45 })),
      metrics: {
        date: new Date().toISOString().slice(0, 10),
        weight,
        height,
        bmi,
        bodyFat: faker.number.float({ min: 15, max: 45, fractionDigits: 1 }),
        muscleMass: faker.number.float({ min: 20, max: 42, fractionDigits: 1 }),
        bodyWater: faker.number.float({ min: 42, max: 63, fractionDigits: 1 }),
        metabolicAge: faker.number.int({ min: 35, max: 95 }),
        leanBodyMass: faker.number.float({
          min: 32,
          max: 64,
          fractionDigits: 1,
        }),
        inorganicSalts: faker.number.float({
          min: 1.8,
          max: 4.9,
          fractionDigits: 1,
        }),
        smm: faker.number.float({ min: 16, max: 40, fractionDigits: 1 }),
        bfp: faker.number.float({ min: 15, max: 42, fractionDigits: 1 }),
      },
      metricsHistory: [],
    };

    newPatient.metricsHistory = [newPatient.metrics];
    newPatient.avatar = buildAvatar(newPatient.name);
    patientRepository.add(newPatient);
  }
};

export const fakeDataLoop = {
  ensureDemoData: async (): Promise<void> => {
    if (demoSeeded) {
      return;
    }

    demoSeeded = true;
    await seedPatientBatch(24);
  },
  start: (
    batchSize: number = 3,
    intervalMs: number = 3000,
  ): { running: boolean } => {
    if (generatorTimer) {
      return { running: true };
    }

    generatorTimer = setInterval(() => {
      void createBatch(batchSize);
    }, intervalMs);

    return { running: true };
  },
  stop: (): { running: boolean } => {
    if (generatorTimer) {
      clearInterval(generatorTimer);
      generatorTimer = null;
    }

    return { running: false };
  },
  runBatch: async (batchSize: number = 3): Promise<void> => {
    await createBatch(batchSize);
  },
};
