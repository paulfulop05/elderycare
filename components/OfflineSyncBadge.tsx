"use client";

import { Cloud, CloudOff, WifiOff } from "lucide-react";
import { useOfflineSyncStatus } from "@/hooks/useOfflineSyncStatus";

const OfflineSyncBadge = () => {
  const snapshot = useOfflineSyncStatus();

  const message =
    snapshot.status === "offline"
      ? "Offline mode"
      : snapshot.status === "server-unreachable"
        ? "Server unreachable"
        : "Online";

  const Icon =
    snapshot.status === "offline"
      ? WifiOff
      : snapshot.status === "server-unreachable"
        ? CloudOff
        : Cloud;

  const className =
    snapshot.status === "online"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-amber-500/15 text-amber-200 border-amber-500/30";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium ${className}`}
      title={
        snapshot.pending > 0
          ? `${snapshot.pending} queued mutation(s) waiting for sync`
          : "All local operations are synchronized"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{message}</span>
      {snapshot.pending > 0 && <span>({snapshot.pending})</span>}
    </div>
  );
};

export default OfflineSyncBadge;
