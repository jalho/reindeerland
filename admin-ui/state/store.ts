/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import { createSlice, configureStore, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import Upstream, { IConnectUpstreamCredentials } from "./Upstream";
import { RCON_UPSTREAM_LOGIN, RCON_UPSTREAM_WS } from "../constants/upstreams";

const upstream = new Upstream(RCON_UPSTREAM_LOGIN, RCON_UPSTREAM_WS);

export interface IAdminUIState {
  connected: boolean;
  /**
   * Health of each player before and currently.
   */
  healthDeltas: { [playerId: string]: [timestampBefore: number, valueBefore: number, valueNow: number] };
  /**
   * Time window for which changes in health are accumulated per player.
   */
  healthDeltaWindowMs: number;
  /**
   * Minimum value for player's health delta within a time window required
   * to trigger functionality in UI (e.g. highlight it briefly by flashing an
   * element or something).
   */
  healthDeltaMinThreshold: number;
  /**
   * Whether to show TCs on the map.
   */
  showTcs: boolean;
  /**
   * Last positions of players.
   */
  playerTrails: { [id: string]: Array<IRCONPlayer["position"]> };
  /**
   * How many last positions of each player to include in trail.
   */
  maxPlayerTrailLength: number;
}

const initialState: IAdminUIRemoteState & IAdminUIState = {
  lastSyncTsMs: -1,
  connected: false,
  players: {},
  tcs: {},
  healthDeltas: {},
  healthDeltaWindowMs: 1000,
  healthDeltaMinThreshold: 5,
  showTcs: true,
  playerTrails: {},
  maxPlayerTrailLength: 200,
};

const serverInfo = createSlice({
  name: "serverInfo",
  initialState,
  reducers: {
    messageReceived: (state, action: PayloadAction<any>) => {
      const remoteUpdatePayload: IAdminUIRemoteState = JSON.parse(action.payload);

      /**
       * For each player in remote update payload
       *  1) update health delta for accumulating time window
       *  2) update trails (i.e. last positions on the map)
       */
      for (const player of Object.values(remoteUpdatePayload.players)) {
        // healthDelta
        // init
        if (!state.healthDeltas[player.id]) {
          state.healthDeltas[player.id] = [remoteUpdatePayload.lastSyncTsMs, player.health, player.health];
        }
        // update if time window is full
        else if (remoteUpdatePayload.lastSyncTsMs - state.healthDeltas[player.id][0] > state.healthDeltaWindowMs) {
          const [, , oldHealth] = state.healthDeltas[player.id];
          state.healthDeltas[player.id] = [remoteUpdatePayload.lastSyncTsMs, oldHealth, player.health];
        }

        // trail
        if (!state.playerTrails[player.id]) state.playerTrails[player.id] = [player.position]; // init
        // update
        else {
          if (state.playerTrails[player.id].length > state.maxPlayerTrailLength) state.playerTrails[player.id].shift();
          state.playerTrails[player.id].push(player.position);
        }
      }

      Object.assign(state, remoteUpdatePayload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(connectUpstream.fulfilled, (state) => {
      state.connected = true;
    });
  },
});

/**
 * Create a WebSocket connection to the upstream, and register a message
 * listener that updates the global (Redux) state per received messages.
 */
const connectUpstream = createAsyncThunk<void, IConnectUpstreamCredentials>(
  "serverInfo/connectUpstream",
  async (credentials) => {
    const socket = await upstream.connect(credentials);
    console.log("Connected to upstream!");

    socket.addEventListener("message", (event) => {
      // send "ack" for each received message -- upstream uses the information
      // to prune dead connections
      const { syn } = JSON.parse(event.data);
      socket.send(JSON.stringify({ ack: syn }));

      // update global state
      store.dispatch(serverInfo.actions.messageReceived(event.data));
    });
    console.log("Message listener attached!");
  }
);

const store = configureStore({
  reducer: serverInfo.reducer,
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
export { connectUpstream };

export default store;
