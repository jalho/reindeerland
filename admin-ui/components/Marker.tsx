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

const Marker = (props: IMarker<IRCONPlayer>): React.JSX.Element => {
  const [x, z, y] = props.markerGameworldCoordinates;
  const [hovered, setHovered] = React.useState<boolean>(false);

  const [left, top] = positionOnMap(props.scale, props.gameworldOrigin, x, y);

  return (
    <>
      <div
        style={{
          position: "absolute",
          width: MARKER_RADIUS,
          height: MARKER_RADIUS,
          backgroundColor: "red",
          left: left - MARKER_RADIUS / 2,
          top: top - MARKER_RADIUS / 2,
          borderRadius: "50%",
        }}
        onMouseOver={(e) => setHovered(true)}
        onMouseLeave={(e) => setHovered(false)}
      />
      {hovered && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "red",
            left: left + TOOLTIP_OFFSET,
            top: top - TOOLTIP_OFFSET,
          }}
        >
          {Object.entries(props.data).map(([k, v]) => (
            <div key={props.data.id + k}>{k + ": " + v}</div>
          ))}
        </div>
      )}
    </>
  );
};

export default Marker;
