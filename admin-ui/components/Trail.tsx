/// <reference types="../../rcon-ws-proxy/admin-ui.d.ts" />

import React from "react";

const TRAIL_RADIUS = 2;

interface ITrail {
  scale: number;
  gameworldOrigin: number;
  /** x, z, y */
  trailGameworldCoordinates: Array<[number, number, number]>;
  playerId: string;
}

function positionOnMap(
  scale: number,
  gameworldOrigin: number,
  gameWorld_x: number,
  gameWorld_y: number
): [left: number, top: number] {
  return [scale * (gameworldOrigin + gameWorld_x), scale * (gameworldOrigin - gameWorld_y)];
}

const Trail = (props: ITrail): React.JSX.Element | null => {
  if (!props.trailGameworldCoordinates) return null;

  return (
    <>
      {props.trailGameworldCoordinates.map((pos, idx) => {
        if (!pos) return null;
        const [x, z, y] = pos;
        const [left, top] = positionOnMap(props.scale, props.gameworldOrigin, x, y);
        return (
          <div
            key={props.playerId + idx}
            style={{
              position: "absolute",
              width: TRAIL_RADIUS,
              height: TRAIL_RADIUS,
              backgroundColor: "red",
              left: left - TRAIL_RADIUS / 2,
              top: top - TRAIL_RADIUS / 2,
              opacity: 0.5,
              borderRadius: "50%",
              zIndex: 1,
            }}
          />
        );
      })}
    </>
  );
};

export default Trail;
