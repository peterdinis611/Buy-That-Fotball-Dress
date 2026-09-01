"use client";

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";

const HUB_PATH = "/hubs/notifications";

function resolveHubUrl() {
  if (process.env.NEXT_PUBLIC_HUB_URL) return process.env.NEXT_PUBLIC_HUB_URL;
  if (typeof window === "undefined") {
    return `${process.env.API_URL ?? "http://localhost:5027"}${HUB_PATH}`;
  }

  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api && !api.startsWith("/")) return `${api.replace(/\/$/, "")}${HUB_PATH}`;

  // Gateway, not :5030 and not the Next rewrite. YARP upgrades WebSockets;
  // `/gateway` rewrites do not.
  return "http://localhost:5027/hubs/notifications";
}

const hush = {
  log(_level: LogLevel, _message: string) {},
};

let connection: HubConnection | null = null;
let start: Promise<HubConnection> | null = null;

export function hubUrl() {
  return resolveHubUrl();
}

export function peekHub() {
  return connection;
}

export function getHub(): Promise<HubConnection> {
  if (connection?.state === HubConnectionState.Connected) return Promise.resolve(connection);
  if (start) return start;
  start = connect();
  return start;
}

function buildHub() {
  return new HubConnectionBuilder()
    .withUrl(resolveHubUrl(), {
      withCredentials: false,
      transport:
        HttpTransportType.WebSockets | HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (ctx) => Math.min(1000 * 2 ** ctx.previousRetryCount, 12_000),
    })
    .configureLogging(hush)
    .build();
}

async function connect(): Promise<HubConnection> {
  let delay = 600;

  for (;;) {
    const hub = buildHub();
    try {
      await hub.start();
      connection = hub;
      hub.onclose(() => {
        if (connection !== hub) return;
        connection = null;
        start = null;
      });
      return hub;
    } catch {
      await sleep(delay);
      delay = Math.min(delay * 2, 12_000);
    }
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
