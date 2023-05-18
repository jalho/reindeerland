/// <reference types="../interfaces/typescript/admin-ui.d.ts" />

import { WebSocketServer, WebSocket } from "ws";
import log4js from "log4js";
import crypto from "node:crypto";
import messageHandler from "./handlers/message.js";
import syncRcon from "./handlers/interval-sync.js";

const config = {
  rconSyncIntervalMs: 3000,
  wsListenPort: 8002,
};

const OPS = {
  "check health": () => {
    return "I'm alive!";
  },
} as const;
export type TOPS = typeof OPS;

const logger = log4js
  .configure({
    appenders: { stdout: { type: "stdout", layout: { pattern: "%[[%d] %p %X{clientId}%] - %m", type: "pattern" } } },
    categories: { default: { appenders: ["stdout"], level: "all" } },
  })
  .getLogger();
const wss = new WebSocketServer({ port: config.wsListenPort });

const connections: { [clientId: string]: { socket: WebSocket; lastAck: number } } = {};
export type TConnections = typeof connections;
export type TIdentifiedSocket = WebSocket & { clientId: string };

wss.on("connection", function connection(downstream) {
  const logger = log4js.getLogger();
  const clientId = crypto.randomUUID();
  logger.addContext("clientId", clientId);

  if (connections[clientId] === undefined) connections[clientId] = { socket: downstream, lastAck: Date.now() };
  else throw new Error(`Duplicate client ID ${clientId} detected! This is a bug!`);

  logger.info("%d clients connected in total", wss.clients.size);

  downstream.on("error", logger.error);
  downstream.on("message", (data) => messageHandler(data, downstream, logger, OPS));
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
