import { WebSocketServer, WebSocket, MessageEvent } from "ws";
import log4js from "log4js";
import crypto from "node:crypto";
import http from "node:http";
import syncRcon from "./handlers/interval-sync.js";
import intervalPrune from "./handlers/interval-prune.js";
import { handleUpgrade, handleLogin, IAuthorizedConnection } from "./handlers/auth.js";
import Users from "./stores/Users.js";
import handlePrivateAdminRequest from "./handlers/register-user.js";
import RCONPlayers from "./stores/RCONPlayers.js";
import RCONToolcupboards from "./stores/RCONToolcupboards.js";

const config = {
  /**
   * How often to update the state for connected clients, in milliseconds.
   */
  clientUpdateIntervalMs: 300,
  /**
   * How often to sync local RCON stores' caches with the _RustDedicated_ remote
   * RCON state.
   */
  rconSyncIntervalMs: 300,
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
      stdout: {
        type: "stdout",
        layout: { pattern: "%[[%d] %p [username %X{username}] [client %X{clientId}]%] - %m", type: "pattern" },
      },
    },
    categories: { default: { appenders: ["stdout"], level: config.logLevel } },
  })
  .getLogger();

// (private) RCON WebSocket upstream
const { RCON_WS_UPSTREAM_URL, RUST_RCON_PASSWORD } = process.env;
if (!RCON_WS_UPSTREAM_URL) throw new Error(`Expected env var RCON_WS_UPSTREAM_URL`);
if (!RUST_RCON_PASSWORD) throw new Error(`Expected env var RUST_RCON_PASSWORD`);
const rconWsUpstreamUrl: URL = new URL(RCON_WS_UPSTREAM_URL);
rconWsUpstreamUrl.pathname = RUST_RCON_PASSWORD;
const rconWsUpstream = new WebSocket(rconWsUpstreamUrl);
await new Promise((resolve) => rconWsUpstream.on("open", resolve));

// stores
const rconPlayers = new RCONPlayers(config.rconSyncIntervalMs, rconWsUpstream);
const rconTcs = new RCONToolcupboards(config.rconSyncIntervalMs, rconWsUpstream);
const userStore = new Users();
logger.info("Syncing local RCON store caches every %d ms", config.rconSyncIntervalMs);

const publicAuthApi = http.createServer();
const privateSysAdminApi = http.createServer((i, o) => handlePrivateAdminRequest(i, o, userStore, logger));
const publicRconSyncServer = new WebSocketServer({ noServer: true });

const connections: {
  [clientId: string]: { socket: WebSocket; lastAck: number; ackListener: ((event: MessageEvent) => void) | null };
} = {};
export type TConnections = typeof connections;
export type TIdentifiedSocket = WebSocket & { clientId: string };

// send state updates regularly to all clients
setInterval(syncRcon(connections, { rconPlayers, rconTcs }), config.clientUpdateIntervalMs);
logger.info("Sending updates to all clients every %d ms", config.clientUpdateIntervalMs);

// prune dead connections regularly
setInterval(intervalPrune(connections, config.ackMaxAgeMs, logger), config.deadConnectionsPruneIntervalMs);
logger.info("Pruning dead connections every %d ms", config.deadConnectionsPruneIntervalMs);

publicAuthApi.on("upgrade", handleUpgrade(logger, publicRconSyncServer));
publicAuthApi.on("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://admin.reindeerland.eu");
  res.setHeader("Access-Control-Allow-Headers", "x-rcon-ws-proxy-username, x-rcon-ws-proxy-password");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  } else if (req.method === "POST" && req.url === "/login") {
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
