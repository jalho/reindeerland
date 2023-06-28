import WebSocket from "ws";
import __Store from "./__Store.js";

/**
 * As of Apr 2023 RustDedicated didn't like getting Date.now() as command ID
 * (i.e. ~13 digits).
 */
const MAX_ID = 100000;

interface IncomingRCONMessage {
  rconMessage: string;
  timestamp: number;
}

abstract class _RCON extends __Store<IRCONPlayer> {
  private _rconCommandIdx = -1;
  private _upstream: WebSocket.WebSocket;

  constructor(remoteSyncIntervalMs: number, upstream: WebSocket) {
    super();
    this._upstream = upstream;
    setInterval(this.sync.bind(this), remoteSyncIntervalMs);
  }

  /**
   * Issue a command via remote RustDedicated RCON WebSocket API.
   *
   * @param command RCON command to send to the remote RustDedicated server
   * @returns raw string output of the command as returned from RustDedicated RCON API
   */
  protected async sendRconCommand(command: string): Promise<IncomingRCONMessage> {
    const id = ++this._rconCommandIdx % MAX_ID;
    return new Promise(async (resolve) => {
      const _receiver = (m: WebSocket.MessageEvent) => {
        const timestamp = Date.now();
        const data = JSON.parse(m.data.toString());
        if (data.Identifier === id) {
          resolve({ rconMessage: data.Message, timestamp });
          this._upstream.removeEventListener("message", _receiver);
        }
      };
      this._upstream.addEventListener("message", _receiver);
      this._upstream.send(JSON.stringify({ Identifier: id, Message: command }));
    });
  }

  /**
   * Sync local cache with remote. E.g. get players on the _RustDedicated_
   * server via RCON remote.
   */
  protected abstract sync(): Promise<void>;
}

export default _RCON;
