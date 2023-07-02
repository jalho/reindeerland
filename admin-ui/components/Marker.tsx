/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import React from "react";
import { useSelector } from "react-redux";
import { State } from "../state/store";
import HomeIcon from "@mui/icons-material/Home";
import BoyIcon from '@mui/icons-material/Boy';

const PLAYER_MARKER_RADIUS = 15;
const TC_MARKER_RADIUS = 15;
const TOOLTIP_OFFSET = 10;

interface IMarker<Data> {
  scale: number;
  gameworldOrigin: number;
  /** x, z, y */
  markerGameworldCoordinates: [number, number, number];
  data: Data;
}

function positionOnMap(
  scale: number,
  gameworldOrigin: number,
  gameWorld_x: number,
  gameWorld_y: number
): [left: number, top: number] {
  return [scale * (gameworldOrigin + gameWorld_x), scale * (gameworldOrigin - gameWorld_y)];
}

function formatTcLabel(tc: IRCONToolCupboard): string {
  let str: string = "";
  if (tc.destroyed) str += "destroyed ";
  str += "TC";
  if (!tc.destroyed) str += ` with ${tc.authed_players_count} players authorized`;
  return str;
}

const Marker = (props: IMarker<IRCONPlayer | IRCONToolCupboard>): React.JSX.Element | null => {
  if (!props.markerGameworldCoordinates) return null;
  const { tcMaxAuthedPlayersThreshold } = useSelector<State, Pick<State, "tcMaxAuthedPlayersThreshold">>((s) => ({
    tcMaxAuthedPlayersThreshold: s.tcMaxAuthedPlayersThreshold,
  }));

  const [x, z, y] = props.markerGameworldCoordinates;
  const [hovered, setHovered] = React.useState<boolean>(false);

  const [left, top] = positionOnMap(props.scale, props.gameworldOrigin, x, y);

  let active: boolean;
  let activeColor: string;
  let label: string;
  let zIndex: number;
  let tooltipTextColor: string = "white";
  let icon: JSX.Element;
  // case player
  if ("online" in props.data) {
    active = props.data.online;
    activeColor = "red";
    label = props.data.name;
    zIndex = 2;
    icon = (
      <BoyIcon
        style={{
          position: "absolute",
          width: PLAYER_MARKER_RADIUS,
          height: PLAYER_MARKER_RADIUS,
          backgroundColor: "white",
          color: active ? activeColor : "gray",
          left: left - PLAYER_MARKER_RADIUS / 2,
          top: top - PLAYER_MARKER_RADIUS / 2,
          opacity: 0.6,
          borderRadius: "50%",
          zIndex,
        }}
        onMouseOver={(e) => setHovered(true)}
        onMouseLeave={(e) => setHovered(false)}
      />
    );
  }
  // case TC
  else {
    active = !props.data.destroyed;
    activeColor = props.data.authed_players_count > tcMaxAuthedPlayersThreshold ? "darkblue" : "darkgreen";
    activeColor = active ? activeColor : "gray";
    label = formatTcLabel(props.data);
    zIndex = 1;
    icon = (
      <HomeIcon
        style={{
          position: "absolute",
          width: TC_MARKER_RADIUS,
          height: TC_MARKER_RADIUS,
          backgroundColor: "white",
          color: active ? activeColor : "gray",
          left: left - TC_MARKER_RADIUS / 2,
          top: top - TC_MARKER_RADIUS / 2,
          opacity: 0.6,
          borderRadius: "50%",
          zIndex,
        }}
        onMouseOver={(e) => setHovered(true)}
        onMouseLeave={(e) => setHovered(false)}
      />
    );
  }

  return (
    <>
      {/* marker */}
      {icon}
      {/* tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            backgroundColor: active ? activeColor : "gray",
            left: left + TOOLTIP_OFFSET,
            top: top - TOOLTIP_OFFSET,
            padding: "0 1rem 0 1rem",
            opacity: 0.75,
            borderRadius: 2,
            zIndex,
            color: tooltipTextColor,
          }}
        >
          {label}
        </div>
      )}
    </>
  );
};

export default Marker;
