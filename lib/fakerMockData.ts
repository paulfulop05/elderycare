import { faker } from "@faker-js/faker";
import type {
  Appointment,
  Doctor,
  HealthMetrics,
  Patient,
} from "@/lib/mockData";

const DAY_MS = 24 * 60 * 60 * 1000;

const AVAILABLE_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const toAvatar = (name: string): string =>
  name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

const toMetric = (
  date: Date,
  baselineHeight: number,
  previous?: HealthMetrics,
): HealthMetrics => {
  const weight = faker.number.float({
    min: previous ? Math.max(45, previous.weight - 1.6) : 50,
    max: previous ? Math.min(110, previous.weight + 1.6) : 95,
    fractionDigits: 1,
  });
  const bmi = Number((weight / Math.pow(baselineHeight / 100, 2)).toFixed(1));
  const bodyFat = faker.number.float({ min: 20, max: 42, fractionDigits: 1 });
  const muscleMass = faker.number.float({
    min: 18,
    max: 34,
    fractionDigits: 1,
  });

  return {
    date: formatDate(date),
    weight,
    height: baselineHeight,
    bmi,
    bodyFat,
    muscleMass,
    bodyWater: faker.number.float({ min: 42, max: 58, fractionDigits: 1 }),
    metabolicAge: faker.number.int({ min: 62, max: 86 }),
    leanBodyMass: Number((weight - bodyFat * 0.2).toFixed(1)),
    inorganicSalts: faker.number.float({
      min: 2.6,
      max: 4.0,
      fractionDigits: 2,
    }),
    smm: faker.number.float({ min: 18, max: 30, fractionDigits: 1 }),
    bfp: bodyFat,
  };
};

const createDoctors = (count: number): Doctor[] =>
  Array.from({ length: count }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `Dr. ${firstName} ${lastName}`;

    return {
      id: String(index + 1),
      name,
      age: faker.number.int({ min: 35, max: 66 }),
      email: faker.internet
        .email({ firstName, lastName, provider: "elderycare.com" })
        .toLowerCase(),
      phone: faker.phone.number({ style: "international" }),
      avatar: toAvatar(`${firstName} ${lastName}`),
    };
  });

const createPatients = (count: number): Patient[] =>
  Array.from({ length: count }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const height = faker.number.int({ min: 148, max: 186 });

    const now = Date.now();
    const rawHistory = [3, 2, 1].map((monthsAgo) => {
      const offsetDays = monthsAgo * 30 + faker.number.int({ min: -4, max: 4 });
      return new Date(now - offsetDays * DAY_MS);
    });

    const smoothedHistory = rawHistory.reduce<HealthMetrics[]>((acc, date) => {
      const previous = acc[acc.length - 1];
      acc.push(toMetric(date, height, previous));
      return acc;
    }, []);

    const latestMetric = smoothedHistory[smoothedHistory.length - 1];

    return {
      id: String(index + 1),
      name: fullName,
      age: faker.number.int({ min: 65, max: 89 }),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: faker.phone.number({ style: "international" }),
      avatar: toAvatar(fullName),
      lastVisit: latestMetric.date,
      metrics: latestMetric,
      metricsHistory: smoothedHistory,
    };
  });

const createAppointments = (
  count: number,
  doctors: Doctor[],
  patients: Patient[],
): Appointment[] =>
  Array.from({ length: count }, (_, index) => {
    const doctor = faker.helpers.arrayElement(doctors);
    const patient = faker.helpers.arrayElement(patients);
    const date = faker.date.between({
      from: new Date(Date.now() - 180 * DAY_MS),
      to: new Date(Date.now() + 45 * DAY_MS),
    });
    const status =
      date.getTime() < Date.now()
        ? faker.helpers.weightedArrayElement([
            { value: "past", weight: 8 },
            { value: "cancelled", weight: 2 },
          ])
        : faker.helpers.weightedArrayElement([
            { value: "upcoming", weight: 8 },
            { value: "cancelled", weight: 2 },
          ]);

    return {
      id: String(index + 1),
      doctorName: doctor.name,
      patientName: patient.name,
      date: formatDate(date),
      time: faker.helpers.arrayElement(AVAILABLE_SLOTS),
      status,
      reason: faker.helpers.arrayElement([
        "Routine checkup",
        "Medication review",
        "Blood pressure follow-up",
        "Post-treatment follow-up",
        "Mobility assessment",
        "Nutrition consultation",
        "Chronic pain review",
      ]),
    };
  });

export type GeneratedMockData = {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  availableSlots: string[];
};

export const generateFakerMockData = (seed = Date.now()): GeneratedMockData => {
  faker.seed(seed);

  const doctors = createDoctors(8);
  const patients = createPatients(12);
  const appointments = createAppointments(40, doctors, patients);

  return {
    doctors,
    patients,
    appointments,
    availableSlots: [...AVAILABLE_SLOTS],
  };
};

export const generateRandomAppointments = (
  count: number,
  doctors: Doctor[],
  patients: Patient[],
  seed = Date.now(),
): Appointment[] => {
  faker.seed(seed);
  return createAppointments(count, doctors, patients);
};
