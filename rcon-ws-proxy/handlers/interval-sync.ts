import Log4js from "log4js";
import crypto from "node:crypto";
import { TConnections } from "../main.js";
import WebSocket from "ws";
import RCONPlayers from "../stores/RCONPlayers.js";
import RCONToolcupboards from "../stores/RCONToolcupboards.js";

// TODO: log warning after timeout if ack not received
const makeAckListener = (syn: string, connection: TConnections[string], logger: Log4js.Logger) => {
  const listenerRegisterTs = Date.now();
  return (event: WebSocket.MessageEvent): void => {
    const ts = Date.now();
    const { ack } = JSON.parse(event.data.toString());
    if (ack === syn) {
      connection.lastAck = ts;
      logger.trace("Received ack in %d ms", ts - listenerRegisterTs);
    }
  };
};

const syncRcon =
  (
    connections: TConnections,
    stores: {
      rconPlayers: RCONPlayers;
      rconTcs: RCONToolcupboards;
    }
  ) =>
  async () => {
    // construct payload to be sent to all clients
    const syn = crypto.randomUUID();

    const players: IAdminUIRemoteState["players"] = await stores.rconPlayers.findMany();
    const tcs: IAdminUIRemoteState["tcs"] = await stores.rconTcs.findMany();

    const payload: IAdminUIRemoteState & Pick<ISynAck, "syn"> = {
      lastSyncTsMs: Date.now(),
      players,
      tcs,
      syn,
    };

    // TODO: broadcast RCON sync payload to all clients "at once" instead of doing
    // all this for each client one by one... gotta change the dead clients
    // pruning syn-ack mechanism accordingly?
    for (const [clientId, cl] of Object.entries(connections)) {
      const logger = Log4js.getLogger();
      logger.addContext("clientId", clientId);
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
