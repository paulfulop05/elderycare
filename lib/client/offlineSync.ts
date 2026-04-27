import { executeGraphQL } from "@/lib/client/graphql";

type SyncStatus = "online" | "offline" | "server-unreachable";

type QueuedMutation = {
  id: string;
  query: string;
  variables?: Record<string, unknown>;
  queuedAt: number;
  retries: number;
};

type SyncSnapshot = {
  status: SyncStatus;
  pending: number;
  lastSyncAt: number | null;
};

type SyncListener = (snapshot: SyncSnapshot) => void;

const STORAGE_KEY = "elderycare.offline.mutations";
const STORAGE_SYNC_KEY = "elderycare.offline.sync";
const MAX_RETRIES = 6;
const FLUSH_INTERVAL_MS = 7000;

let started = false;
let flushInFlight = false;
let flushInterval: number | null = null;
const listeners = new Set<SyncListener>();

const fallbackSnapshot: SyncSnapshot = {
  status: "online",
  pending: 0,
  lastSyncAt: null,
};

const randomId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isBrowser = () => typeof window !== "undefined";

const isNetworkFailure = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const lower = error.message.toLowerCase();
  return lower.includes("network") || lower.includes("failed to fetch");
};

const readQueue = (): QueuedMutation[] => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as QueuedMutation[];
  } catch {
    return [];
  }
};

const writeQueue = (queue: QueuedMutation[]): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

const readSnapshot = (): SyncSnapshot => {
  if (!isBrowser()) {
    return fallbackSnapshot;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_SYNC_KEY);
    if (!raw) {
      return {
        ...fallbackSnapshot,
        pending: readQueue().length,
      };
    }

    const parsed = JSON.parse(raw) as SyncSnapshot;
    return {
      status: parsed.status,
      pending: readQueue().length,
      lastSyncAt: parsed.lastSyncAt,
    };
  } catch {
    return {
      ...fallbackSnapshot,
      pending: readQueue().length,
    };
  }
};

const writeSnapshot = (next: Partial<SyncSnapshot>): void => {
  if (!isBrowser()) {
    return;
  }

  const current = readSnapshot();
  const merged: SyncSnapshot = {
    status: next.status ?? current.status,
    pending: next.pending ?? current.pending,
    lastSyncAt:
      next.lastSyncAt === undefined ? current.lastSyncAt : next.lastSyncAt,
  };

  window.localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(merged));
  listeners.forEach((listener) => {
    listener(merged);
  });
};

const performMutation = async (mutation: QueuedMutation): Promise<void> => {
  await executeGraphQL(mutation.query, mutation.variables);
};

const tryReachabilityProbe = async (): Promise<boolean> => {
  try {
    await executeGraphQL(
      `query ReachabilityProbe { doctors(page: 1, pageSize: 1) { pagination { page } } }`,
    );
    return true;
  } catch {
    return false;
  }
};

export const getOfflineSyncSnapshot = (): SyncSnapshot => readSnapshot();

export const subscribeOfflineSync = (listener: SyncListener): (() => void) => {
  listeners.add(listener);
  listener(readSnapshot());

  return () => {
    listeners.delete(listener);
  };
};

export const flushOfflineQueue = async (): Promise<void> => {
  if (!isBrowser() || flushInFlight) {
    return;
  }

  if (!navigator.onLine) {
    writeSnapshot({ status: "offline", pending: readQueue().length });
    return;
  }

  flushInFlight = true;
  let queue = readQueue();

  if (queue.length === 0) {
    writeSnapshot({ status: "online", pending: 0, lastSyncAt: Date.now() });
    flushInFlight = false;
    return;
  }

  const nextQueue: QueuedMutation[] = [];

  for (const mutation of queue) {
    try {
      await performMutation(mutation);
    } catch (error) {
      if (!isNetworkFailure(error)) {
        continue;
      }

      const retried = {
        ...mutation,
        retries: mutation.retries + 1,
      };

      if (retried.retries < MAX_RETRIES) {
        nextQueue.push(retried);
      }

      writeQueue([...nextQueue, ...queue.slice(queue.indexOf(mutation) + 1)]);
      writeSnapshot({
        status: "server-unreachable",
        pending: readQueue().length,
      });
      flushInFlight = false;
      return;
    }
  }

  writeQueue(nextQueue);
  writeSnapshot({
    status: "online",
    pending: nextQueue.length,
    lastSyncAt: Date.now(),
  });
  flushInFlight = false;
};

export const enqueueOfflineMutation = async (
  query: string,
  variables?: Record<string, unknown>,
): Promise<void> => {
  if (!isBrowser()) {
    return;
  }

  const mutation: QueuedMutation = {
    id: randomId(),
    query,
    variables,
    queuedAt: Date.now(),
    retries: 0,
  };

  if (!navigator.onLine) {
    const queue = readQueue();
    queue.push(mutation);
    writeQueue(queue);
    writeSnapshot({ status: "offline", pending: queue.length });
    return;
  }

  try {
    await performMutation(mutation);
    writeSnapshot({
      status: "online",
      pending: readQueue().length,
      lastSyncAt: Date.now(),
    });
  } catch (error) {
    if (!isNetworkFailure(error)) {
      return;
    }

    const reachable = await tryReachabilityProbe();
    const queue = readQueue();
    queue.push(mutation);
    writeQueue(queue);

    writeSnapshot({
      status: reachable ? "online" : "server-unreachable",
      pending: queue.length,
    });
  }
};

export const startOfflineSync = (): void => {
  if (!isBrowser() || started) {
    return;
  }

  started = true;

  const onOnline = () => {
    void flushOfflineQueue();
  };

  const onOffline = () => {
    writeSnapshot({ status: "offline", pending: readQueue().length });
  };

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  flushInterval = window.setInterval(() => {
    void flushOfflineQueue();
  }, FLUSH_INTERVAL_MS);

  writeSnapshot({
    pending: readQueue().length,
    status: navigator.onLine ? "online" : "offline",
  });
  void flushOfflineQueue();
};
