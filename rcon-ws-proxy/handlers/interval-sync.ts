import Log4js from "log4js";
import { TConnections, TIdentifiedSocket } from "../main.js";

const syncRcon = (downstream: TIdentifiedSocket, logger: Log4js.Logger, connections: TConnections) => () => {
  const payload: IAdminUIRemoteState = {
    lastSyncTsMs: Date.now(),
    players: {},
    tcs: {},
  };

  logger.trace("Sending RCON sync payload to client");
  downstream.send(JSON.stringify(payload));

  // TODO: update connections[clientId].lastAck when client acks
};

export default syncRcon;
