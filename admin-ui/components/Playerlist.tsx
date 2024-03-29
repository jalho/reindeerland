/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../state/store";
import COUNTRY_FLAG_EMOJI_UNICODE_MAP from "../constants/country-flag-emojis";
import { IAdminUIState, selectPlayer, unselectPlayer } from "../state/slices/local";

function formatConnectedSeconds(connected_seconds: number, online: boolean) {
  if (!online) return "offline";
  if (connected_seconds < 60 * 60) {
    const seconds = connected_seconds % 60;
    return `${Math.floor(connected_seconds / 60)} min, ${seconds} sec`;
  } else {
    const minutes = Math.floor(connected_seconds / 60) % 60;
    return `${Math.floor(connected_seconds / (60 * 60))} h, ${minutes} min`;
  }
}

function formatHealthDelta(delta: number): string {
  if (delta === 0) return "=";
  else if (delta > 0) return "+" + delta.toFixed(2).toString();
  else return delta.toFixed(2).toString(); // case delta < 0
}

function sortPlayersPerConnectedTime(a: IRCONPlayer, b: IRCONPlayer): number {
  const _a = a.online ? a.connected_seconds : Infinity;
  const _b = b.online ? b.connected_seconds : Infinity;
  if (_a === _b) return 0;
  return _a - _b;
}

export default function Playerlist() {
  const dispatch = useDispatch();
  const players = useSelector<State, Array<IRCONPlayer>>((s) => Object.values(s.serverInfo.players));
  const currentlySelected = useSelector<State>((s) => s.uiSettings.manuallySelectedPlayers) as any; // TODO: fix typing
  const { healthDeltas, healthDeltaMinThreshold } = useSelector<
    State,
    Pick<IAdminUIState, "healthDeltaWindowMs" | "healthDeltas" | "healthDeltaMinThreshold">
  >((s) => ({
    healthDeltas: s.serverInfo.healthDeltas,
    healthDeltaWindowMs: s.serverInfo.healthDeltaWindowMs,
    healthDeltaMinThreshold: s.uiSettings.healthDeltaMinThreshold,
  }));
  const playerCountTotal = players.length;
  const playerCountOnline = players.filter((player) => player.online).length;
  if (playerCountTotal < 1) return null;

  return (
    <>
      <Title>
        {playerCountOnline} connected players, {playerCountTotal} players in total
      </Title>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>name</TableCell>
            <TableCell>country</TableCell>
            <TableCell>health</TableCell>
            <TableCell>connected</TableCell>
            <TableCell>Steam ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.sort(sortPlayersPerConnectedTime).map((player) => {
            const rowStyleCommon = { opacity: player.online ? 1 : 0.45 };
            const [, previousHealth, currentHealth] = healthDeltas[player.id] ?? [-1, player.health, player.health];
            const healthDelta = currentHealth - previousHealth;
            return (
              <TableRow
                key={player.id}
                onMouseOver={() => dispatch(selectPlayer(player.id))}
                onMouseLeave={() => dispatch(unselectPlayer(player.id))}
                style={{ ...rowStyleCommon, backgroundColor: currentlySelected[player.id] ? "lightgrey" : "white" }}
                onClick={() => navigator.clipboard.writeText(`teleportpos ${player.position.join(",")}`)}
              >
                <TableCell>
                  <code>{player.name}</code>
                </TableCell>
                <TableCell style={{ fontSize: "2rem" }}>{COUNTRY_FLAG_EMOJI_UNICODE_MAP[player.country]}</TableCell>
                <TableCell>
                  {healthDelta !== 0 && Math.abs(healthDelta) >= healthDeltaMinThreshold && (
                    <div
                      style={{ fontSize: "0.75rem", fontWeight: "bolder", color: healthDelta > 0 ? "green" : "red" }}
                    >
                      {formatHealthDelta(healthDelta)}
                    </div>
                  )}
                  <div>{player.health.toPrecision(4)}</div>
                </TableCell>
                <TableCell>{formatConnectedSeconds(player.connected_seconds, player.online)}</TableCell>
                <TableCell>{player.id}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
