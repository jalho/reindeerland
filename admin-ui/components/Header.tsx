import React from "react";
import { useSelector } from "react-redux";
import { State } from "../state/store";

function formatDate(ts?: number): string {
  if (ts === undefined) return "never";
  return new Date(ts).toLocaleTimeString();
}

function formatConnected(connected: boolean): string {
  return connected ? "Connected" : "Not connected";
}

const Header: React.FC = () => {
  const connected = useSelector((state: State) => state.connected);
  const lastSynced = useSelector((state: State) => state.lastSyncTsMs);

  return (
    <>
      <h1>
        {formatConnected(connected)}, last synced: {formatDate(lastSynced)}
      </h1>
      <p>TODO: Stats and general information here.</p>
    </>
  );
};

export default Header;
