import { badRequest, ok, type ApiResult } from "@/lib/api/types";
import { parseNoteInput } from "@/lib/api/validation";
import { noteService } from "@/lib/services/noteService";
import { publishRealtimeEvent } from "@/lib/server/realtimeHub";

export const listNotes = (): ApiResult<Record<string, string>> =>
  ok(noteService.getAllByPatientId());

export const getPatientNote = (
  patientId: string,
): ApiResult<{ value: string }> => {
  const notesByPatientId = noteService.getAllByPatientId();
  return ok({
    value: notesByPatientId[patientId] ?? "",
  });
};

export const setPatientNote = (
  patientId: string,
  body: unknown,
): ApiResult<{ patientId: string; value: string }> => {
  const parsed = parseNoteInput(body);
  if (!parsed.success) {
    return badRequest("Invalid note payload.", parsed.details);
  }

  noteService.setByPatientId(patientId, parsed.data);
  publishRealtimeEvent({
    type: "entities_updated",
    entity: "notes",
    source: "crud",
    timestamp: Date.now(),
  });
  return ok({
    patientId,
    value: parsed.data,
  });
};
