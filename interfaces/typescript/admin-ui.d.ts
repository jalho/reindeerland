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

interface IAdminUIRemoteState {
  /**
   * The last time the remote state was synced, in milliseconds since the epoch.
   */
  lastSyncTsMs: number;

  players: {};
  tcs: {};
}
