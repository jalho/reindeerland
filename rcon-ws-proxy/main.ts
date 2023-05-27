import { WebSocketServer, WebSocket, MessageEvent } from "ws";
import log4js from "log4js";
import crypto from "node:crypto";
import http from "node:http";
import syncRcon from "./handlers/interval-sync.js";
import intervalPrune from "./handlers/interval-prune.js";
import { handleUpgrade, handleLogin } from "./handlers/auth.js";

const config = {
  /**
   * How often to sync the game state for all clients, in milliseconds.
   */
  rconSyncIntervalMs: 3000,
  /**
   * HTTP/WebSocket server listen port.
   */
  listenPort: 80,
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
  logLevel: "debug" as const,
};

const logger = log4js
  .configure({
    appenders: {
      stdout: { type: "stdout", layout: { pattern: "%[[%d] %p [client %X{clientId}]%] - %m", type: "pattern" } },
    },
    categories: { default: { appenders: ["stdout"], level: config.logLevel } },
  })
  .getLogger();
const httpServer = http.createServer();
const wsServer = new WebSocketServer({ noServer: true });

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

httpServer.on("upgrade", handleUpgrade(logger, wsServer));
httpServer.on("request", (req, res) => {
  if (req.method === "POST" && req.url === "/login") {
    handleLogin(logger, req, res);
  } else {
    logger.warn("Received unknown request for %s %s", req.method, req.url);
    res.writeHead(404);
    res.end();
  }
});

wsServer.on("connection", function connection(downstream) {
  const logger = log4js.getLogger();
  const clientId = crypto.randomUUID();
  logger.addContext("clientId", clientId);

  if (connections[clientId] === undefined) {
    connections[clientId] = { socket: downstream, lastAck: Date.now(), ackListener: null };
  } else throw new Error(`Duplicate client ID ${clientId} detected! This is a bug!`);

  logger.info("New client connected (%d clients connected in total)", wsServer.clients.size);

  downstream.on("error", logger.error);
  const identifiedDownstream = downstream as TIdentifiedSocket;
  identifiedDownstream.clientId = clientId;
});

wsServer.on("listening", () => {
  logger.info("Listening %s", Object.values(wsServer.address()).join(":"));
});

httpServer.listen(config.listenPort);
