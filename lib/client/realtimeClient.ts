import { refreshClientDataFromServer } from "@/lib/client/snapshotSync";

let started = false;
let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;

const connect = () => {
  if (typeof window === "undefined") {
    return;
  }

  const wsPort = Number(process.env.NEXT_PUBLIC_WS_PORT ?? 4050);
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const target = `${protocol}://${window.location.hostname}:${wsPort}`;

  socket = new WebSocket(target);

  socket.onopen = () => {
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  socket.onmessage = () => {
    void refreshClientDataFromServer();
  };

  socket.onclose = () => {
    reconnectTimer = window.setTimeout(() => {
      connect();
    }, 1500);
  };
};

export const startRealtimeClient = (): void => {
  if (started) {
    return;
  }

  started = true;
  connect();
};
