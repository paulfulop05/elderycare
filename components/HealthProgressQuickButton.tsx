"use client";

import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const HealthProgressQuickButton = () => {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      onClick={() => router.push("/health-progress")}
      aria-label="Open Health Progress"
      title="Open Health Progress"
    >
      <Activity className="h-4 w-4" />
    </Button>
  );
};

export default HealthProgressQuickButton;
