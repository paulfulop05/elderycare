import { useState } from "react";
import {
  appointments,
  getCurrentUserName,
  type HealthMetrics,
} from "@/lib/mockData";
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
  weight: 0,
  height: 0,
  bmi: 0,
  bodyFat: 0,
  muscleMass: 0,
  bodyWater: 0,
  metabolicAge: 0,
  leanBodyMass: 0,
  inorganicSalts: 0,
  smm: 0,
  bfp: 0,
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

const AppointmentsSection = () => {
  const userName = getCurrentUserName();
  const [data, setData] = useState(appointments);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishingId, setFinishingId] = useState<string | null>(null);
  const [metrics, setMetrics] =
    useState<Omit<HealthMetrics, "date">>(emptyMetrics);

  const userAppointments = data.filter((a) => {
    if (a.status === "cancelled") return false;
    return a.doctorName === userName;
  });

  const upcoming = userAppointments.filter((a) => a.status === "upcoming");
  const past = userAppointments.filter((a) => a.status === "past");

  const cancelAppointment = (id: string) => {
    setData((d) =>
      d.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a)),
    );
  };

  const openFinishDialog = (id: string) => {
    setFinishingId(id);
    setMetrics(emptyMetrics);
    setFinishOpen(true);
  };

  const handleFinish = () => {
    if (!finishingId) return;
    setData((d) =>
      d.map((a) =>
        a.id === finishingId ? { ...a, status: "past" as const } : a,
      ),
    );
    toast.success("Appointment completed & patient data recorded (prototype)");
    setFinishOpen(false);
    setFinishingId(null);
  };

  const AppointmentTable = ({
    items,
    showCancel,
  }: {
    items: typeof appointments;
    showCancel?: boolean;
  }) => (
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
            {showCancel && <TableHead className="py-2 text-right" />}
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
            items.map((a) => (
              <TableRow key={a.id} className="hover:bg-muted/20">
                <TableCell className="text-foreground text-sm py-2.5">
                  {a.date}
                </TableCell>
                <TableCell className="text-foreground text-sm py-2.5">
                  {a.time}
                </TableCell>
                <TableCell className="text-foreground text-sm py-2.5">
                  {a.patientName}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm py-2.5">
                  {a.reason}
                </TableCell>
                {showCancel && (
                  <TableCell className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10 h-7 px-2 text-xs"
                        onClick={() => openFinishDialog(a.id)}
                      >
                        <ClipboardCheck className="h-3.5 w-3.5 mr-1" /> Finish
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                        onClick={() => cancelAppointment(a.id)}
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
        <AppointmentTable items={upcoming} showCancel />
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
                      value={metrics[f.key] || ""}
                      onChange={(e) =>
                        setMetrics((m) => ({
                          ...m,
                          [f.key]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="h-8 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
                    />
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
