import { createSlice, configureStore, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

const serverInfo = createSlice({
  name: "serverInfo",
  initialState: {
    serverName: "Reindeerland",
  },
  reducers: {
    nameUpdateReceived: (state, payload: PayloadAction<string>) => {
      state.serverName = payload.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getServerName.fulfilled, (state, action) => {
      state.serverName = action.payload;
    });
  },
});
const getServerName = createAsyncThunk("serverInfo/getServerName", async () => {
  const response = await fetch("http://localhost:8001/server-name");
  return await response.text();
});

const store = configureStore({
  reducer: serverInfo.reducer,
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
export const { nameUpdateReceived } = serverInfo.actions;
export { getServerName };

export default store;
