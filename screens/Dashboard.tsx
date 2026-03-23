"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  CalendarPlus,
  CalendarDays,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/Logo";
import DoctorsTab from "@/components/dashboard/DoctorsTab";
import PatientsTab from "@/components/dashboard/PatientsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import AppointmentsSection from "@/components/dashboard/AppointmentsSection";
import ScheduleDialog from "@/components/dashboard/ScheduleDialog";
import HealthProgressQuickButton from "@/components/HealthProgressQuickButton";
import { clearAuth, getUserRole } from "@/lib/mockData";

const Dashboard = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const role = getUserRole();

  const baseTabs = [
    { id: "appointments", label: "Appointments", icon: CalendarDays },
    { id: "patients", label: "Patients", icon: Users },
    ...(role === "admin"
      ? [{ id: "doctors", label: "Doctors", icon: Stethoscope }]
      : []),
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const tabs = baseTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 px-4 sm:px-6 pt-3">
        <div className="max-w-5xl mx-auto bg-card/90 backdrop-blur-md border border-border rounded-2xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-display text-sm tracking-tight hidden sm:block">
              <span className="font-light text-foreground/70">eldery</span>
              <span className="font-semibold text-accent">care</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <HealthProgressQuickButton />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                clearAuth();
                router.push("/");
              }}
              className="text-muted-foreground h-8 w-8 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-wrap items-center gap-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-sm"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <Button
            size="sm"
            className="bg-accent text-accent-foreground font-medium hover:bg-accent/80 hover:shadow-md active:scale-[0.97] h-8 rounded-xl transition-all duration-200"
            onClick={() => setScheduleOpen(true)}
          >
            <CalendarPlus className="h-3.5 w-3.5 mr-1.5" /> Schedule
          </Button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "appointments" && <AppointmentsSection />}
          {activeTab === "doctors" && <DoctorsTab />}
          {activeTab === "patients" && <PatientsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </motion.div>
      </div>

      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
    </div>
  );
};

export default Dashboard;
