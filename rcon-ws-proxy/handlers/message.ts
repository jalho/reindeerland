import WebSocket from "ws";
import type Log4js from "log4js";
import { TOPS } from "../main.js";

function isOp(op: unknown, ops: TOPS): op is keyof TOPS {
  return typeof op === "string" && op in ops;
}

function messageHandler(data: WebSocket.RawData, ws: WebSocket.WebSocket, logger: Log4js.Logger, ops: TOPS) {
  logger.info("Received message", data);

  let json, op;
  try {
    json = JSON.parse(data.toString());
    if (!json.id) throw new Error('Expected "id" in message');
    if (!json.op) throw new Error('Expected "op" in message');
    op = json.op;
    if (!isOp(op, ops))
      throw new Error(
        `Unknown operation "${json.op}". Supported operations: ${Object.keys(ops)
          .map((o) => `"${o}"`)
          .join(", ")}`
      );
  } catch (e) {
    logger.error(e);
    return;
  }

  const payloadConstructor = ops[op];
  const response = {
    payload: payloadConstructor(),
    id: json.id,
  };
  ws.send(JSON.stringify(response));
  logger.info("Sent message");
}

export default messageHandler;
