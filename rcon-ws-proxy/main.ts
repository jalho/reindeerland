import { WebSocketServer, WebSocket, MessageEvent } from "ws";
import log4js from "log4js";
import crypto from "node:crypto";
import http from "node:http";
import syncRcon from "./handlers/interval-sync.js";
import intervalPrune from "./handlers/interval-prune.js";
import { handleUpgrade, handleLogin, IAuthorizedConnection } from "./handlers/auth.js";
import Users from "./stores/Users.js";
import handlePrivateAdminRequest from "./handlers/register-user.js";

const config = {
  /**
   * How often to sync the game state for all clients, in milliseconds.
   */
  rconSyncIntervalMs: 3000,
  /**
   * Public HTTP/WebSocket server listen port. For authentication and business.
   */
  publicApiPort: 80,
  /**
   * Private HTTP server listen port. For system administration (like
   * registering new admin users).
   */
  privateSysAdminPort: 90,
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
      stdout: { type: "stdout", layout: { pattern: "%[[%d] %p [username %X{username}] [client %X{clientId}]%] - %m", type: "pattern" } },
    },
    categories: { default: { appenders: ["stdout"], level: config.logLevel } },
  })
  .getLogger();
const userStore = new Users();

const publicAuthApi = http.createServer();
const privateSysAdminApi = http.createServer((i, o) => handlePrivateAdminRequest(i, o, userStore, logger));
const publicRconSyncServer = new WebSocketServer({ noServer: true });

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

publicAuthApi.on("upgrade", handleUpgrade(logger, publicRconSyncServer));
publicAuthApi.on("request", (req, res) => {
  if (req.method === "POST" && req.url === "/login") {
    handleLogin(logger, req, res, userStore);
  } else {
    logger.warn("Received unknown request for %s %s", req.method, req.url);
    res.writeHead(404);
    res.end();
  }
});

publicRconSyncServer.on("connection", function connection(connection: IAuthorizedConnection) {
  const logger = log4js.getLogger();
  const clientId = crypto.randomUUID();
  logger.addContext("clientId", clientId);
  logger.addContext("username", connection.token.username);

  if (connections[clientId] === undefined) {
    connections[clientId] = { socket: connection.downstream, lastAck: Date.now(), ackListener: null };
  } else throw new Error(`Duplicate client ID ${clientId} detected! This is a bug!`);

  logger.info("New client connected (%d clients connected in total)", publicRconSyncServer.clients.size);

  connection.downstream.on("error", logger.error);
  (<TIdentifiedSocket>connection.downstream).clientId = clientId;
});

publicRconSyncServer.on("listening", () => {
  logger.info("Listening %s", Object.values(publicRconSyncServer.address()).join(":"));
});

publicAuthApi.listen(config.publicApiPort, () => console.log(publicAuthApi.address()));
privateSysAdminApi.listen(config.privateSysAdminPort, () => console.log(privateSysAdminApi.address()));
