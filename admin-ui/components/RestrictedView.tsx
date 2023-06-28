import React from "react";
import { useSelector } from "react-redux";

import Login from "./Login";
import Header from "./Header";
import WorldTool from "./WorldTool";
import Bottom from "./Bottom";
import { MAP_UPSTREAM } from "../constants/upstreams";
import { State } from "../state/store";

/**
 * Show content if connected to upstream, otherwise show login view.
 */
const RestrictedView = (): React.JSX.Element => {
  const [connected, lastSyncTsMs]: [boolean, number | undefined] = useSelector((state: State) => [
    state.connected,
    state.lastSyncTsMs,
  ]);

  const loggedIn: boolean = connected && Number.isInteger(lastSyncTsMs);
  if (!loggedIn) return <Login />;

  return (
    <>
      <Header />
      <WorldTool upstream={MAP_UPSTREAM} />
      <Bottom />
    </>
  );
};

export default RestrictedView;
