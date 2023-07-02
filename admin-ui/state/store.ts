import { configureStore } from "@reduxjs/toolkit";
import serverInfo from "./slices/remote";
import uiSettings from "./slices/local";

const store = configureStore({
  reducer: {
    serverInfo,
    uiSettings,
  },
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export default store;
