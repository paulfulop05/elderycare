"use client";

import { useEffect, useState } from "react";
import {
  getOfflineSyncSnapshot,
  subscribeOfflineSync,
} from "@/lib/client/offlineSync";

export const useOfflineSyncStatus = () => {
  const [snapshot, setSnapshot] = useState(getOfflineSyncSnapshot);

  useEffect(() => subscribeOfflineSync(setSnapshot), []);

  return snapshot;
};
