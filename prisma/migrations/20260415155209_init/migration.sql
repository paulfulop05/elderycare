/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Doctor" (
    "did" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("did")
);

-- CreateTable
CREATE TABLE "Patient" (
    "pid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "doctorNote" TEXT,
    "lastVisit" TIMESTAMP(3),
    "age" INTEGER NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("pid")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "aid" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "doctorId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("aid")
);

-- CreateTable
CREATE TABLE "HealthMetrics" (
    "hmid" SERIAL NOT NULL,
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

    CONSTRAINT "HealthMetrics_pkey" PRIMARY KEY ("hmid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_name_phoneNumber_key" ON "Patient"("name", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HealthMetrics_patientId_key" ON "HealthMetrics"("patientId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("did") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthMetrics" ADD CONSTRAINT "HealthMetrics_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;
