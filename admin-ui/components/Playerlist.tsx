/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";
import { useSelector } from "react-redux";
import { IAdminUIState, State } from "../state/store";
import COUNTRY_FLAG_EMOJI_UNICODE_MAP from "../constants/country-flag-emojis";

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
  const players = useSelector<State, IAdminUIRemoteState["players"]>((s) => s.players);
  const { healthDeltas, healthDeltaMinThreshold } = useSelector<
    State,
    Pick<IAdminUIState, "healthDeltaWindowMs" | "healthDeltas" | "healthDeltaMinThreshold">
  >((s) => ({
    healthDeltas: s.healthDeltas,
    healthDeltaWindowMs: s.healthDeltaWindowMs,
    healthDeltaMinThreshold: s.healthDeltaMinThreshold,
  }));
  const playerCountTotal = Object.keys(players).length;
  const playerCountOnline = Object.values(players).filter((player) => player.online).length;
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
          {Object.values(players)
            .sort(sortPlayersPerConnectedTime)
            .map((player) => {
              const [, previousHealth, currentHealth] = healthDeltas[player.id] ?? [-1, player.health, player.health];
              const healthDelta = currentHealth - previousHealth;
              return (
                <TableRow key={player.id}>
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
