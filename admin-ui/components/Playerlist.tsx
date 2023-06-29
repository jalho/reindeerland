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

export default function Playerlist() {
  const players: any = useSelector<State>((s) => s.players);

  return (
    <>
      <Title>Connected players {Object.keys(players).length}</Title>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>IP address</TableCell>
            <TableCell>Steam ID</TableCell>
            <TableCell align="right">Position on the map</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(players).map((_player) => {
            const player = _player as IRCONPlayer;
            return (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.country}</TableCell>
                <TableCell>{player.ip_address}</TableCell>
                <TableCell>{player.id}</TableCell>
                <TableCell align="right" style={{maxWidth: 10}}>
                  <code >{player.position.join(", ")}</code>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
