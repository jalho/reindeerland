import * as React from "react";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import { IAdminUIState, closeSettingsModal } from "../state/slices/local";
import { State } from "../state/store";
import Marker from "./Marker";
import Grid from "@mui/material/Grid";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const MAP_SAMPLE_SIZE_PX = 100;
const SAMPLE_DATA: Array<IRCONPlayer | IRCONToolCupboard> = [
  {
    connected_seconds: 1,
    country: "FI",
    health: 100.0,
    id: "player id 1",
    ip_address: "192.168.0.123",
    name: "sample player name 1",
    online: true,
    ping: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  {
    connected_seconds: 1,
    country: "SE",
    health: 50.0,
    id: "player id 2",
    ip_address: "192.168.0.124",
    name: "sample player name 2",
    online: true,
    ping: 64,
    position: [0, 0, -15],
    rotation: [0, 0, 0],
  },
  {
    connected_seconds: 1,
    country: "NO",
    health: 25.0,
    id: "sample player id 3",
    ip_address: "192.168.0.125",
    name: "player name 3",
    online: false,
    ping: 128,
    position: [0, 0, 15],
    rotation: [0, 0, 0],
  },
  {
    connected_seconds: 1,
    country: "DE",
    health: 25.0,
    id: "sample player id 4",
    ip_address: "192.168.0.126",
    name: "player name 4",
    online: true,
    ping: 256,
    position: [-30, 0, 20],
    rotation: [0, 0, 0],
  },
  {
    authed_players_count: 1,
    destroyed: false,
    id: "sample tc id 1",
    position: [-30, 0, -20],
  },
  {
    authed_players_count: 10,
    destroyed: false,
    id: "sample tc id 2",
    position: [30, 0, 20],
  },
  {
    authed_players_count: 1,
    destroyed: true,
    id: "sample tc id 3",
    position: [30, 0, -20],
  },
];

const GameworldSample = (props: { image: string }): JSX.Element => {
  return (
    <div style={{ position: "relative" }}>
      <img src={props.image} style={{ width: MAP_SAMPLE_SIZE_PX }} />
      {SAMPLE_DATA.map((n, idx) => (
        <Marker
          key={"playersample" + idx}
          data={n}
          scale={1}
          gameworldOrigin={MAP_SAMPLE_SIZE_PX / 2}
          markerGameworldCoordinates={n.position}
          disableTooltip
        />
      ))}
    </div>
  );
};

export default function Settings() {
  const open = useSelector<State, IAdminUIState["settingsModalOpen"]>((s) => s.uiSettings.settingsModalOpen);
  const dispatch = useDispatch();
  const handleClose = () => dispatch(closeSettingsModal());

  return (
    <Modal open={open} onClose={handleClose}>
      <Grid sx={style} container direction={"row"}>
        <Grid container direction={"row"} justifyContent={"center"}>
          <GameworldSample image="map-samples/desert.png" />
          <GameworldSample image="map-samples/grass.png" />
          <GameworldSample image="map-samples/launch-site.png" />
          <GameworldSample image="map-samples/snow.png" />
          <GameworldSample image="map-samples/water.png" />
        </Grid>
        <Grid item>TODO: settings controls here!</Grid>
      </Grid>
    </Modal>
  );
}
