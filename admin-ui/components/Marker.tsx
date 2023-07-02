/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../state/store";
import HomeIcon from "@mui/icons-material/Home";
import BoyIcon from "@mui/icons-material/Boy";
import { IAdminUIState, selectPlayer, unselectPlayer } from "../state/slices/local";
import COUNTRY_FLAG_EMOJI_UNICODE_MAP from "../constants/country-flag-emojis";

const PLAYER_MARKER_RADIUS = 15;
const TC_MARKER_RADIUS = 15;

interface IMarker<Data> {
  scale: number;
  gameworldOrigin: number;
  /** x, z, y */
  markerGameworldCoordinates: [number, number, number];
  data: Data;
  disableTooltip?: boolean;
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

  const copyTeleportposCommandToClipboard = () =>
    navigator.clipboard.writeText(`teleportpos ${props.data.position.join(",")}`);
  const dispatch = useDispatch();
  const { tcMaxAuthedPlayersThreshold, markerStyles } = useSelector<
    State,
    Pick<IAdminUIState, "tcMaxAuthedPlayersThreshold" | "markerStyles">
  >((s) => ({
    tcMaxAuthedPlayersThreshold: s.uiSettings.tcMaxAuthedPlayersThreshold,
    markerStyles: s.uiSettings.markerStyles,
  }));
  const playerIsManuallySelected = useSelector<State>((s) => s.uiSettings.manuallySelectedPlayers[props.data.id]);

  const [x, z, y] = props.markerGameworldCoordinates;
  const [hovered, setHovered] = React.useState<boolean>(false);

  const [left, top] = positionOnMap(props.scale, props.gameworldOrigin, x, y);

  let label: string;
  let zIndex: number;
  let icon: JSX.Element;
  // case player
  if ("online" in props.data) {
    const playerMarkerStyles = props.data.online ? markerStyles.player.online : markerStyles.player.offline;
    label = props.data.name;
    zIndex = 2;
    icon = (
      <BoyIcon
        style={{
          position: "absolute",
          width: PLAYER_MARKER_RADIUS,
          height: PLAYER_MARKER_RADIUS,
          left: left - PLAYER_MARKER_RADIUS / 2,
          top: top - PLAYER_MARKER_RADIUS / 2,
          borderRadius: "50%",
          zIndex,
          ...playerMarkerStyles,
        }}
        onMouseOver={() => {
          if (!playerIsManuallySelected) dispatch(selectPlayer(props.data.id));
        }}
        onMouseLeave={() => {
          if (playerIsManuallySelected) dispatch(unselectPlayer(props.data.id));
        }}
        onClick={copyTeleportposCommandToClipboard}
      />
    );
  }
  // case TC
  else {
    const tcMarkerStyles = props.data.destroyed
      ? markerStyles.tc.offline
      : props.data.authed_players_count > tcMaxAuthedPlayersThreshold
      ? markerStyles.tc.highlighted
      : markerStyles.tc.online;
    label = formatTcLabel(props.data);
    zIndex = 1;
    icon = (
      <HomeIcon
        style={{
          position: "absolute",
          width: TC_MARKER_RADIUS,
          height: TC_MARKER_RADIUS,
          left: left - TC_MARKER_RADIUS / 2,
          top: top - TC_MARKER_RADIUS / 2,
          borderRadius: "50%",
          zIndex,
          ...tcMarkerStyles,
        }}
        onMouseOver={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={copyTeleportposCommandToClipboard}
      />
    );
  }

  let country: string | null = "country" in props.data ? COUNTRY_FLAG_EMOJI_UNICODE_MAP[props.data.country] : null;

  return (
    <>
      {/* marker */}
      {icon}
      {/* tooltip */}
      {(playerIsManuallySelected || hovered) && !props.disableTooltip && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "black",
            top,
            left,
            padding: "0 1rem 0 1rem",
            opacity: 0.75,
            borderRadius: 2,
            zIndex: 3,
            color: "white",
          }}
          onClick={copyTeleportposCommandToClipboard}
        >
          <h1 style={{ flex: 1 }}>
            {country} {label}
          </h1>
        </div>
      )}
    </>
  );
};

export default Marker;
