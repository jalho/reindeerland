import React from "react";
import { useSelector } from "react-redux";
import { State } from "../state/store";

interface IProps {
  upstream: URL;
}

const MAX_X = 1000;
const ORIGIN = MAX_X / 2;
const SCALE = MAX_X / 4500;
const MARKER_RADIUS = 10;

const WorldTool = (props: IProps): React.JSX.Element => {
  const { protocol, host, pathname } = props.upstream;
  const players = useSelector((state: State) => state.players);

  return (
    <>
      <div style={{ width: MAX_X, position: "relative" }}>
        <img
          src={protocol + "//" + host + pathname}
          alt="Map of Reindeerland"
          style={{ width: "100%", position: "absolute" }}
        />
        {Object.values(players).map((p) => {
          const [x, z, y] = p.position;
          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                width: MARKER_RADIUS,
                height: MARKER_RADIUS,
                backgroundColor: "red",
                left: SCALE * (ORIGIN + x),
                top: SCALE * (ORIGIN - y),
              }}
            />
          );
        })}
      </div>
      <p>TODO: Legends here.</p>
      <p>TODO: Controls here.</p>
    </>
  );
};

export default WorldTool;
