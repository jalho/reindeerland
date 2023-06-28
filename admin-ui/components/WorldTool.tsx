import React from "react";
import { useSelector } from "react-redux";
import { State } from "../state/store";

interface IProps {
  upstream: URL;
}

/**
 * When RustDedicated is started with worldSize 4500, the corresponding rendered
 * map image is 5500 x 5500 px, and the coordinates RCON reports in various
 * commands are relative to those dimensions. (Accurate as of Jun 2023)
 */
const GAMEWORLD_SIZE = 5500;
/**
 * Size of the map image element rendered on the web page.
 */
const MAP_ELEMENT_SIZE = 1000;
const GAMEWORLD_ORIGIN = GAMEWORLD_SIZE / 2;
const SCALE = MAP_ELEMENT_SIZE / GAMEWORLD_SIZE;
const MARKER_RADIUS = 10;

const WorldTool = (props: IProps): React.JSX.Element => {
  const { protocol, host, pathname } = props.upstream;
  const players = useSelector((state: State) => state.players);

  return (
    <>
      <div style={{ width: MAP_ELEMENT_SIZE, position: "relative" }}>
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
                left: SCALE * (GAMEWORLD_ORIGIN + x) - MARKER_RADIUS / 2,
                top: SCALE * (GAMEWORLD_ORIGIN - y) - MARKER_RADIUS / 2,
                borderRadius: "50%",
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
