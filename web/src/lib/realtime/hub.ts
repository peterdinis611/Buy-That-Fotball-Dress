import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:5030/hubs/notifications";

let connection: HubConnection | null = null;
let start: Promise<HubConnection> | null = null;

export function hubUrl() {
  return HUB_URL;
}

export function getHub(): Promise<HubConnection> {
  if (connection?.state === HubConnectionState.Connected) return Promise.resolve(connection);
  if (start) return start;

  const hub = new HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection = hub;
  start = hub
    .start()
    .then(() => hub)
    .catch((error) => {
      start = null;
      connection = null;
      throw error;
    });

  hub.onclose(() => {
    if (connection === hub) {
      connection = null;
      start = null;
    }
  });

  return start;
}

export async function stopHub() {
  const hub = connection;
  connection = null;
  start = null;
  if (hub) await hub.stop();
}
