import { configureStore } from "@reduxjs/toolkit";
import serverInfo from "./slices/remote";

const store = configureStore({
  reducer: serverInfo.reducer,
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export default store;
