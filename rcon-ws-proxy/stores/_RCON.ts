import __Store from "./__Store.js";

// TODO: remove this
const dummyData = [
  `SteamID           DisplayName POS                   ROT               
    76561198135242017 jka         (1513.4, 0.1, 1435.5) (-0.6, -0.2, 0.8) `,
  `SteamID           DisplayName POS                   ROT               
    76561198135242017 jka         (1523.4, 0.1, 1435.5) (-0.6, -0.2, 0.8) `,
  `SteamID           DisplayName POS                   ROT               
    76561198135242017 jka         (1533.4, 0.1, 1435.5) (-0.6, -0.2, 0.8) `,
  `SteamID           DisplayName POS                   ROT               
    76561198135242017 jka         (1543.4, 0.1, 1435.5) (-0.6, -0.2, 0.8) `,
];

abstract class _RCON extends __Store<IRCONPlayer> {
  private _tick = 0; // TODO: remove this

  constructor(remoteSyncIntervalMs: number) {
    super();
    setInterval(this.sync.bind(this), remoteSyncIntervalMs);
  }

  /**
   * Issue a command via remote RustDedicated RCON WebSocket API.
   * 
   * @param command RCON command to send to the remote RustDedicated server
   * @returns raw string output of the command as returned from RustDedicated RCON API
   */
  protected async sendRconCommand(command: string): Promise<string> {
    // TODO: implement -- get from actual RCON
    const data = dummyData[this._tick++ % dummyData.length];
    return data;
  }

  /**
   * Sync local cache with remote. E.g. get players on the _RustDedicated_
   * server via RCON remote.
   */
  protected abstract sync(): Promise<void>;
}

export default _RCON;
