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
  const seconds = connected_seconds % 60;
  return `${Math.floor(connected_seconds / 60)} min, ${seconds} sec`;
}

export default function Playerlist() {
  const players = useSelector<State, IAdminUIRemoteState["players"]>((s) => s.players);
  const [healths, healthDeltaTimeWindowMs] = useSelector<
    State,
    [IAdminUIState["healthDelta"], IAdminUIState["healthDeltaWindowMs"]]
  >((s) => [s.healthDelta, s.healthDeltaWindowMs]);
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
          {Object.values(players).map((player) => {
            const [, previousHealth, currentHealth] = healths[player.id] ?? [-1, player.health, player.health];
            const healthDelta = currentHealth - previousHealth;
            return (
              <TableRow key={player.id}>
                <TableCell>
                  <code>{player.name}</code>
                </TableCell>
                <TableCell style={{ fontSize: "2rem" }}>{COUNTRY_FLAG_EMOJI_UNICODE_MAP[player.country]}</TableCell>
                <TableCell>
                  {player.health.toPrecision(4)} ({healthDelta} in the last {healthDeltaTimeWindowMs} milliseconds)
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
