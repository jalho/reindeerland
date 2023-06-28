/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import { createSlice, configureStore, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import Upstream from "./Upstream";
import { RCON_UPSTREAM_LOGIN, RCON_UPSTREAM_WS } from "../constants/upstreams";

const upstream = new Upstream(RCON_UPSTREAM_LOGIN, RCON_UPSTREAM_WS);

interface IAdminUIState {
  connected: boolean;
}

const initialState: Partial<IAdminUIRemoteState> & IAdminUIState = {
  lastSyncTsMs: undefined,
  connected: false,
};

const serverInfo = createSlice({
  name: "serverInfo",
  initialState,
  reducers: {
    messageReceived: (state, action: PayloadAction<any>) => {
      const payload: IAdminUIRemoteState = JSON.parse(action.payload);
      Object.assign(state, payload);
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
const connectUpstream = createAsyncThunk("serverInfo/connectUpstream", async () => {
  const socket = await upstream.connect();
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
});

const store = configureStore({
  reducer: serverInfo.reducer,
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
export { connectUpstream };

export default store;
