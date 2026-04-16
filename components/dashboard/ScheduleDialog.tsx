import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appointmentService } from "@/lib/services/client/appointmentService";
import { authService } from "@/lib/services/client/authService";
import { Calendar } from "@/components/ui/calendar";
import { validateScheduleForm } from "@/lib/validation";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScheduleDialog = ({ open, onOpenChange }: ScheduleDialogProps) => {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const patientNameInputRef = useRef<HTMLInputElement | null>(null);
  const patientPhoneInputRef = useRef<HTMLInputElement | null>(null);
  const reasonInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setPatientName("");
    setPatientPhone("");
    setReason("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setSubmitAttempted(false);
    setTouched({});
  };

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    requestAnimationFrame(() => {
      patientNameInputRef.current?.focus();
    });
  }, [open]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) {
      return null;
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(selectedDate);
  }, [selectedDate]);

  const slotsForDate = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const day = selectedDate.getDay();

    // Keep weekends unavailable for now to avoid overbooking in prototype mode.
    if (day === 0 || day === 6) {
      return [];
    }

    return appointmentService.getAvailableSlots();
  }, [selectedDate]);

  const validation = useMemo(
    () =>
      validateScheduleForm({
        patientName,
        patientPhone,
        reason,
        selectedDate,
        selectedTime,
        availableSlots: slotsForDate,
      }),
    [
      patientName,
      patientPhone,
      reason,
      selectedDate,
      selectedTime,
      slotsForDate,
    ],
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    setTouched((prev) => ({ ...prev, selectedDate: true, selectedTime: true }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  const shouldShowError = (field: keyof typeof validation.errors): boolean =>
    submitAttempted || Boolean(touched[field]);

  const visibleErrors = [
    validation.errors.patientName,
    validation.errors.patientPhone,
    validation.errors.reason,
    validation.errors.selectedDate,
    validation.errors.selectedTime,
  ].filter(Boolean) as string[];

  const markPhoneAsRequiredBeforeContinuing = () => {
    if (!validation.sanitized.patientPhone) {
      setTouched((prev) => ({ ...prev, patientPhone: true }));
    }
  };

  const focusNextInput = (
    event: React.KeyboardEvent<HTMLInputElement>,
    next: HTMLInputElement | null,
  ) => {
    if (event.key === "Tab" && !event.shiftKey && next) {
      event.preventDefault();
      next.focus();
    }
  };

  const handleSchedule = async () => {
    setSubmitAttempted(true);

    if (!validation.isValid) {
      toast.error("Please correct the form errors before scheduling.");
      return;
    }

    setPatientName(validation.sanitized.patientName);
    setPatientPhone(validation.sanitized.patientPhone);
    setReason(validation.sanitized.reason);

    const currentUser = authService.getCurrentUser();

    try {
      await appointmentService.schedule({
        doctorId:
          currentUser && currentUser.did > 0
            ? String(currentUser.did)
            : undefined,
        doctorName: currentUser?.name ?? authService.getCurrentUserName(),
        patientName: validation.sanitized.patientName,
        patientPhone: validation.sanitized.patientPhone,
        date: selectedDate!.toISOString().slice(0, 10),
        time: selectedTime,
        reason: validation.sanitized.reason,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to schedule appointment.";
      toast.error(message);
      return;
    }

    toast.success("Appointment scheduled successfully.");
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border text-card-foreground w-[95vw] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-foreground flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-accent" /> Add Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 pt-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Patient Name</Label>
              <Input
                ref={patientNameInputRef}
                autoFocus={open}
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                onPointerDown={(event) => event.currentTarget.focus()}
                onKeyDown={(event) =>
                  focusNextInput(event, patientPhoneInputRef.current)
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, patientName: true }))
                }
                className="h-10 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
              {shouldShowError("patientName") &&
                validation.errors.patientName && (
                  <p className="text-xs text-destructive">
                    {validation.errors.patientName}
                  </p>
                )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Patient Phone</Label>
              <Input
                ref={patientPhoneInputRef}
                placeholder="+1 555-0000"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                onPointerDown={(event) => event.currentTarget.focus()}
                onKeyDown={(event) =>
                  focusNextInput(event, reasonInputRef.current)
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, patientPhone: true }))
                }
                className="h-10 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
              {shouldShowError("patientPhone") &&
                validation.errors.patientPhone && (
                  <p className="text-xs text-destructive">
                    {validation.errors.patientPhone}
                  </p>
                )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Reason</Label>
              <Input
                ref={reasonInputRef}
                placeholder="e.g. Routine checkup, Follow-up"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onPointerDown={(event) => event.currentTarget.focus()}
                onBlur={() => setTouched((prev) => ({ ...prev, reason: true }))}
                className="h-10 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
              {shouldShowError("reason") && validation.errors.reason && (
                <p className="text-xs text-destructive">
                  {validation.errors.reason}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Date</Label>
              <div className="min-h-6 text-sm text-muted-foreground">
                {selectedDateLabel ??
                  "Pick a date to view available time slots"}
              </div>
              {shouldShowError("selectedDate") &&
                validation.errors.selectedDate && (
                  <p className="text-xs text-destructive">
                    {validation.errors.selectedDate}
                  </p>
                )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Time</Label>
              {!selectedDate ? (
                <p className="text-sm text-muted-foreground">
                  Select a date first.
                </p>
              ) : slotsForDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No slots available for this date.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slotsForDate.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`text-xs h-8 px-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedTime === slot
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "border border-border bg-background text-foreground hover:bg-muted hover:border-primary/30 hover:shadow-sm active:scale-[0.97]"
                      }`}
                      onClick={() => {
                        markPhoneAsRequiredBeforeContinuing();
                        setSelectedTime(slot);
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
              {shouldShowError("selectedTime") &&
                validation.errors.selectedTime && (
                  <p className="text-xs text-destructive">
                    {validation.errors.selectedTime}
                  </p>
                )}
            </div>

            <Button
              size="sm"
              className="w-full h-10 bg-accent text-accent-foreground font-medium hover:bg-accent/80 hover:shadow-md active:scale-[0.97] transition-all duration-200"
              onClick={handleSchedule}
            >
              Confirm
            </Button>

            {submitAttempted && visibleErrors.length > 0 && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-3"
              >
                <p className="text-xs font-medium text-destructive">
                  Please fix the following before scheduling:
                </p>
                <ul className="mt-1 space-y-1 text-xs text-destructive">
                  {visibleErrors.map((error) => (
                    <li key={error}>- {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">Calendar</Label>
            <div className="rounded-2xl border border-border bg-muted/50 p-2 sm:p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  markPhoneAsRequiredBeforeContinuing();
                  handleDateSelect(date);
                }}
                disabled={(date) => {
                  const normalized = new Date(date);
                  normalized.setHours(0, 0, 0, 0);
                  return normalized < today;
                }}
                className="w-full rounded-xl border border-border bg-card text-sm shadow-card"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
