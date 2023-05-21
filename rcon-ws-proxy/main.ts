/// <reference types="../interfaces/typescript/admin-ui.d.ts" />

import { WebSocketServer, WebSocket, MessageEvent } from "ws";
import log4js from "log4js";
import crypto from "node:crypto";
import syncRcon from "./handlers/interval-sync.js";

const config = {
  rconSyncIntervalMs: 3000,
  wsListenPort: 8002,
};

const logger = log4js
  .configure({
    appenders: { stdout: { type: "stdout", layout: { pattern: "%[[%d] %p [client %X{clientId}]%] - %m", type: "pattern" } } },
    categories: { default: { appenders: ["stdout"], level: "all" } },
  })
  .getLogger();
const wss = new WebSocketServer({ port: config.wsListenPort });

const connections: {
  [clientId: string]: { socket: WebSocket; lastAck: number; ackListener: ((event: MessageEvent) => void) | null };
} = {};
export type TConnections = typeof connections;
export type TIdentifiedSocket = WebSocket & { clientId: string };

wss.on("connection", function connection(downstream) {
  const logger = log4js.getLogger();
  const clientId = crypto.randomUUID();
  logger.addContext("clientId", clientId);

  if (connections[clientId] === undefined) {
    connections[clientId] = { socket: downstream, lastAck: Date.now(), ackListener: null };
  } else throw new Error(`Duplicate client ID ${clientId} detected! This is a bug!`);

  logger.info("New client connected (%d clients connected in total)", wss.clients.size);

  downstream.on("error", logger.error);
  const identifiedDownstream = downstream as TIdentifiedSocket;
  identifiedDownstream.clientId = clientId;

  setInterval(syncRcon(identifiedDownstream, logger, connections), config.rconSyncIntervalMs);

  // TODO: prune dead connections based on lastAck in regular interval
});

wss.on("listening", () => {
  logger.info(
    "Listening %s. Syncing RCON every %d ms for every connected client.",
    Object.values(wss.address()).join(":"),
    config.rconSyncIntervalMs
  );
});
