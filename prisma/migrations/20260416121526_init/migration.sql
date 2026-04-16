-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'upcoming';

-- CreateTable
CREATE TABLE "HealthMetricsHistory" (
    "hmhid" SERIAL NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" REAL NOT NULL,
    "height" REAL NOT NULL,
    "BMI" REAL NOT NULL,
    "bodyFat" REAL NOT NULL,
    "muscleMass" REAL NOT NULL,
    "bodyWater" REAL NOT NULL,
    "metabolicAge" REAL NOT NULL,
    "leanBodyMass" REAL NOT NULL,
    "inorganicSalts" REAL NOT NULL,
    "SMM" REAL NOT NULL,
    "BFP" REAL NOT NULL,
    "patientId" INTEGER NOT NULL,

    CONSTRAINT "HealthMetricsHistory_pkey" PRIMARY KEY ("hmhid")
);

-- CreateIndex
CREATE INDEX "HealthMetricsHistory_patientId_recordedAt_idx" ON "HealthMetricsHistory"("patientId", "recordedAt");

-- AddForeignKey
ALTER TABLE "HealthMetricsHistory" ADD CONSTRAINT "HealthMetricsHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;
