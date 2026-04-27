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
import {
  appointmentActionSchema,
  appointmentCreateSchema,
  zodIssuesToDetails,
} from "@/lib/api/validation";
import { appointmentService } from "@/lib/services/appointmentService";
import type { Appointment } from "@/lib/domain";
import { publishRealtimeEvent } from "@/lib/server/realtimeHub";

export const listAppointments = (
  query: QueryParams,
): ApiResult<{
  items: Appointment[];
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

  const doctorName = query.doctorName?.trim();
  const patientName = query.patientName?.trim().toLowerCase();
  const status = query.status?.trim();
  const fromDate = query.fromDate?.trim();
  const toDate = query.toDate?.trim();

  let source = doctorName
    ? appointmentService.listByDoctorName(doctorName)
    : appointmentService.list();

  if (patientName) {
    source = source.filter((appointment) =>
      appointment.patientName.toLowerCase().includes(patientName),
    );
  }

  if (status === "upcoming" || status === "past" || status === "cancelled") {
    source = source.filter((appointment) => appointment.status === status);
  }

  if (fromDate) {
    source = source.filter((appointment) => appointment.date >= fromDate);
  }

  if (toDate) {
    source = source.filter((appointment) => appointment.date <= toDate);
  }

  const paged = paginate(source, paginationResult.data);

  return ok({
    items: paged.data,
    pagination: paged.pagination,
  });
};

export const createAppointment = (body: unknown): ApiResult<Appointment> => {
  const parsed = appointmentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(
      "Invalid appointment payload.",
      zodIssuesToDetails(parsed.error.issues),
    );
  }

  const appointment = appointmentService.schedule(parsed.data);
  publishRealtimeEvent({
    type: "entities_updated",
    entity: "appointments",
    source: "crud",
    timestamp: Date.now(),
  });

  return created(appointment);
};

export const updateAppointment = (
  id: string,
  body: unknown,
): ApiResult<Appointment> => {
  const parsed = appointmentActionSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(
      "Invalid appointment action payload.",
      zodIssuesToDetails(parsed.error.issues),
    );
  }

  const updated =
    parsed.data.action === "cancel"
      ? appointmentService.cancel(id)
      : appointmentService.finish(id);

  if (!updated) {
    return notFound("Appointment not found.");
  }

  publishRealtimeEvent({
    type: "entities_updated",
    entity: "appointments",
    source: "crud",
    timestamp: Date.now(),
  });

  return ok(updated);
};

export const listAvailableSlots = (): ApiResult<string[]> =>
  ok(appointmentService.getAvailableSlots());
