import React from "react";
import { useSelector } from "react-redux";
import { State } from "../state/store";
import Marker from "./Marker";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Trail from "./Trail";

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
  const { players, allTcs, activeTcs, showTcs, playerTrails } = useSelector<
    State,
    Pick<State["serverInfo"] & State["uiSettings"], "showTcs" | "playerTrails"> & {
      players: Array<IRCONPlayer>;
      allTcs: Array<IRCONToolCupboard>;
      activeTcs: Array<IRCONToolCupboard>;
    }
  >((state: State) => {
    const allTcs = Object.values(state.serverInfo.tcs);
    return {
      players: Object.values(state.serverInfo.players),
      allTcs,
      activeTcs: allTcs.filter((tc) => !tc.destroyed),
      showTcs: state.uiSettings.showTcs,
      playerTrails: state.serverInfo.playerTrails,
    };
  });
  const scale = mapElementSizePx / GAMEWORLD_SIZE;

  const markerables: Array<IRCONPlayer | IRCONToolCupboard> = players;
  if (showTcs === "all") markerables.push(...allTcs);
  else if (showTcs === "activeOnly") markerables.push(...activeTcs);

  return (
    <Grid item>
      <Paper
        style={{
          width: mapElementSizePx,
          height: mapElementSizePx,
        }}
      >
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
          {players
            .filter((p) => p.online)
            .map((p: IRCONPlayer) => (
              <Trail
                key={p.id}
                gameworldOrigin={GAMEWORLD_ORIGIN}
                scale={scale}
                trailGameworldCoordinates={playerTrails[p.id]}
                playerId={p.id}
              />
            ))}
        </div>
      </Paper>
    </Grid>
  );
};

export default WorldTool;
