/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Title from "./Title";
import { useSelector } from "react-redux";
import { State } from "../state/store";
import COUNTRY_FLAG_EMOJI_UNICODE_MAP from "../constants/country-flag-emojis";

function formatConnectedSeconds(connected_seconds: number, online: boolean) {
  if (!online) return "offline";
  const seconds = connected_seconds % 60;
  return `${Math.floor(connected_seconds / 60)} min, ${seconds} sec`;
}

export default function Playerlist() {
  const players = useSelector<State>((s) => s.players) as { [id: string]: IRCONPlayer };
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
            return (
              <TableRow key={player.id}>
                <TableCell>
                  <code>{player.name}</code>
                </TableCell>
                <TableCell style={{ fontSize: "2rem" }}>{COUNTRY_FLAG_EMOJI_UNICODE_MAP[player.country]}</TableCell>
                <TableCell>{player.health.toPrecision(4)}</TableCell>
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
