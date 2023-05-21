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

const syncRcon = (connections: TConnections, logger: Log4js.Logger) => async () => {
  // construct payload to be sent to all clients
  const syn = crypto.randomUUID();

  const players: IAdminUIRemoteState["players"] = {}; // TODO: get from RCON
  const tcs: IAdminUIRemoteState["tcs"] = {}; // TODO: get from RCON

  const payload: IAdminUIRemoteState & Pick<ISynAck, "syn"> = {
    lastSyncTsMs: Date.now(),
    players,
    tcs,
    syn,
  };

  for (const [clientId, cl] of Object.entries(connections)) {
    // clear old registered ack listener
    const registeredAckListener = connections[clientId].ackListener;
    if (registeredAckListener !== null) {
      connections[clientId].socket.removeEventListener("message", registeredAckListener);
    }

    // register new ack listener
    const newAckListener = makeAckListener(syn, connections[clientId], logger);
    cl.socket.addEventListener("message", newAckListener);
    connections[clientId].ackListener = newAckListener;

    // send
    cl.socket.send(JSON.stringify(payload));
    logger.trace("Sent RCON payload to client, expecting ack");
  }
};

export default syncRcon;
