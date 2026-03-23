export type UserRole = "doctor" | "admin";

const ROLE_STORAGE_KEY = "elderyCareRole";
const AUTH_STORAGE_KEY = "elderyCareLoggedIn";

const canUseStorage = () => typeof window !== "undefined";

export const getUserRole = (): UserRole => {
  if (!canUseStorage()) {
    return "doctor";
  }

  return (localStorage.getItem(ROLE_STORAGE_KEY) as UserRole) || "doctor";
};

export const setUserRole = (role: UserRole) => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(ROLE_STORAGE_KEY, role);
};

export const setLoggedIn = (value: boolean) => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, value ? "true" : "false");
};

export const isLoggedIn = (): boolean => {
  if (!canUseStorage()) {
    return false;
  }

  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
};

export const clearAuth = () => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
};

export const getCurrentUserName = (): string => {
  const role = getUserRole();
  return role === "admin" ? "Admin" : "Dr. Maria Santos";
};

export interface Doctor {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  avatar: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  avatar: string;
  lastVisit: string;
  metrics: HealthMetrics;
  metricsHistory: HealthMetrics[];
}

export interface HealthMetrics {
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
  bodyWater: number;
  metabolicAge: number;
  leanBodyMass: number;
  inorganicSalts: number;
  smm: number;
  bfp: number;
}

export interface Appointment {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  status: "upcoming" | "past" | "cancelled";
  reason: string;
}

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Maria Santos",
    age: 45,
    email: "maria.santos@elderycare.com",
    phone: "+1 555-0101",
    avatar: "MS",
  },
  {
    id: "2",
    name: "Dr. James Chen",
    age: 52,
    email: "james.chen@elderycare.com",
    phone: "+1 555-0102",
    avatar: "JC",
  },
  {
    id: "3",
    name: "Dr. Aisha Patel",
    age: 39,
    email: "aisha.patel@elderycare.com",
    phone: "+1 555-0103",
    avatar: "AP",
  },
  {
    id: "4",
    name: "Dr. Robert Kim",
    age: 48,
    email: "robert.kim@elderycare.com",
    phone: "+1 555-0104",
    avatar: "RK",
  },
  {
    id: "5",
    name: "Dr. Elena Volkov",
    age: 41,
    email: "elena.volkov@elderycare.com",
    phone: "+1 555-0105",
    avatar: "EV",
  },
  {
    id: "6",
    name: "Dr. David Okafor",
    age: 55,
    email: "david.okafor@elderycare.com",
    phone: "+1 555-0106",
    avatar: "DO",
  },
  {
    id: "7",
    name: "Dr. Sophie Martin",
    age: 37,
    email: "sophie.martin@elderycare.com",
    phone: "+1 555-0107",
    avatar: "SM",
  },
  {
    id: "8",
    name: "Dr. Ahmed Hassan",
    age: 50,
    email: "ahmed.hassan@elderycare.com",
    phone: "+1 555-0108",
    avatar: "AH",
  },
];

export const patients: Patient[] = [
  {
    id: "1",
    name: "Eleanor Thompson",
    age: 72,
    email: "eleanor.t@email.com",
    phone: "+1 555-1001",
    avatar: "ET",
    lastVisit: "2026-03-05",
    metrics: {
      date: "2026-03-05",
      weight: 68,
      height: 162,
      bmi: 25.9,
      bodyFat: 32,
      muscleMass: 24,
      bodyWater: 48,
      metabolicAge: 68,
      leanBodyMass: 46.2,
      inorganicSalts: 3.1,
      smm: 21.5,
      bfp: 32,
    },
    metricsHistory: [
      {
        date: "2026-01-10",
        weight: 72,
        height: 162,
        bmi: 27.4,
        bodyFat: 34,
        muscleMass: 23,
        bodyWater: 46,
        metabolicAge: 71,
        leanBodyMass: 47.5,
        inorganicSalts: 3.0,
        smm: 20.8,
        bfp: 34,
      },
      {
        date: "2026-02-08",
        weight: 70,
        height: 162,
        bmi: 26.7,
        bodyFat: 33,
        muscleMass: 23.5,
        bodyWater: 47,
        metabolicAge: 70,
        leanBodyMass: 46.9,
        inorganicSalts: 3.05,
        smm: 21.2,
        bfp: 33,
      },
      {
        date: "2026-03-05",
        weight: 68,
        height: 162,
        bmi: 25.9,
        bodyFat: 32,
        muscleMass: 24,
        bodyWater: 48,
        metabolicAge: 68,
        leanBodyMass: 46.2,
        inorganicSalts: 3.1,
        smm: 21.5,
        bfp: 32,
      },
    ],
  },
  {
    id: "2",
    name: "Harold Mitchell",
    age: 78,
    email: "harold.m@email.com",
    phone: "+1 555-1002",
    avatar: "HM",
    lastVisit: "2026-03-01",
    metrics: {
      date: "2026-03-01",
      weight: 82,
      height: 175,
      bmi: 26.8,
      bodyFat: 28,
      muscleMass: 30,
      bodyWater: 52,
      metabolicAge: 74,
      leanBodyMass: 59,
      inorganicSalts: 3.4,
      smm: 27,
      bfp: 28,
    },
    metricsHistory: [
      {
        date: "2026-01-15",
        weight: 85,
        height: 175,
        bmi: 27.8,
        bodyFat: 30,
        muscleMass: 29,
        bodyWater: 50,
        metabolicAge: 76,
        leanBodyMass: 59.5,
        inorganicSalts: 3.3,
        smm: 26,
        bfp: 30,
      },
      {
        date: "2026-02-12",
        weight: 83,
        height: 175,
        bmi: 27.1,
        bodyFat: 29,
        muscleMass: 29.5,
        bodyWater: 51,
        metabolicAge: 75,
        leanBodyMass: 58.9,
        inorganicSalts: 3.35,
        smm: 26.5,
        bfp: 29,
      },
      {
        date: "2026-03-01",
        weight: 82,
        height: 175,
        bmi: 26.8,
        bodyFat: 28,
        muscleMass: 30,
        bodyWater: 52,
        metabolicAge: 74,
        leanBodyMass: 59,
        inorganicSalts: 3.4,
        smm: 27,
        bfp: 28,
      },
    ],
  },
  {
    id: "3",
    name: "Dorothy Garcia",
    age: 68,
    email: "dorothy.g@email.com",
    phone: "+1 555-1003",
    avatar: "DG",
    lastVisit: "2026-02-28",
    metrics: {
      date: "2026-02-28",
      weight: 58,
      height: 155,
      bmi: 24.1,
      bodyFat: 30,
      muscleMass: 20,
      bodyWater: 50,
      metabolicAge: 63,
      leanBodyMass: 40.6,
      inorganicSalts: 2.9,
      smm: 18,
      bfp: 30,
    },
    metricsHistory: [
      {
        date: "2026-01-05",
        weight: 60,
        height: 155,
        bmi: 25.0,
        bodyFat: 31,
        muscleMass: 19.5,
        bodyWater: 49,
        metabolicAge: 65,
        leanBodyMass: 41.4,
        inorganicSalts: 2.85,
        smm: 17.5,
        bfp: 31,
      },
      {
        date: "2026-02-02",
        weight: 59,
        height: 155,
        bmi: 24.6,
        bodyFat: 30.5,
        muscleMass: 19.8,
        bodyWater: 49.5,
        metabolicAge: 64,
        leanBodyMass: 41,
        inorganicSalts: 2.88,
        smm: 17.8,
        bfp: 30.5,
      },
      {
        date: "2026-02-28",
        weight: 58,
        height: 155,
        bmi: 24.1,
        bodyFat: 30,
        muscleMass: 20,
        bodyWater: 50,
        metabolicAge: 63,
        leanBodyMass: 40.6,
        inorganicSalts: 2.9,
        smm: 18,
        bfp: 30,
      },
    ],
  },
  {
    id: "4",
    name: "Walter Brooks",
    age: 81,
    email: "walter.b@email.com",
    phone: "+1 555-1004",
    avatar: "WB",
    lastVisit: "2026-03-08",
    metrics: {
      date: "2026-03-08",
      weight: 76,
      height: 170,
      bmi: 26.3,
      bodyFat: 27,
      muscleMass: 28,
      bodyWater: 51,
      metabolicAge: 77,
      leanBodyMass: 55.5,
      inorganicSalts: 3.2,
      smm: 25,
      bfp: 27,
    },
    metricsHistory: [
      {
        date: "2026-01-20",
        weight: 78,
        height: 170,
        bmi: 27.0,
        bodyFat: 29,
        muscleMass: 27,
        bodyWater: 49,
        metabolicAge: 79,
        leanBodyMass: 55.4,
        inorganicSalts: 3.1,
        smm: 24,
        bfp: 29,
      },
      {
        date: "2026-02-18",
        weight: 77,
        height: 170,
        bmi: 26.6,
        bodyFat: 28,
        muscleMass: 27.5,
        bodyWater: 50,
        metabolicAge: 78,
        leanBodyMass: 55.4,
        inorganicSalts: 3.15,
        smm: 24.5,
        bfp: 28,
      },
      {
        date: "2026-03-08",
        weight: 76,
        height: 170,
        bmi: 26.3,
        bodyFat: 27,
        muscleMass: 28,
        bodyWater: 51,
        metabolicAge: 77,
        leanBodyMass: 55.5,
        inorganicSalts: 3.2,
        smm: 25,
        bfp: 27,
      },
    ],
  },
  {
    id: "5",
    name: "Margaret Wilson",
    age: 74,
    email: "margaret.w@email.com",
    phone: "+1 555-1005",
    avatar: "MW",
    lastVisit: "2026-03-03",
    metrics: {
      date: "2026-03-03",
      weight: 64,
      height: 160,
      bmi: 25.0,
      bodyFat: 31,
      muscleMass: 22,
      bodyWater: 49,
      metabolicAge: 70,
      leanBodyMass: 44.2,
      inorganicSalts: 3.0,
      smm: 19.8,
      bfp: 31,
    },
    metricsHistory: [
      {
        date: "2026-01-08",
        weight: 67,
        height: 160,
        bmi: 26.2,
        bodyFat: 33,
        muscleMass: 21,
        bodyWater: 47,
        metabolicAge: 73,
        leanBodyMass: 44.9,
        inorganicSalts: 2.9,
        smm: 19,
        bfp: 33,
      },
      {
        date: "2026-02-05",
        weight: 65.5,
        height: 160,
        bmi: 25.6,
        bodyFat: 32,
        muscleMass: 21.5,
        bodyWater: 48,
        metabolicAge: 71,
        leanBodyMass: 44.5,
        inorganicSalts: 2.95,
        smm: 19.4,
        bfp: 32,
      },
      {
        date: "2026-03-03",
        weight: 64,
        height: 160,
        bmi: 25.0,
        bodyFat: 31,
        muscleMass: 22,
        bodyWater: 49,
        metabolicAge: 70,
        leanBodyMass: 44.2,
        inorganicSalts: 3.0,
        smm: 19.8,
        bfp: 31,
      },
    ],
  },
];

export const appointments: Appointment[] = [
  {
    id: "1",
    doctorName: "Dr. Maria Santos",
    patientName: "Eleanor Thompson",
    date: "2026-03-15",
    time: "09:00",
    status: "upcoming",
    reason: "Routine checkup",
  },
  {
    id: "2",
    doctorName: "Dr. James Chen",
    patientName: "Harold Mitchell",
    date: "2026-03-18",
    time: "14:30",
    status: "upcoming",
    reason: "Blood pressure follow-up",
  },
  {
    id: "3",
    doctorName: "Dr. Aisha Patel",
    patientName: "Dorothy Garcia",
    date: "2026-03-20",
    time: "11:00",
    status: "upcoming",
    reason: "Medication review",
  },
  {
    id: "4",
    doctorName: "Dr. Maria Santos",
    patientName: "Walter Brooks",
    date: "2026-02-10",
    time: "10:00",
    status: "past",
    reason: "Physical therapy consultation",
  },
  {
    id: "5",
    doctorName: "Dr. Robert Kim",
    patientName: "Margaret Wilson",
    date: "2026-02-15",
    time: "15:00",
    status: "past",
    reason: "Post-surgery follow-up",
  },
  {
    id: "6",
    doctorName: "Dr. Elena Volkov",
    patientName: "Eleanor Thompson",
    date: "2026-01-20",
    time: "09:30",
    status: "past",
    reason: "Lab results review",
  },
  {
    id: "7",
    doctorName: "Dr. David Okafor",
    patientName: "Harold Mitchell",
    date: "2026-03-22",
    time: "13:00",
    status: "upcoming",
    reason: "Cardiac assessment",
  },
  {
    id: "8",
    doctorName: "Dr. Sophie Martin",
    patientName: "Dorothy Garcia",
    date: "2026-01-05",
    time: "10:30",
    status: "past",
    reason: "Annual wellness exam",
  },
];

export const availableSlots = [
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
