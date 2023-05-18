/// <reference types="../interfaces/typescript/admin-ui.d.ts" />

import { WebSocketServer } from "ws";
import log4js from "log4js";
import messageHandler from "./handlers/message.js";
import syncRcon from "./handlers/interval-sync.js";

const OPS = {
  "check health": () => {
    return "I'm alive!";
  },
} as const;
export type TOPS = typeof OPS;

const logger = log4js
  .configure({
    appenders: { stdout: { type: "stdout" } },
    categories: { default: { appenders: ["stdout"], level: "all" } },
  })
  .getLogger();
const wss = new WebSocketServer({ port: 8002 });

wss.on("connection", function connection(downstream) {
  downstream.on("error", logger.error);

  downstream.on("message", (data) => messageHandler(data, downstream, logger, OPS));

  setInterval(syncRcon(downstream), 1000);
});

wss.on("listening", () => {
  logger.info("Listening %s", Object.values(wss.address()).join(":"));
});
