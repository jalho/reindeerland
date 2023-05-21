import type Log4js from "log4js";
import { TConnections } from "../main.js";

const intervalPrune = (connections: TConnections, ackMaxAgeMs = 3000, logger: Log4js.Logger) => () => {
  const ts = Date.now();
  let pruned = 0;
  for (const [clientId, cl] of Object.entries(connections)) {
    if (ts - cl.lastAck > ackMaxAgeMs) {
      logger.info("Client %s has not acked in %d ms, pruning", clientId, ts - cl.lastAck);
      const registeredAckListener = cl.ackListener;
      if (registeredAckListener !== null) cl.socket.removeEventListener("message", registeredAckListener);
      delete connections[clientId];
      pruned++;
    }
  }
  if (pruned > 0) logger.info("Pruned %d disconnected clients", pruned);
}

export default intervalPrune;
