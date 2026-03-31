"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateLoginForm } from "@/lib/validation";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { authService } from "@/lib/services/authService";
import type { UserRole } from "@/lib/mockData";

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("doctor");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  const validation = validateLoginForm({ email, password });

  const shouldShowError = (field: "email" | "password") =>
    submitAttempted || Boolean(touched[field]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitAttempted(true);
    if (!validation.isValid) {
      toast.error("Please fix the highlighted login fields.");
      return;
    }

    setEmail(validation.sanitized.email);
    authService.loginAs(role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex hero-fade">
      <div className="hidden lg:flex lg:w-1/2 bg-foreground/95 dark:bg-card flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--accent)/0.18),transparent_48%),radial-gradient(circle_at_80%_30%,hsl(var(--primary)/0.15),transparent_45%)]" />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size={100} className="mx-auto mb-6" />
          <h1 className="font-display text-4xl tracking-tight text-white dark:text-foreground mb-2">
            <span className="font-light">eldery</span>
            <span className="font-semibold text-accent">care</span>
          </h1>
          <p className="text-white/40 dark:text-muted-foreground text-sm font-light">
            Caring for those who once cared for us.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-background">
        <motion.div
          className="surface-card w-full max-w-sm rounded-2xl p-5 sm:p-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
            <Logo size={40} />
            <span className="font-display text-xl tracking-tight">
              <span className="font-light text-foreground/70">eldery</span>
              <span className="font-semibold text-accent">care</span>
            </span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-6 font-light">
            Log in to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground"
              />
              {shouldShowError("email") && validation.errors.email && (
                <p className="text-xs text-destructive">
                  {validation.errors.email}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, password: true }))
                  }
                  className="h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {shouldShowError("password") && validation.errors.password && (
                <p className="text-xs text-destructive">
                  {validation.errors.password}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Log in as</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    role === "doctor"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    role === "admin"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!validation.isValid}
              className="w-full bg-accent text-accent-foreground font-medium hover:bg-accent/80 hover:shadow-md active:scale-[0.97] transition-all duration-200"
            >
              Log In
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
