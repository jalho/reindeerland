interface ISynAck<ID = string> {
  /**
   * The ID of the transaction. Acknowledgement must have this same ID.
   */
  syn: ID;

  /**
   * When a `syn` of a transaction (identified with the ID) is received, its
   * sender expects an `ack` with the same ID in response.
   */
  ack: ID;
}

interface IRCONPlayer {
  /** Steam ID */
  id: string;
  /** x, y, z as reported by RustDedicated by RCON command `playerlistpos`. */
  position: [number, number, number];
  health: number;
  rotation: [number, number, number];
  ip_address: string;
  country: string;
  name: string;
  connected_seconds: number;
  ping: number;
}

interface IAdminUIRemoteState {
  /**
   * The last time the remote state was synced, in milliseconds since the epoch.
   */
  lastSyncTsMs: number;

  players: { [id: string]: IRCONPlayer };
  tcs: { [id: string]: Record<string, unknown> };
}

type TAuthHeader = "x-rcon-ws-proxy-username" | "x-rcon-ws-proxy-password";
