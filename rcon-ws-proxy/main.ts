/// <reference types="../interfaces/typescript/admin-ui.d.ts" />

import { WebSocketServer } from "ws";
import log4js from "log4js";

const OPS: Record<string, () => unknown> = {
  "check health": () => {
    return "I'm alive!";
  },
};

const logger = log4js
  .configure({
    appenders: { stdout: { type: "stdout" } },
    categories: { default: { appenders: ["stdout"], level: "all" } },
  })
  .getLogger();
const wss = new WebSocketServer({ port: 8002 });

wss.on("connection", function connection(ws) {
  ws.on("error", logger.error);

  ws.on("message", function message(data) {
    logger.info("Received message", data);

    let json;
    try {
      json = JSON.parse(data.toString());
      if (!json.id) throw new Error('Expected "id" in message');
      if (!json.op) throw new Error('Expected "op" in message');
      if (!OPS[json.op])
        throw new Error(
          `Unknown operation "${json.op}". Supported operations: ${Object.keys(OPS)
            .map((o) => `"${o}"`)
            .join(", ")}`
        );
    } catch (e) {
      logger.error(e);
      return;
    }

    const payloadConstructor = OPS[json.op];
    const response = {
      payload: payloadConstructor(),
      id: json.id,
    };
    ws.send(JSON.stringify(response));
    logger.info("Sent message");
  });

  setInterval(() => {
    const payload: IAdminUIRemoteState = {
      lastSyncTsMs: Date.now(),
      players: {},
      tcs: {},
    };

    ws.send(JSON.stringify(payload));
  }, 1000);
});

wss.on("listening", () => {
  logger.info("Listening %s", Object.values(wss.address()).join(":"));
});
