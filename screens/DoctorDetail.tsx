"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doctorService } from "@/lib/services/doctorService";
import { appointmentService } from "@/lib/services/appointmentService";
import { mockDataService } from "@/lib/services/mockDataService";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import HealthProgressQuickButton from "@/components/HealthProgressQuickButton";
import { toast } from "sonner";

const buildMonthlyVisits = (
  appointments: ReturnType<typeof appointmentService.listByDoctorName>,
) => {
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const monthKeys = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - offset));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      month: monthFormatter.format(date),
      visits: 0,
    };
  });

  const counts = monthKeys.reduce<Record<string, number>>((acc, item) => {
    acc[item.key] = 0;
    return acc;
  }, {});

  appointments.forEach((appointment) => {
    const date = new Date(`${appointment.date}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (key in counts) {
      counts[key] += 1;
    }
  });

  return monthKeys.map((item) => ({
    month: item.month,
    visits: counts[item.key],
  }));
};

const DoctorDetail = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [, setDataVersion] = useState(0);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshData = () => {
    setDataVersion((value) => value + 1);
  };

  useEffect(() => {
    if (isRandomizing) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, 500);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [isRandomizing]);

  useEffect(() => {
    return () => {
      if (isRandomizing) {
        mockDataService.stopContinuousRegeneration();
      }
    };
  }, []);

  const handleRandomizeData = () => {
    if (isRandomizing) {
      mockDataService.stopContinuousRegeneration();
      setIsRandomizing(false);
      toast.success("Randomization stopped.");
    } else {
      mockDataService.startContinuousRegeneration();
      setIsRandomizing(true);
      toast.success("Continuously randomizing mock data. Click to cancel.");
    }
  };

  const handleClearData = () => {
    mockDataService.clear();
    refreshData();
    toast.success("Mock data cleared.");
  };

  const doctor = doctorService.getById(id);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Doctor not found.</p>
      </div>
    );
  }

  const doctorAppointments = appointmentService.listByDoctorName(doctor.name);
  const monthlyVisits = buildMonthlyVisits(doctorAppointments);

  const stats = [
    { label: "Age", value: doctor.age.toString(), icon: Calendar },
    { label: "Email", value: doctor.email, icon: Mail },
    { label: "Phone", value: doctor.phone, icon: Phone },
  ];

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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={isRandomizing ? "default" : "outline"}
              className={`h-8 rounded-xl ${isRandomizing ? "border-0" : "border-border text-foreground"}`}
              onClick={handleRandomizeData}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRandomizing ? "animate-spin" : ""}`} />
              {isRandomizing ? "Stop Randomizing" : "Randomize/Add mock data"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-border text-foreground h-8 rounded-xl"
              onClick={handleClearData}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete mock data
            </Button>
            <HealthProgressQuickButton />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold flex-shrink-0">
                {doctor.avatar}
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold text-foreground">
                  {doctor.name}
                </h1>
                <p className="text-primary text-sm font-medium">
                  Geriatric Medicine
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {doctor.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {doctor.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-card border border-border rounded-xl p-4 text-center"
              >
                <s.icon className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                <p className="text-sm font-semibold text-foreground truncate">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-display text-sm font-medium text-foreground mb-3">
                Monthly Patient Visits
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyVisits}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(0,0%,25%)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(0,0%,40%)"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="hsl(0,0%,40%)" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0,0%,9%)",
                      border: "1px solid hsl(0,0%,15%)",
                      borderRadius: 8,
                      color: "hsl(0,0%,93%)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="visits" fill="#219ebc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-display text-sm font-medium text-foreground mb-3">
                Appointments
              </h3>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs text-muted-foreground font-medium py-2">
                        Patient
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground font-medium py-2">
                        Date
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground font-medium py-2">
                        Reason
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground py-6 text-sm"
                        >
                          No appointments
                        </TableCell>
                      </TableRow>
                    ) : (
                      doctorAppointments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="text-foreground text-sm py-2">
                            {a.patientName}
                          </TableCell>
                          <TableCell className="text-sm py-2">
                            <span className="text-foreground">{a.date}</span>
                            <span className="text-muted-foreground ml-1.5">
                              {a.time}
                            </span>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge
                              variant={
                                a.status === "upcoming"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {a.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDetail;
