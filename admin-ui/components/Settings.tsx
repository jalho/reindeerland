import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import { IAdminUIState, closeSettingsModal } from "../state/slices/local";
import { State } from "../state/store";

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

export default function Settings() {
  const open = useSelector<State, IAdminUIState["settingsModalOpen"]>((s) => s.uiSettings.settingsModalOpen);
  const dispatch = useDispatch();
  const handleClose = () => dispatch(closeSettingsModal());

  return (
    <div>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            TODO: settings controls here
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
