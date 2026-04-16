import * as patientRepo from "@/lib/repositories/patientsRepository";

type HealthMetricsHistoryEntry = {
  recordedAt: Date;
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
};

type HealthProgressPatientRow = {
  pid: number;
  name: string;
  age: number;
  doctorNote: string | null;
  healthMetricsHistory: HealthMetricsHistoryEntry[];
};

export type HealthProgressItem = {
  patientId: string;
  patientName: string;
  patientAge: number;
  currentScore: number;
  previousScore: number;
  delta: number;
  currentRecordedAt: string;
  previousRecordedAt: string;
  doctorNote: string;
  explanations: string[];
};

export type HealthProgressResult = {
  improvedPatients: HealthProgressItem[];
  patientsNeedingAttention: HealthProgressItem[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const scoreMetrics = (entry: HealthMetricsHistoryEntry): number => {
  const heightMeters = entry.height > 0 ? entry.height / 100 : 0;
  const targetWeight =
    heightMeters > 0 ? 22 * heightMeters * heightMeters : entry.weight;

  const bmiDistance = Math.abs(entry.BMI - 24.5);
  const bmiScore = clamp(16 - bmiDistance * 1.6, 0, 16);

  const weightDistancePct =
    targetWeight > 0
      ? (Math.abs(entry.weight - targetWeight) / targetWeight) * 100
      : 100;
  const weightScore = clamp(16 - weightDistancePct * 0.5, 0, 16);

  const heightScore =
    entry.height >= 145 && entry.height <= 195
      ? 6
      : entry.height >= 135 && entry.height <= 205
        ? 3
        : 0;

  const bodyFatDistance = Math.abs(entry.bodyFat - 25);
  const bodyFatScore = clamp(12 - bodyFatDistance * 0.55, 0, 12);

  const bfpDistance = Math.abs(entry.BFP - 25);
  const bfpScore = clamp(8 - bfpDistance * 0.35, 0, 8);

  const waterDistance = Math.abs(entry.bodyWater - 55);
  const bodyWaterScore = clamp(10 - waterDistance * 0.5, 0, 10);

  const muscleScore = clamp(entry.muscleMass * 0.33, 0, 10);
  const smmScore = clamp(entry.SMM * 0.27, 0, 8);

  const metabolicAgeScore = clamp(
    8 - Math.abs(entry.metabolicAge - 45) * 0.25,
    0,
    8,
  );

  const leanMassScore = clamp(entry.leanBodyMass * 0.09, 0, 4);
  const inorganicSaltsScore = clamp(entry.inorganicSalts * 0.4, 0, 2);

  return clamp(
    Math.round(
      bmiScore +
        weightScore +
        heightScore +
        bodyFatScore +
        bfpScore +
        bodyWaterScore +
        muscleScore +
        smmScore +
        metabolicAgeScore +
        leanMassScore +
        inorganicSaltsScore,
    ),
    0,
    100,
  );
};

const buildExplanations = (
  previous: HealthMetricsHistoryEntry,
  current: HealthMetricsHistoryEntry,
): string[] => {
  const explanations: string[] = [];

  const weightDelta = current.weight - previous.weight;
  const bmiDelta = current.BMI - previous.BMI;
  const bodyFatDelta = current.bodyFat - previous.bodyFat;
  const metabolicAgeDelta = current.metabolicAge - previous.metabolicAge;

  if (Math.abs(weightDelta) >= 8) {
    explanations.push(
      weightDelta > 0
        ? "Major weight increase since last measurement"
        : "Major weight decrease since last measurement",
    );
  }

  if (Math.abs(bmiDelta) >= 2) {
    explanations.push(
      bmiDelta > 0
        ? "BMI increased significantly"
        : "BMI decreased significantly",
    );
  }

  if (Math.abs(bodyFatDelta) >= 3) {
    explanations.push(
      bodyFatDelta > 0
        ? "Body fat increased notably"
        : "Body fat decreased notably",
    );
  }

  if (Math.abs(metabolicAgeDelta) >= 3) {
    explanations.push(
      metabolicAgeDelta > 0
        ? "Metabolic age worsened"
        : "Metabolic age improved",
    );
  }

  if (explanations.length === 0) {
    explanations.push("No major adverse changes across key metrics");
  }

  return explanations.slice(0, 3);
};

export async function patientHasAtLeastTwoMetricsHistoryRecords(
  patientId: number,
): Promise<boolean> {
  const latestTwo =
    await patientRepo.getLatestTwoHealthMetricsHistoryByPatientId(patientId);

  return latestTwo.length >= 2;
}

const toHealthProgressItem = (
  patient: HealthProgressPatientRow,
): HealthProgressItem => {
  const [current, previous] = patient.healthMetricsHistory;

  const currentScore = scoreMetrics(current);
  const previousScore = scoreMetrics(previous);
  const delta = currentScore - previousScore;

  return {
    patientId: String(patient.pid),
    patientName: patient.name,
    patientAge: patient.age,
    currentScore,
    previousScore,
    delta,
    currentRecordedAt: current.recordedAt.toISOString(),
    previousRecordedAt: previous.recordedAt.toISOString(),
    doctorNote: patient.doctorNote ?? "",
    explanations: buildExplanations(previous, current),
  };
};

export async function getHealthProgressLists(): Promise<HealthProgressResult> {
  const patients = await patientRepo.getAllPatientsForHealthProgress();

  const eligibility = await Promise.all(
    patients.map(async (patient) => ({
      patient,
      eligible: await patientHasAtLeastTwoMetricsHistoryRecords(patient.pid),
    })),
  );

  const eligiblePatients = eligibility
    .filter((item) => item.eligible)
    .map((item) => item.patient)
    .filter((patient) => patient.healthMetricsHistory.length >= 2);

  const items = eligiblePatients.map((patient) =>
    toHealthProgressItem(patient),
  );

  const improvedPatients = items
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta);

  const patientsNeedingAttention = items
    .filter((item) => item.delta <= 0)
    .sort((a, b) => a.delta - b.delta);

  return {
    improvedPatients,
    patientsNeedingAttention,
  };
}
