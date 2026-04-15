"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ClipboardList,
} from "lucide-react";
import type { Patient, Appointment } from "@/lib/domain";
import { appointmentService } from "@/lib/services/appointmentService";
import { patientService } from "@/lib/services/patientService";
import { noteService } from "@/lib/services/noteService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validateDoctorNote } from "@/lib/validation";
import { cn } from "@/lib/utils";

type WindowRange = {
  start: Date;
  end: Date;
};

type PatientInsight = {
  patient: Patient;
  currentScore: number;
  previousScore: number;
  delta: number;
  explanations: string[];
  currentAppointments: Appointment[];
};

const PERIOD_OPTIONS = [
  { label: "30d", days: 30 },
  { label: "60d", days: 60 },
  { label: "90d", days: 90 },
] as const;

const parseDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  date.setHours(0, 0, 0, 0);
  return date;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const buildRange = (end: Date, days: number): WindowRange => {
  const rangeEnd = new Date(end);
  rangeEnd.setHours(0, 0, 0, 0);

  const rangeStart = new Date(rangeEnd);
  rangeStart.setDate(rangeStart.getDate() - days + 1);

  return { start: rangeStart, end: rangeEnd };
};

const rangeBefore = (range: WindowRange, days: number): WindowRange => {
  const prevEnd = new Date(range.start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  return buildRange(prevEnd, days);
};

const inRange = (value: Date, range: WindowRange) =>
  value >= range.start && value <= range.end;

const latestMetricWithinOrBefore = (patient: Patient, range: WindowRange) => {
  const sorted = [...patient.metricsHistory].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
  );

  const inWindow = sorted.filter((entry) =>
    inRange(parseDate(entry.date), range),
  );
  if (inWindow.length > 0) {
    return inWindow[inWindow.length - 1];
  }

  const beforeWindow = sorted.filter(
    (entry) => parseDate(entry.date).getTime() <= range.end.getTime(),
  );

  return beforeWindow.length > 0
    ? beforeWindow[beforeWindow.length - 1]
    : sorted[sorted.length - 1];
};

const metricDeltaWithinRange = (patient: Patient, range: WindowRange) => {
  const sorted = [...patient.metricsHistory]
    .map((entry) => ({ ...entry, parsedDate: parseDate(entry.date) }))
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
    .filter((entry) => inRange(entry.parsedDate, range));

  if (sorted.length < 2) {
    return { weight: 0, bmi: 0 };
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  return {
    weight: last.weight - first.weight,
    bmi: last.bmi - first.bmi,
  };
};

const patientAppointmentsInRange = (
  patient: Patient,
  range: WindowRange,
  appointmentData: Appointment[],
) =>
  appointmentData.filter((appointment) => {
    if (appointment.patientName !== patient.name) {
      return false;
    }

    return inRange(parseDate(appointment.date), range);
  });

const scorePatientInRange = (
  patient: Patient,
  range: WindowRange,
  appointmentData: Appointment[],
) => {
  const metric = latestMetricWithinOrBefore(patient, range);
  const metricDelta = metricDeltaWithinRange(patient, range);
  const windowAppointments = patientAppointmentsInRange(
    patient,
    range,
    appointmentData,
  );

  const bmiDistance = Math.abs(metric.bmi - 24.5);
  const bmiScore = clamp(20 - bmiDistance * 2, -20, 20);

  const weightStabilityScore =
    Math.abs(metricDelta.weight) <= 2
      ? 10
      : Math.abs(metricDelta.weight) > 4
        ? -10
        : 0;

  const bmiStabilityScore =
    Math.abs(metricDelta.bmi) <= 0.6
      ? 8
      : Math.abs(metricDelta.bmi) > 1.4
        ? -8
        : 0;

  const cancelledCount = windowAppointments.filter(
    (appointment) => appointment.status === "cancelled",
  ).length;

  let appointmentScore = 0;
  if (windowAppointments.length === 0) {
    appointmentScore = -10;
  } else {
    const cancelledRatio = cancelledCount / windowAppointments.length;
    appointmentScore = cancelledRatio > 0.4 ? -15 : cancelledRatio > 0 ? -6 : 8;

    if (windowAppointments.length >= 2) {
      appointmentScore += 4;
    }
  }

  const lastVisitDate = parseDate(patient.lastVisit);
  const daysSinceVisit = Math.floor(
    (range.end.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const recencyScore = daysSinceVisit <= 21 ? 8 : daysSinceVisit > 45 ? -10 : 0;

  const totalScore = clamp(
    Math.round(
      60 +
        bmiScore +
        weightStabilityScore +
        bmiStabilityScore +
        appointmentScore +
        recencyScore,
    ),
    0,
    100,
  );

  return {
    score: totalScore,
    metric,
    metricDelta,
    appointments: windowAppointments,
    daysSinceVisit,
  };
};

const buildExplanations = (
  patient: Patient,
  current: ReturnType<typeof scorePatientInRange>,
  previousMetricBmi: number,
) => {
  const explanations: string[] = [];

  if (Math.abs(current.metricDelta.weight) >= 2.5) {
    explanations.push(
      current.metricDelta.weight < 0
        ? "Significant weight loss detected over recent visits"
        : "Noticeable weight gain detected over recent visits",
    );
  } else if (Math.abs(current.metricDelta.weight) <= 1) {
    explanations.push(
      "Weight trend remained stable during the selected period",
    );
  }

  const currentBmiDistance = Math.abs(current.metric.bmi - 24.5);
  const previousBmiDistance = Math.abs(previousMetricBmi - 24.5);

  if (currentBmiDistance < previousBmiDistance) {
    explanations.push("BMI moved closer to a stable target range");
  } else if (Math.abs(current.metricDelta.bmi) <= 0.4) {
    explanations.push("BMI stabilized after previous fluctuation");
  }

  if (current.appointments.length === 0) {
    explanations.push("No appointments recorded in the selected period");
  } else {
    const cancelled = current.appointments.filter(
      (appointment) => appointment.status === "cancelled",
    ).length;
    if (cancelled >= 1) {
      explanations.push("Missed or cancelled appointments were detected");
    }
  }

  if (current.daysSinceVisit > 35) {
    explanations.push("No recent visit; follow-up may be needed");
  }

  if (explanations.length === 0) {
    explanations.push(
      "Health metrics and appointment behavior remained consistent",
    );
  }

  return explanations.slice(0, 3);
};

const HealthProgress = () => {
  const router = useRouter();
  const patients = patientService.list();
  const appointments = appointmentService.list();
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [notesByPatient, setNotesByPatient] = useState<Record<string, string>>(
    () => noteService.getAllByPatientId(),
  );
  const [noteErrorsByPatient, setNoteErrorsByPatient] = useState<
    Record<string, string>
  >({});

  const handleNoteChange = (patientId: string, value: string) => {
    const result = validateDoctorNote(value);
    if (!result.isValid) {
      setNoteErrorsByPatient((prev) => ({
        ...prev,
        [patientId]: result.error ?? "Invalid note.",
      }));
      return;
    }

    setNoteErrorsByPatient((prev) => {
      const next = { ...prev };
      delete next[patientId];
      return next;
    });

    setNotesByPatient((prev) => ({
      ...prev,
      [patientId]: result.sanitized,
    }));

    noteService.setByPatientId(patientId, result.sanitized);
  };

  const insights = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const currentRange = buildRange(now, periodDays);
    const previousRange = rangeBefore(currentRange, periodDays);

    return patients.map((patient): PatientInsight => {
      const current = scorePatientInRange(patient, currentRange, appointments);
      const previous = scorePatientInRange(
        patient,
        previousRange,
        appointments,
      );

      return {
        patient,
        currentScore: current.score,
        previousScore: previous.score,
        delta: current.score - previous.score,
        explanations: buildExplanations(patient, current, previous.metric.bmi),
        currentAppointments: current.appointments,
      };
    });
  }, [appointments, patients, periodDays]);

  const mostImproved = useMemo(
    () =>
      insights
        .filter((insight) => insight.delta > 0)
        .sort((a, b) => b.delta - a.delta),
    [insights],
  );

  const needingAttention = useMemo(
    () =>
      insights
        .filter((insight) => insight.delta < 0 || insight.currentScore < 48)
        .sort((a, b) => a.delta - b.delta),
    [insights],
  );

  return (
    <div className="min-h-screen bg-background px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Dashboard
          </Button>

          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.days}
                type="button"
                size="sm"
                variant={periodDays === option.days ? "default" : "ghost"}
                className="h-8 rounded-lg px-3"
                onClick={() => setPeriodDays(option.days)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl tracking-tight">
              Health Progress Dashboard
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compares this period with the last one and highlights changes in
              weight, BMI, and appointment consistency.
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Most Improved
                Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mostImproved.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No clear improvements detected for this period.
                </p>
              ) : (
                mostImproved.map((insight) => (
                  <div
                    key={insight.patient.id}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {insight.patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current score {insight.currentScore} · Previous{" "}
                          {insight.previousScore}
                        </p>
                      </div>
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                        +{insight.delta}
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {insight.explanations.map((reason) => (
                        <li key={reason}>- {reason}</li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1.5">
                      <Label className="text-[11px] text-foreground">
                        Doctor note (optional)
                      </Label>
                      <Input
                        placeholder="Add context for this patient"
                        value={notesByPatient[insight.patient.id] ?? ""}
                        onChange={(event) =>
                          handleNoteChange(
                            insight.patient.id,
                            event.target.value,
                          )
                        }
                        className="h-8 text-xs"
                      />
                      {noteErrorsByPatient[insight.patient.id] && (
                        <p className="text-[10px] text-destructive">
                          {noteErrorsByPatient[insight.patient.id]}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingDown className="h-4 w-4 text-destructive" /> Patients
                Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {needingAttention.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No high-risk declines detected for this period.
                </p>
              ) : (
                needingAttention.map((insight) => (
                  <div
                    key={insight.patient.id}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {insight.patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current score {insight.currentScore} · Previous{" "}
                          {insight.previousScore}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "hover:bg-transparent",
                          insight.delta < 0
                            ? "bg-destructive/15 text-destructive"
                            : "bg-amber/20 text-amber-dark",
                        )}
                      >
                        {insight.delta < 0 ? insight.delta : "watch"}
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {insight.explanations.map((reason) => (
                        <li key={reason}>- {reason}</li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1.5">
                      <Label className="text-[11px] text-foreground">
                        Doctor note (optional)
                      </Label>
                      <Input
                        placeholder="Add context for this patient"
                        value={notesByPatient[insight.patient.id] ?? ""}
                        onChange={(event) =>
                          handleNoteChange(
                            insight.patient.id,
                            event.target.value,
                          )
                        }
                        className="h-8 text-xs"
                      />
                      {noteErrorsByPatient[insight.patient.id] && (
                        <p className="text-[10px] text-destructive">
                          {noteErrorsByPatient[insight.patient.id]}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <ClipboardList className="mt-0.5 h-4 w-4" />
              <p>
                Rankings are trend-based, not absolute. The system automatically
                analyzes metric deltas and appointment patterns, then generates
                concise explanations so doctors can triage faster.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthProgress;
