import Log4js from "log4js";
import crypto from "node:crypto";
import { TConnections, TIdentifiedSocket } from "../main.js";
import WebSocket from "ws";

// TODO: log warning after timeout if ack not received
const makeAckListener = (syn: string, connection: TConnections[string], logger: Log4js.Logger) => {
  const listenerRegisterTs = Date.now();
  return (event: WebSocket.MessageEvent): void => {
    const ts = Date.now();
    const { ack } = JSON.parse(event.data.toString());
    if (ack == syn) {
      connection.lastAck = ts;
      logger.trace("Received ack in %d ms", ts - listenerRegisterTs);
    }
  };
};

const syncRcon = (downstream: TIdentifiedSocket, logger: Log4js.Logger, connections: TConnections) => () => {
  // clear old registered ack listener
  const registeredAckListener = connections[downstream.clientId].ackListener;
  if (registeredAckListener !== null) {
    connections[downstream.clientId].socket.removeEventListener("message", registeredAckListener);
  }

  // construct payload
  const syn = crypto.randomUUID();
  const payload: IAdminUIRemoteState & Pick<ISynAck, "syn"> = {
    lastSyncTsMs: Date.now(),
    players: {},
    tcs: {},
    syn,
  };

  // register new ack listener
  const newAckListener = makeAckListener(syn, connections[downstream.clientId], logger);
  downstream.addEventListener("message", newAckListener);
  connections[downstream.clientId].ackListener = newAckListener;

  // send
  downstream.send(JSON.stringify(payload));
  logger.trace("Sent RCON payload to client, expecting ack");
};

export default syncRcon;
