import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { availableSlots } from "@/lib/mockData";
import { Calendar } from "@/components/ui/calendar";
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

  const resetForm = () => {
    setPatientName("");
    setPatientPhone("");
    setReason("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

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

    return availableSlots;
  }, [selectedDate]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (!selectedTime) {
      return;
    }

    if (!slotsForDate.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [selectedTime, slotsForDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleSchedule = () => {
    if (!patientName.trim()) {
      toast.error("Please enter the patient name.");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select an appointment date.");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select an appointment time.");
      return;
    }

    toast.success("Appointment scheduled successfully! (prototype)");
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                placeholder="Enter patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="h-10 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Patient Phone</Label>
              <Input
                placeholder="+1 555-0000"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="h-10 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Reason</Label>
              <Input
                placeholder="e.g. Routine checkup, Follow-up"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Date</Label>
              <div className="min-h-6 text-sm text-muted-foreground">
                {selectedDateLabel ??
                  "Pick a date to view available time slots"}
              </div>
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
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              disabled={!patientName.trim() || !selectedDate || !selectedTime}
              size="sm"
              className="w-full h-10 bg-accent text-accent-foreground font-medium hover:bg-accent/80 hover:shadow-md active:scale-[0.97] transition-all duration-200"
              onClick={handleSchedule}
            >
              Confirm
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-foreground">Calendar</Label>
            <div className="rounded-2xl border border-border bg-muted/50 p-2 sm:p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
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
