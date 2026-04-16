"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { patientService } from "@/lib/services/client/patientService";
import type { HealthMetrics, Patient } from "@/lib/domain";
import { metricRanges, validatePatientMetrics } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import HealthProgressQuickButton from "@/components/HealthProgressQuickButton";

type EditableMetricKey = Exclude<keyof HealthMetrics, "date">;

type TrendLineConfig = {
  title: string;
  dataKey: keyof Omit<HealthMetrics, "date">;
  color: string;
  unit: string;
};

const metricKeys: { key: EditableMetricKey; label: string; unit: string }[] = [
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

const trendLines: TrendLineConfig[] = [
  { title: "Weight", dataKey: "weight", color: "#792f2c", unit: "kg" },
  { title: "BMI", dataKey: "bmi", color: "#219ebc", unit: "" },
  { title: "Body Fat", dataKey: "bodyFat", color: "#fb8500", unit: "%" },
  {
    title: "Muscle Mass",
    dataKey: "muscleMass",
    color: "#ffb703",
    unit: "kg",
  },
  {
    title: "Body Water",
    dataKey: "bodyWater",
    color: "#8ecae6",
    unit: "%",
  },
  {
    title: "Metabolic Age",
    dataKey: "metabolicAge",
    color: "#2a9d8f",
    unit: "yrs",
  },
  {
    title: "Lean Body Mass",
    dataKey: "leanBodyMass",
    color: "#9b5de5",
    unit: "kg",
  },
  {
    title: "Inorganic Salts",
    dataKey: "inorganicSalts",
    color: "#f4a261",
    unit: "kg",
  },
  { title: "SMM", dataKey: "smm", color: "#e76f51", unit: "kg" },
  { title: "BFP", dataKey: "bfp", color: "#6d597a", unit: "%" },
];

const formatTooltipDateTime = (label: unknown): string => {
  const parsed = new Date(String(label));

  if (Number.isNaN(parsed.getTime())) {
    return String(label ?? "");
  }

  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PatientDetail = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [saveAttempted, setSaveAttempted] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const loadedPatient = await patientService.getById(id);
        setPatient(loadedPatient ?? null);

        const latestMetrics =
          loadedPatient?.metricsHistory[
            loadedPatient.metricsHistory.length - 1
          ] ??
          loadedPatient?.metrics ??
          null;

        setMetrics(latestMetrics);
        setAge(loadedPatient?.age ?? null);
      } catch {
        setPatient(null);
        toast.error("Failed to load patient details.");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading patient...</p>
      </div>
    );
  }

  if (!patient || !metrics || age === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Patient not found.</p>
      </div>
    );
  }

  const metricValidation = validatePatientMetrics(metrics);
  const fullHistory = patient.metricsHistory;

  const handleSave = async () => {
    setSaveAttempted(true);

    if (!metricValidation.isValid) {
      toast.error("Please fix invalid health metrics before saving.");
      return;
    }

    if (!Number.isFinite(age) || age < 0 || age > 130) {
      toast.error("Please enter a valid age between 0 and 130.");
      return;
    }

    const updatedPatient = await patientService.updateData(id, {
      metrics: {
        ...metrics,
        date: new Date().toISOString(),
      },
      age,
    });

    if (!updatedPatient) {
      toast.error("Unable to update patient metrics.");
      return;
    }

    setPatient(updatedPatient);
    setMetrics(updatedPatient.metrics);
    setAge(updatedPatient.age);
    setEditing(false);
    setSaveAttempted(false);
    toast.success("Metrics updated.");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-foreground border-border rounded-xl"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
          </Button>
          <HealthProgressQuickButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {patient.avatar}
                </div>
                <div>
                  <h1 className="font-display text-xl font-semibold text-foreground">
                    {patient.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Age {patient.age} · Last visit: {patient.lastVisit}
                  </p>
                </div>
              </div>
              {!editing ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-foreground"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
              ) : (
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground"
                    onClick={() => {
                      setEditing(false);
                      setMetrics(patient.metrics);
                      setAge(patient.age);
                      setSaveAttempted(false);
                    }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground"
                    onClick={handleSave}
                  >
                    <Save className="h-3.5 w-3.5 mr-1" /> Save
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mb-5">
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground mb-0.5">Age</p>
              {editing ? (
                <Input
                  type="number"
                  min={0}
                  max={130}
                  step={1}
                  value={age}
                  onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value, 10);
                    setAge(Number.isNaN(parsed) ? 0 : parsed);
                  }}
                  className="h-7 text-sm bg-muted border-border text-foreground font-semibold p-1"
                />
              ) : (
                <p className="text-sm font-semibold text-foreground">{age}</p>
              )}
              {editing &&
                saveAttempted &&
                (!Number.isFinite(age) || age < 0 || age > 130) && (
                  <p className="text-[10px] leading-tight text-destructive">
                    Age must be between 0 and 130.
                  </p>
                )}
            </div>
            {metricKeys.map((metric) => (
              <div
                key={metric.key}
                className="bg-card border border-border rounded-xl p-3"
              >
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  {metric.label}
                </p>
                {editing ? (
                  <div className="space-y-1">
                    <Input
                      type="number"
                      min={metricRanges[metric.key].min}
                      max={metricRanges[metric.key].max}
                      step={
                        metric.key === "height" || metric.key === "metabolicAge"
                          ? 1
                          : 0.1
                      }
                      value={metrics[metric.key] as number}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        setMetrics({
                          ...metrics,
                          [metric.key]: Number.isNaN(parsed) ? 0 : parsed,
                        });
                      }}
                      className="h-7 text-sm bg-muted border-border text-foreground font-semibold p-1"
                    />
                    {saveAttempted && metricValidation.errors[metric.key] && (
                      <p className="text-[10px] leading-tight text-destructive">
                        {metricValidation.errors[metric.key]}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    {metrics[metric.key]}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {metric.unit}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display text-sm font-medium text-foreground">
                  Health Trends
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Combined view of all recorded history entries.
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Hover for date and values
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-3">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={fullHistory}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(0,0%,25%)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    hide
                    stroke="hsl(0,0%,40%)"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    stroke="hsl(0,0%,40%)"
                    tick={{ fontSize: 10 }}
                    width={38}
                  />
                  <Tooltip
                    labelFormatter={formatTooltipDateTime}
                    contentStyle={{
                      backgroundColor: "hsl(0,0%,9%)",
                      border: "1px solid hsl(0,0%,15%)",
                      borderRadius: 8,
                      color: "hsl(0,0%,93%)",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {trendLines.map((line) => (
                    <Line
                      key={line.dataKey}
                      type="monotone"
                      dataKey={line.dataKey}
                      stroke={line.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name={`${line.title}${line.unit ? ` (${line.unit})` : ""}`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDetail;
