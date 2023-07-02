import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import { IAdminUIState, closeSettingsModal } from "../state/slices/local";
import { State } from "../state/store";
import Marker from "./Marker";

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
    id: "12345678901234567",
    ip_address: "192.168.0.123",
    name: "player name 1",
    online: true,
    ping: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  {
    connected_seconds: 1,
    country: "SE",
    health: 50.0,
    id: "12345678901234568",
    ip_address: "192.168.0.124",
    name: "player name 2",
    online: true,
    ping: 64,
    position: [0, 0, -15],
    rotation: [0, 0, 0],
  },
  {
    connected_seconds: 1,
    country: "NO",
    health: 25.0,
    id: "12345678901234569",
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
    id: "12345678901234560",
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
    id: "1234567",
    position: [-30, 0, -20],
  },
  {
    authed_players_count: 10,
    destroyed: false,
    id: "8901234",
    position: [30, 0, 20],
  },
  {
    authed_players_count: 1,
    destroyed: true,
    id: "3468979",
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
    <div>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <GameworldSample image="map-samples/desert.png" />
          <GameworldSample image="map-samples/grass.png" />
          <GameworldSample image="map-samples/launch-site.png" />
          <GameworldSample image="map-samples/snow.png" />
          <GameworldSample image="map-samples/water.png" />
        </Box>
      </Modal>
    </div>
  );
}
