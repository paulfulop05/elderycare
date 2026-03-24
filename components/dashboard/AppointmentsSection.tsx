import { useEffect, useMemo, useState } from "react";
import { authService } from "@/lib/services/authService";
import { appointmentService } from "@/lib/services/appointmentService";
import { patientService } from "@/lib/services/patientService";
import type { Appointment, HealthMetrics } from "@/lib/mockData";
import { validatePatientMetrics } from "@/lib/validation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

const emptyMetrics: Omit<HealthMetrics, "date"> = {
  weight: Number.NaN,
  height: Number.NaN,
  bmi: Number.NaN,
  bodyFat: Number.NaN,
  muscleMass: Number.NaN,
  bodyWater: Number.NaN,
  metabolicAge: Number.NaN,
  leanBodyMass: Number.NaN,
  inorganicSalts: Number.NaN,
  smm: Number.NaN,
  bfp: Number.NaN,
};

const metricFields: {
  key: keyof Omit<HealthMetrics, "date">;
  label: string;
  unit: string;
}[] = [
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "height", label: "Height", unit: "cm" },
  { key: "bmi", label: "BMI", unit: "" },
  { key: "bodyFat", label: "Body Fat", unit: "%" },
  { key: "muscleMass", label: "Muscle Mass", unit: "kg" },
  { key: "bodyWater", label: "Body Water", unit: "%" },
  { key: "metabolicAge", label: "Metabolic Age", unit: "yrs" },
  { key: "leanBodyMass", label: "Lean Body Mass", unit: "kg" },
  { key: "inorganicSalts", label: "Inorganic Salts", unit: "kg" },
  { key: "smm", label: "SMM", unit: "kg" },
  { key: "bfp", label: "BFP", unit: "%" },
];

type AppointmentTableProps = {
  items: Appointment[];
  showActions?: boolean;
  onFinish?: (id: string) => void;
  onCancel?: (id: string) => void;
};

const AppointmentTable = ({
  items,
  showActions,
  onFinish,
  onCancel,
}: AppointmentTableProps) => (
  <div className="rounded-xl border border-border overflow-hidden bg-card">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="text-xs text-muted-foreground font-medium py-2">
            Date
          </TableHead>
          <TableHead className="text-xs text-muted-foreground font-medium py-2">
            Time
          </TableHead>
          <TableHead className="text-xs text-muted-foreground font-medium py-2">
            Patient
          </TableHead>
          <TableHead className="text-xs text-muted-foreground font-medium py-2">
            Reason
          </TableHead>
          {showActions && <TableHead className="py-2 text-right" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground py-8 text-sm"
            >
              No appointments
            </TableCell>
          </TableRow>
        ) : (
          items.map((appointment) => (
            <TableRow key={appointment.id} className="hover:bg-muted/20">
              <TableCell className="text-foreground text-sm py-2.5">
                {appointment.date}
              </TableCell>
              <TableCell className="text-foreground text-sm py-2.5">
                {appointment.time}
              </TableCell>
              <TableCell className="text-foreground text-sm py-2.5">
                {appointment.patientName}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm py-2.5">
                {appointment.reason}
              </TableCell>
              {showActions && (
                <TableCell className="py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 h-7 px-2 text-xs"
                      onClick={() => onFinish?.(appointment.id)}
                    >
                      <ClipboardCheck className="h-3.5 w-3.5 mr-1" /> Finish
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                      onClick={() => onCancel?.(appointment.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

const AppointmentsSection = () => {
  const userName = authService.getCurrentUserName();
  const [data, setData] = useState(() => appointmentService.list());
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishingId, setFinishingId] = useState<string | null>(null);
  const [metrics, setMetrics] =
    useState<Omit<HealthMetrics, "date">>(emptyMetrics);
  const [finishAttempted, setFinishAttempted] = useState(false);
  const [touchedMetrics, setTouchedMetrics] = useState<
    Partial<Record<keyof Omit<HealthMetrics, "date">, boolean>>
  >({});

  useEffect(() => {
    const unsubscribe = appointmentService.subscribe(() => {
      setData(appointmentService.list());
    });

    return unsubscribe;
  }, []);

  const metricValidation = useMemo(
    () =>
      validatePatientMetrics({
        ...metrics,
        date: new Date().toISOString().slice(0, 10),
      }),
    [metrics],
  );

  const userAppointments = data.filter((a) => {
    if (a.status === "cancelled") return false;
    return a.doctorName === userName;
  });

  const upcoming = userAppointments.filter((a) => a.status === "upcoming");
  const past = userAppointments.filter((a) => a.status === "past");

  const cancelAppointment = (id: string) => {
    appointmentService.cancel(id);
  };

  const openFinishDialog = (id: string) => {
    setFinishingId(id);
    setMetrics(emptyMetrics);
    setFinishAttempted(false);
    setTouchedMetrics({});
    setFinishOpen(true);
  };

  const handleFinish = () => {
    if (!finishingId) return;
    setFinishAttempted(true);

    if (!metricValidation.isValid) {
      toast.error("Please enter valid health metrics before finishing.");
      return;
    }

    const appointment = data.find((item) => item.id === finishingId);
    if (appointment) {
      const patient = patientService
        .list()
        .find((item) => item.name === appointment.patientName);

      if (patient) {
        patientService.updateMetrics(patient.id, {
          ...metrics,
          date: new Date().toISOString().slice(0, 10),
        });
      }
    }

    appointmentService.finish(finishingId);
    toast.success("Appointment completed & patient data recorded (prototype)");
    setFinishOpen(false);
    setFinishingId(null);
    setFinishAttempted(false);
    setTouchedMetrics({});
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Upcoming
          </h3>
          <Badge className="bg-accent/15 text-accent text-xs h-5 px-1.5">
            {upcoming.length}
          </Badge>
        </div>
        <AppointmentTable
          items={upcoming}
          showActions
          onFinish={openFinishDialog}
          onCancel={cancelAppointment}
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-display text-sm font-semibold text-foreground">
            Past
          </h3>
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {past.length}
          </Badge>
        </div>
        <AppointmentTable items={past} />
      </div>

      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-base text-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-accent" /> Finish
              Appointment
            </DialogTitle>
          </DialogHeader>
          {finishingId && (
            <div className="space-y-3 pt-1">
              <p className="text-sm text-muted-foreground">
                Enter patient health metrics for{" "}
                <span className="text-foreground font-medium">
                  {data.find((a) => a.id === finishingId)?.patientName}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {metricFields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-foreground">
                      {f.label}
                      {f.unit ? ` (${f.unit})` : ""}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={
                        Number.isFinite(metrics[f.key]) ? metrics[f.key] : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsed =
                          value === "" ? Number.NaN : Number.parseFloat(value);

                        setTouchedMetrics((prev) => ({
                          ...prev,
                          [f.key]: true,
                        }));
                        setMetrics((m) => ({
                          ...m,
                          [f.key]: parsed,
                        }));
                      }}
                      onBlur={() =>
                        setTouchedMetrics((prev) => ({
                          ...prev,
                          [f.key]: true,
                        }))
                      }
                      className="h-8 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
                    />
                    {(finishAttempted || touchedMetrics[f.key]) &&
                      metricValidation.errors[f.key] && (
                        <p className="text-xs text-destructive">
                          {metricValidation.errors[f.key]}
                        </p>
                      )}
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                className="w-full bg-accent text-accent-foreground font-medium hover:bg-accent/90"
                onClick={handleFinish}
              >
                Complete & Save Patient Data
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsSection;
