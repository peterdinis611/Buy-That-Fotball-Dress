import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:5030/hubs/notifications";

let connection: HubConnection | null = null;
let start: Promise<HubConnection> | null = null;

export function hubUrl() {
  return HUB_URL;
}

export function peekHub() {
  return connection;
}

export function getHub(): Promise<HubConnection> {
  if (connection?.state === HubConnectionState.Connected) return Promise.resolve(connection);
  if (start) return start;

  const hub = new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
    })
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
