"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heart, Calendar, Users, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const features = [
  {
    icon: Calendar,
    title: "Schedule Management",
    desc: "Doctors manage their own appointments and schedules effortlessly.",
  },
  {
    icon: Users,
    title: "Patient Tracking",
    desc: "Track patient health metrics and maintain detailed records.",
  },
  {
    icon: Activity,
    title: "Health Analytics",
    desc: "Monitor health trends with detailed metrics and charts.",
  },
  {
    icon: Heart,
    title: "Admin Oversight",
    desc: "Admins manage the doctor roster and platform configuration.",
  },
];

const Landing = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background hero-fade">
      <section className="relative overflow-hidden bg-foreground dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="surface-card flex items-center justify-between rounded-2xl px-4 sm:px-5 py-2.5">
            <div className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="font-display text-lg tracking-tight">
                <span className="font-light text-white/80">eldery</span>
                <span className="font-semibold text-accent">care</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-accent text-accent-foreground font-medium hover:bg-accent/80 hover:shadow-md active:scale-[0.97] rounded-xl transition-all duration-200"
                onClick={() => router.push("/login")}
              >
                Log In <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </nav>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-28 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Logo size={80} className="mx-auto mb-8" />
            <h1 className="font-display text-4xl md:text-6xl tracking-tight text-white mb-4">
              <span className="font-light">eldery</span>
              <span className="font-semibold text-accent">care</span>
            </h1>
            <p className="text-white/40 text-lg md:text-xl font-light mb-6">
              Caring for those who once cared for us.
            </p>
            <p className="text-white/30 max-w-xl mx-auto mb-10 leading-relaxed text-sm md:text-base font-light">
              A healthcare platform for geriatric doctors and administrators.
              Manage schedules, track patient health metrics, and deliver the
              best elderly care.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                className="bg-accent text-accent-foreground font-medium px-6 hover:bg-accent/80 hover:shadow-md active:scale-[0.97] rounded-xl transition-all duration-200"
                onClick={() => router.push("/login")}
              >
                Log In <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl font-semibold text-center mb-12 text-foreground tracking-tight">
          Why <span className="text-accent">elderyCare</span>?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="surface-card lift-hover rounded-xl p-5"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-display text-sm font-medium mb-1 text-card-foreground">
                {f.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed font-light">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
