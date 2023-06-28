import React from "react";
import { useSelector } from "react-redux";
import { State } from "../state/store";
import Marker from "./Marker";

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
        {Object.values(players).map((p) => (
          <Marker gameworldOrigin={GAMEWORLD_ORIGIN} markerGameworldCoordinates={p.position} scale={SCALE} key={p.id} data={p}/>
        ))}
      </div>
      <p>TODO: Legends here.</p>
      <p>TODO: Controls here.</p>
    </>
  );
};

export default WorldTool;
