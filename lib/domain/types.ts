export type UserRole = "doctor" | "admin";

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
