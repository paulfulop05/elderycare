"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { patientService } from "@/lib/services/patientService";
import type { HealthMetrics } from "@/lib/mockData";
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

const metricKeys: { key: keyof HealthMetrics; label: string; unit: string }[] =
  [
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

const PatientDetail = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [patient, setPatient] = useState(() => patientService.getById(id));
  const [editing, setEditing] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(
    patient?.metrics ?? null,
  );
  const [saveAttempted, setSaveAttempted] = useState(false);

  if (!patient || !metrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Patient not found.</p>
      </div>
    );
  }

  const metricValidation = validatePatientMetrics(metrics);

  const handleSave = () => {
    setSaveAttempted(true);

    if (!metricValidation.isValid) {
      toast.error("Please fix invalid health metrics before saving.");
      return;
    }

    const updatedPatient = patientService.updateMetrics(id, metrics);
    if (!updatedPatient) {
      toast.error("Unable to update patient metrics.");
      return;
    }

    setPatient(updatedPatient);
    setMetrics(updatedPatient.metrics);

    setEditing(false);
    setSaveAttempted(false);
    toast.success("Metrics updated (prototype)");
  };

  const chartColors = ["#219ebc", "#FFB703", "#fb8500", "#8ecae6"];

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
            {metricKeys.map((m) => (
              <div
                key={m.key}
                className="bg-card border border-border rounded-xl p-3"
              >
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  {m.label}
                </p>
                {editing ? (
                  <div className="space-y-1">
                    <Input
                      type="number"
                      min={metricRanges[m.key].min}
                      max={metricRanges[m.key].max}
                      step={
                        m.key === "height" || m.key === "metabolicAge" ? 1 : 0.1
                      }
                      value={metrics[m.key] as number}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        setMetrics({
                          ...metrics,
                          [m.key]: Number.isNaN(parsed) ? 0 : parsed,
                        });
                      }}
                      className="h-7 text-sm bg-muted border-border text-foreground font-semibold p-1"
                    />
                    {saveAttempted && metricValidation.errors[m.key] && (
                      <p className="text-[10px] leading-tight text-destructive">
                        {metricValidation.errors[m.key]}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    {metrics[m.key]}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {m.unit}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-display text-sm font-medium text-foreground mb-3">
              Health Trends
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Weight & BMI
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={patient.metricsHistory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(0,0%,25%)"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(0,0%,40%)"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="hsl(0,0%,40%)" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0,0%,9%)",
                        border: "1px solid hsl(0,0%,15%)",
                        borderRadius: 8,
                        color: "hsl(0,0%,93%)",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke={chartColors[0]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Weight"
                    />
                    <Line
                      type="monotone"
                      dataKey="bmi"
                      stroke={chartColors[1]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="BMI"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Body Composition
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={patient.metricsHistory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(0,0%,25%)"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(0,0%,40%)"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="hsl(0,0%,40%)" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0,0%,9%)",
                        border: "1px solid hsl(0,0%,15%)",
                        borderRadius: 8,
                        color: "hsl(0,0%,93%)",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="bodyFat"
                      stroke={chartColors[2]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Body Fat %"
                    />
                    <Line
                      type="monotone"
                      dataKey="muscleMass"
                      stroke={chartColors[3]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Muscle Mass"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDetail;
