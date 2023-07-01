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
const GAMEWORLD_ORIGIN = GAMEWORLD_SIZE / 2;

const WorldTool = (props: IProps): React.JSX.Element => {
  const [screenSize, setScreenSize] = React.useState(getDimensions());
  function getDimensions() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  React.useEffect(() => {
    const updateDimension = () => setScreenSize(getDimensions());
    window.addEventListener("resize", updateDimension);
    return () => window.removeEventListener("resize", updateDimension);
  }, [screenSize]);

  /**
   * Size of the map image element rendered on the web page.
   */
  const mapElementSizePx = screenSize.width;
  const { protocol, host, pathname } = props.upstream;
  const { players, tcs, showTcs } = useSelector<State, Pick<State, "players" | "tcs" | "showTcs">>((state: State) => ({
    players: state.players,
    tcs: state.tcs,
    showTcs: state.showTcs,
  }));
  const scale = mapElementSizePx / GAMEWORLD_SIZE;

  const markerables: Array<IRCONPlayer | IRCONToolCupboard> = Object.values(players);
  if (showTcs) markerables.push(...Object.values(tcs));

  return (
    <>
      <div style={{ width: mapElementSizePx, position: "relative" }}>
        <img
          src={protocol + "//" + host + pathname}
          alt="Map of Reindeerland"
          style={{ width: "100%", position: "absolute" }}
        />
        {markerables.map((p) => (
          <Marker
            gameworldOrigin={GAMEWORLD_ORIGIN}
            markerGameworldCoordinates={p.position}
            scale={scale}
            key={p.id}
            data={p}
          />
        ))}
      </div>
    </>
  );
};

export default WorldTool;
