/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import { createSlice, configureStore, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import Upstream from "./Upstream";

const upstream = new Upstream(new URL("ws://localhost:8002"));

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
      const payload = JSON.parse(action.payload);
      if (typeof payload !== "object" || payload === null) {
        return;
      }
      if (!("lastSyncTsMs" in payload)) {
        console.error("Got a message without a 'lastSyncTsMs' timestamp!", payload);
        return;
      }
      Object.assign(state, payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(connectUpstream.fulfilled, (state) => {
      state.connected = true;
    });
  },
});

const connectUpstream = createAsyncThunk("serverInfo/connectUpstream", async () => {
  const socket = await upstream.connect();
  console.log("Connected to upstream!");
  socket.addEventListener("message", (event) => {
    const { syn } = JSON.parse(event.data);
    socket.send(JSON.stringify({ ack: syn }));
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
