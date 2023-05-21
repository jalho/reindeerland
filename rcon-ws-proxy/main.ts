/// <reference types="../interfaces/typescript/admin-ui.d.ts" />

import { WebSocketServer, WebSocket, MessageEvent } from "ws";
import log4js from "log4js";
import crypto from "node:crypto";
import syncRcon from "./handlers/interval-sync.js";
import intervalPrune from "./handlers/interval-prune.js";

const config = {
  /**
   * How often to sync the game state for all clients, in milliseconds.
   */
  rconSyncIntervalMs: 3000,
  /**
   * WebSocket server listen port.
   */
  wsListenPort: 8002,
  /**
   * How old an ack can be before we prune the connection, in milliseconds.
   */
  ackMaxAgeMs: 3000,
  /**
   * How often to prune dead connections, in milliseconds.
   */
  deadConnectionsPruneIntervalMs: 1000,
  /**
   * Log level (Log4js).
   */
  logLevel: "info" as const,
};

const logger = log4js
  .configure({
    appenders: {
      stdout: { type: "stdout", layout: { pattern: "%[[%d] %p [client %X{clientId}]%] - %m", type: "pattern" } },
    },
    categories: { default: { appenders: ["stdout"], level: config.logLevel } },
  })
  .getLogger();
const wss = new WebSocketServer({ port: config.wsListenPort });

const connections: {
  [clientId: string]: { socket: WebSocket; lastAck: number; ackListener: ((event: MessageEvent) => void) | null };
} = {};
export type TConnections = typeof connections;
export type TIdentifiedSocket = WebSocket & { clientId: string };

// sync game state regularly for all clients
setInterval(syncRcon(connections), config.rconSyncIntervalMs);
logger.info("Syncing game state for all clients every %d ms", config.rconSyncIntervalMs);

// prune dead connections regularly
setInterval(intervalPrune(connections, config.ackMaxAgeMs, logger), config.deadConnectionsPruneIntervalMs);
logger.info("Pruning dead connections every %d ms", config.deadConnectionsPruneIntervalMs);

// TODO: implement authorization

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
});

wss.on("listening", () => {
  logger.info("Listening %s", Object.values(wss.address()).join(":"));
});
