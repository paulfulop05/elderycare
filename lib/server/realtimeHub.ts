import { WebSocketServer } from "ws";
import type WebSocket from "ws";

export type RealtimeEvent = {
  type: "entities_updated" | "batch_generated";
  entity: "appointments" | "doctors" | "patients" | "notes" | "all";
  timestamp: number;
  source: "crud" | "generator";
};

type RealtimeHub = {
  broadcast: (event: RealtimeEvent) => void;
  getPort: () => number;
};

declare global {
  // eslint-disable-next-line no-var
  var __elderyRealtimeHub: RealtimeHub | undefined;
}

const createRealtimeHub = (): RealtimeHub => {
  const port = Number(process.env.WS_PORT ?? 4050);

  if (process.env.NODE_ENV === "test") {
    return {
      broadcast: () => {},
      getPort: () => port,
    };
  }

  const server = new WebSocketServer({ port });

  server.on("listening", () => {
    // Keep log small and explicit since this runs once in process scope.
    // eslint-disable-next-line no-console
    console.log(
      `[realtime] websocket server listening on ws://localhost:${port}`,
    );
  });

  return {
    broadcast: (event: RealtimeEvent) => {
      const payload = JSON.stringify(event);
      server.clients.forEach((client: WebSocket) => {
        if (client.readyState === client.OPEN) {
          client.send(payload);
        }
      });
    },
    getPort: () => port,
  };
};

export const getRealtimeHub = (): RealtimeHub => {
  if (!globalThis.__elderyRealtimeHub) {
    globalThis.__elderyRealtimeHub = createRealtimeHub();
  }

  return globalThis.__elderyRealtimeHub;
};

export const publishRealtimeEvent = (event: RealtimeEvent): void => {
  getRealtimeHub().broadcast(event);
};
