import React from "react";

const MARKER_RADIUS = 10;

interface IMarker {
  scale: number;
  gameworldOrigin: number;
  /** x, z, y */
  markerGameworldCoordinates: [number, number, number];
}

const Marker = (props: IMarker): React.JSX.Element => {
  const [x, z, y] = props.markerGameworldCoordinates;
  return (
    <div
      style={{
        position: "absolute",
        width: MARKER_RADIUS,
        height: MARKER_RADIUS,
        backgroundColor: "red",
        left: props.scale * (props.gameworldOrigin + x) - MARKER_RADIUS / 2,
        top: props.scale * (props.gameworldOrigin - y) - MARKER_RADIUS / 2,
        borderRadius: "50%",
      }}
    />
  );
};

export default Marker;
