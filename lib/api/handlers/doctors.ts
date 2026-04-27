import {
  parsePaginationQuery,
  paginate,
  type QueryParams,
} from "@/lib/api/pagination";
import {
  badRequest,
  created,
  notFound,
  ok,
  type ApiResult,
} from "@/lib/api/types";
import { doctorCreateSchema, zodIssuesToDetails } from "@/lib/api/validation";
import { doctorService } from "@/lib/services/doctorService";
import type { Doctor } from "@/lib/domain";
import { publishRealtimeEvent } from "@/lib/server/realtimeHub";
import { appointmentService } from "@/lib/services/appointmentService";

export const listDoctors = (
  query: QueryParams,
): ApiResult<{
  items: Doctor[];
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

  const paged = paginate(doctorService.list(), paginationResult.data);
  return ok({
    items: paged.data,
    pagination: paged.pagination,
  });
};

export const createDoctor = (body: unknown): ApiResult<Doctor> => {
  const parsed = doctorCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(
      "Invalid doctor payload.",
      zodIssuesToDetails(parsed.error.issues),
    );
  }

  const createdDoctor = doctorService.add(parsed.data);
  publishRealtimeEvent({
    type: "entities_updated",
    entity: "doctors",
    source: "crud",
    timestamp: Date.now(),
  });
  return created(createdDoctor);
};

export const getDoctor = (id: string): ApiResult<Doctor> => {
  const doctor = doctorService.getById(id);
  if (!doctor) {
    return notFound("Doctor not found.");
  }

  return ok(doctor);
};

export const deleteDoctor = (id: string): ApiResult<{ removed: boolean }> => {
  const doctor = doctorService.getById(id);
  if (!doctor) {
    return notFound("Doctor not found.");
  }

  doctorService.remove(id);
  publishRealtimeEvent({
    type: "entities_updated",
    entity: "doctors",
    source: "crud",
    timestamp: Date.now(),
  });
  return ok({ removed: true });
};

export const getDoctorStats = (
  id: string,
): ApiResult<{
  appointmentCount: number;
  cancelledCount: number;
  upcomingCount: number;
}> => {
  const doctor = doctorService.getById(id);
  if (!doctor) {
    return notFound("Doctor not found.");
  }

  const appointments = appointmentService
    .list()
    .filter((appointment) => appointment.doctorName === doctor.name);

  return ok({
    appointmentCount: appointments.length,
    cancelledCount: appointments.filter((item) => item.status === "cancelled")
      .length,
    upcomingCount: appointments.filter((item) => item.status === "upcoming")
      .length,
  });
};
