import { executeGraphQL } from "@/lib/client/graphql";
import { doctorService } from "@/lib/services/doctorService";
import { patientService } from "@/lib/services/patientService";
import { appointmentService } from "@/lib/services/appointmentService";
import { noteService } from "@/lib/services/noteService";
import type { Doctor, Patient, Appointment } from "@/lib/domain";

const LARGE_PAGE_SIZE = 500;

export const refreshClientDataFromServer = async (): Promise<void> => {
  const result = await executeGraphQL<{
    doctors: { items: Doctor[] };
    patients: { items: Patient[] };
    appointments: { items: Appointment[] };
    notes: { patientId: string; value: string }[];
  }>(
    `query RefreshSnapshot($pageSize: Int!) {
      doctors(page: 1, pageSize: $pageSize) { items { id name age email phone avatar } }
      patients(page: 1, pageSize: $pageSize) { items { id name age email phone avatar lastVisit metrics { date weight height bmi bodyFat muscleMass bodyWater metabolicAge leanBodyMass inorganicSalts smm bfp } metricsHistory { date weight height bmi bodyFat muscleMass bodyWater metabolicAge leanBodyMass inorganicSalts smm bfp } } }
      appointments(page: 1, pageSize: $pageSize) { items { id doctorName patientName date time status reason } }
      notes { patientId value }
    }`,
    { pageSize: LARGE_PAGE_SIZE },
  );

  console.log(
    "[snapshot] doctors:",
    result.doctors.items.length,
    "patients:",
    result.patients.items.length,
    "appointments:",
    result.appointments.items.length,
  );

  doctorService.replaceAll(result.doctors.items);
  patientService.replaceAll(result.patients.items);
  appointmentService.replaceAll(result.appointments.items);
  noteService.replaceAll(
    result.notes.reduce<Record<string, string>>((accumulator, entry) => {
      accumulator[entry.patientId] = entry.value;
      return accumulator;
    }, {}),
  );
};
