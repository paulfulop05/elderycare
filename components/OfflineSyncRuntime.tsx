"use client";

import { useEffect } from "react";
import { startOfflineSync } from "@/lib/client/offlineSync";
import { startRealtimeClient } from "@/lib/client/realtimeClient";
import { refreshClientDataFromServer } from "@/lib/client/snapshotSync";

export default function OfflineSyncRuntime() {
  useEffect(() => {
    startOfflineSync();
    startRealtimeClient();
    void refreshClientDataFromServer();
  }, []);

  return null;
}
