import {
  parsePaginationQuery,
  paginate,
  type QueryParams,
} from "@/lib/api/pagination";
import { badRequest, notFound, ok, type ApiResult } from "@/lib/api/types";
import { parsePatientMetrics } from "@/lib/api/validation";
import { patientService } from "@/lib/services/patientService";
import type { Appointment, HealthMetrics, Patient } from "@/lib/domain";
import { appointmentService } from "@/lib/services/appointmentService";
import { publishRealtimeEvent } from "@/lib/server/realtimeHub";

export const listPatients = (
  query: QueryParams,
): ApiResult<{
  items: Patient[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}> => {
  const paginationResult = parsePaginationQuery(query);
  if (!paginationResult.success) {
    return badRequest("Invalid pagination query.", paginationResult.details);
  }

  const search = query.search?.trim().toLowerCase();
  const source = search
    ? patientService
        .list()
        .filter((patient) => patient.name.toLowerCase().includes(search))
    : patientService.list();

  const paged = paginate(source, paginationResult.data);
  return ok({
    items: paged.data,
    pagination: paged.pagination,
  });
};

export const getPatientMetrics = (id: string): ApiResult<HealthMetrics> => {
  const patient = patientService.getById(id);
  if (!patient) {
    return notFound("Patient not found.");
  }

  return ok(patient.metrics);
};

export const updatePatientMetrics = (
  id: string,
  body: unknown,
): ApiResult<Patient> => {
  const parsedMetrics = parsePatientMetrics(body);
  if (!parsedMetrics.success) {
    return badRequest("Invalid metrics payload.", parsedMetrics.details);
  }

  const updated = patientService.updateMetrics(id, parsedMetrics.data);
  if (!updated) {
    return notFound("Patient not found.");
  }

  publishRealtimeEvent({
    type: "entities_updated",
    entity: "patients",
    source: "crud",
    timestamp: Date.now(),
  });

  return ok(updated);
};

export const getPatientMetricsHistory = (
  id: string,
): ApiResult<{ items: HealthMetrics[] }> => {
  const patient = patientService.getById(id);
  if (!patient) {
    return notFound("Patient not found.");
  }

  return ok({ items: patient.metricsHistory });
};

export const deletePatientMetric = (
  id: string,
  date: string,
): ApiResult<Patient> => {
  const updated = patientService.removeMetricByDate(id, date);
  if (!updated) {
    return notFound("Patient not found.");
  }

  publishRealtimeEvent({
    type: "entities_updated",
    entity: "patients",
    source: "crud",
    timestamp: Date.now(),
  });

  return ok(updated);
};

export const getPatientStats = (
  id: string,
): ApiResult<{
  appointmentCount: number;
  cancelledCount: number;
  latestBmi: number;
  metricsEntries: number;
}> => {
  const patient = patientService.getById(id);
  if (!patient) {
    return notFound("Patient not found.");
  }

  const appointments = appointmentService
    .list()
    .filter(
      (appointment: Appointment) => appointment.patientName === patient.name,
    );

  return ok({
    appointmentCount: appointments.length,
    cancelledCount: appointments.filter(
      (item: Appointment) => item.status === "cancelled",
    ).length,
    latestBmi: patient.metrics.bmi,
    metricsEntries: patient.metricsHistory.length,
  });
};
