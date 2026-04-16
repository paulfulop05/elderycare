BEGIN;

INSERT INTO "Doctor" ("name", "email", "password", "role", "phoneNumber", "age") VALUES
  ('Ada Fulop', 'ada.fulop@gmail.com', '$2b$10$examplehash1', FALSE, '0789123456', 27),
  ('Donca', 'donca23@yahoo.com', '$2b$10$examplehash2', TRUE, '0789123457', 52),
  ('Doctorita Plushica', 'plush@gmail.com', '$2b$10$examplehash3', FALSE, '0789123458', 39);

INSERT INTO "Patient" ("name", "phoneNumber", "age") VALUES
  ('Fulop Paul', '0759180612', 20),
  ('Harold Mitchell', '0712345678', 80),
  ('Dorothy Garcia', '0721345678', 67);

INSERT INTO "HealthMetrics" (
  "weight",
  "height",
  "BMI",
  "bodyFat",
  "muscleMass",
  "bodyWater",
  "metabolicAge",
  "leanBodyMass",
  "inorganicSalts",
  "SMM",
  "BFP",
  "patientId"
) VALUES
  (68, 162, 25.9, 32, 24, 48, 68, 46.2, 3.1, 21.5, 32, 1),
  (82, 175, 26.8, 28, 30, 52, 74, 59.0, 3.4, 27.0, 28, 2),
  (58, 155, 24.1, 30, 20, 50, 63, 40.6, 2.9, 18.0, 30, 3);

INSERT INTO "Appointment" ("date", "reason", "status", "doctorId", "patientId") VALUES
  ('2026-03-12 09:00:00', 'Routine checkup', 'Pending', 1, 1),
  ('2026-03-14 10:30:00', 'Medication review', 'Pending', 2, 2),
  ('2026-03-18 14:00:00', 'Blood pressure follow-up', 'Pending', 3, 3),
  ('2026-03-20 11:00:00', 'Post-treatment follow-up', 'Pending', 1, 2);

COMMIT;

SELECT * FROM "Doctor"
SELECT * FROM "Patient"
SELECT * FROM "HealthMetrics"
SELECT * FROM "Appointment"