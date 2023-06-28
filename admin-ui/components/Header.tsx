import React from "react";
import { useSelector } from "react-redux";
import { State } from "../state/store";

function formatDate(ts?: number): string {
  if (ts === undefined) return "never";
  return new Date(ts).toLocaleTimeString();
}

const Header: React.FC = () => {
  const { lastSynced, players } = useSelector((state: State) => ({ lastSynced: state.lastSyncTsMs, players: state.players }));

  return (
    <>
      <h1>Last synced: {formatDate(lastSynced)}</h1>
      <p>TODO: General information about the server here.</p>
      <p>{Object.keys(players).length} players on the server.</p>
    </>
  );
};

export default Header;
