"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validateDoctorNote } from "@/lib/validation";
import { cn } from "@/lib/utils";
import {
  healthProgressService,
  type HealthProgressCardData,
} from "@/lib/services/client/healthProgressService";
import { noteService } from "@/lib/services/client/noteService";

const HealthProgress = () => {
  const router = useRouter();
  const [improvedPatients, setImprovedPatients] = useState<
    HealthProgressCardData[]
  >([]);
  const [patientsNeedingAttention, setPatientsNeedingAttention] = useState<
    HealthProgressCardData[]
  >([]);
  const [notesByPatient, setNotesByPatient] = useState<Record<string, string>>(
    {},
  );
  const [noteErrorsByPatient, setNoteErrorsByPatient] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await healthProgressService.list();

        setImprovedPatients(result.improvedPatients);
        setPatientsNeedingAttention(result.patientsNeedingAttention);

        const all = [
          ...result.improvedPatients,
          ...result.patientsNeedingAttention,
        ];

        const initialNotes = all.reduce<Record<string, string>>((acc, item) => {
          acc[item.patientId] = item.doctorNote ?? "";
          return acc;
        }, {});

        setNotesByPatient(initialNotes);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

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

    void noteService.setByPatientId(patientId, result.sanitized);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-5 sm:px-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading health progress...</p>
      </div>
    );
  }

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
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl tracking-tight">
              Health Progress Dashboard
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compares each patient's last two measurements, gives a health
              score from 0 to 100, and groups patients into improved or needing
              attention.
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Improved
                Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {improvedPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No patients improved based on the latest two history records.
                </p>
              ) : (
                improvedPatients.map((item) => (
                  <div
                    key={item.patientId}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Age {item.patientAge} · Current score{" "}
                          {item.currentScore} · Previous {item.previousScore}
                        </p>
                      </div>
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                        +{item.delta}
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {item.explanations.map((reason) => (
                        <li key={reason}>- {reason}</li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1.5">
                      <Label className="text-[11px] text-foreground">
                        Doctor note (optional)
                      </Label>
                      <Input
                        placeholder="Add context for this patient"
                        value={notesByPatient[item.patientId] ?? ""}
                        onChange={(event) =>
                          handleNoteChange(item.patientId, event.target.value)
                        }
                        className="h-8 text-xs"
                      />
                      {noteErrorsByPatient[item.patientId] && (
                        <p className="text-[10px] text-destructive">
                          {noteErrorsByPatient[item.patientId]}
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
              {patientsNeedingAttention.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No patients currently flagged for attention.
                </p>
              ) : (
                patientsNeedingAttention.map((item) => (
                  <div
                    key={item.patientId}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Age {item.patientAge} · Current score{" "}
                          {item.currentScore} · Previous {item.previousScore}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "hover:bg-transparent",
                          item.delta < 0
                            ? "bg-destructive/15 text-destructive"
                            : "bg-amber/20 text-amber-dark",
                        )}
                      >
                        {item.delta < 0 ? item.delta : "watch"}
                      </Badge>
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {item.explanations.map((reason) => (
                        <li key={reason}>- {reason}</li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1.5">
                      <Label className="text-[11px] text-foreground">
                        Doctor note (optional)
                      </Label>
                      <Input
                        placeholder="Add context for this patient"
                        value={notesByPatient[item.patientId] ?? ""}
                        onChange={(event) =>
                          handleNoteChange(item.patientId, event.target.value)
                        }
                        className="h-8 text-xs"
                      />
                      {noteErrorsByPatient[item.patientId] && (
                        <p className="text-[10px] text-destructive">
                          {noteErrorsByPatient[item.patientId]}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthProgress;
