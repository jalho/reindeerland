import { WebSocketServer } from 'ws';
import log4js from "log4js";

const OPS = {
  "get server name": () => {
    return "Reindeerland Noob Friendly Weekly";
  }
}

const logger = log4js
  .configure({
    appenders: { stdout: { type: "stdout" } },
    categories: { default: { appenders: ["stdout"], level: "all" } }
  }).getLogger();
const wss = new WebSocketServer({ port: 8002 });

wss.on('connection', function connection(ws) {
  ws.on('error', logger.error);

  ws.on('message', function message(data) {
    logger.info('Received message', data);

    let json;
    try {
      json = JSON.parse(data.toString());
      if (!json.id) throw new Error('Expected "id" in message');
      if (!json.op) throw new Error('Expected "op" in message');
      if (!OPS[json.op]) throw new Error(`Unknown operation "${json.op}"`);
    } catch (e) {
      logger.error(e);
      return;
    }

    const payloadConstructor = OPS[json.op];
    const response = {
      payload: payloadConstructor(),
      id: json.id,
    }
    ws.send(JSON.stringify(response));
    logger.info('Sent message');
  });

  setInterval(() => {
    /**
     * @type IAdminUIRemoteState
     */
    const payload = {
      lastSyncTsMs: Date.now(),
      players: {},
      tcs: {},
    }

    ws.send(JSON.stringify(payload));
  }, 1000);
});

wss.on("listening", () => {
  logger.info("Listening %s", Object.values(wss.address()).join(":"));
});
