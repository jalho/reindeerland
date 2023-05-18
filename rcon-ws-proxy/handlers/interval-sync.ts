import type WebSocket from "ws";

const syncRcon = (downstream: WebSocket.WebSocket) => () => {
  const payload: IAdminUIRemoteState = {
    lastSyncTsMs: Date.now(),
    players: {},
    tcs: {},
  };

  downstream.send(JSON.stringify(payload));
};

export default syncRcon;
