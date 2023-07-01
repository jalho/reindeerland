/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import React from "react";

const MARKER_RADIUS = 10;
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

const Marker = (props: IMarker<IRCONPlayer | IRCONToolCupboard>): React.JSX.Element | null => {
  if (!props.markerGameworldCoordinates) return null;

  const [x, z, y] = props.markerGameworldCoordinates;
  const [hovered, setHovered] = React.useState<boolean>(false);

  const [left, top] = positionOnMap(props.scale, props.gameworldOrigin, x, y);

  let active: boolean;
  if ("online" in props.data) active = props.data.online;
  else active = !props.data.destroyed;

  let label: string;
  if ("name" in props.data) label = props.data.name;
  else label = props.data.id;

  return (
    <>
      {/* marker */}
      <div
        style={{
          position: "absolute",
          width: MARKER_RADIUS,
          height: MARKER_RADIUS,
          backgroundColor: active ? "red" : "gray",
          left: left - MARKER_RADIUS / 2,
          top: top - MARKER_RADIUS / 2,
          opacity: 0.85,
          borderRadius: "50%",
        }}
        onMouseOver={(e) => setHovered(true)}
        onMouseLeave={(e) => setHovered(false)}
      />
      {/* tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            backgroundColor: active ? "red" : "gray",
            left: left + TOOLTIP_OFFSET,
            top: top - TOOLTIP_OFFSET,
            padding: "0 1rem 0 1rem",
            opacity: 0.75,
            borderRadius: 2,
          }}
        >
          <code>{label}</code>
        </div>
      )}
    </>
  );
};

export default Marker;
