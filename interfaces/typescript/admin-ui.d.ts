interface IAdminUIRemoteState {
  /**
   * The last time the remote state was synced, in milliseconds since the epoch.
   */
  lastSyncTsMs: number;

  players: {},
  tcs: {},
}
