import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import Playerlist from "./Playerlist";
import WorldTool from "./WorldTool";
import { MAP_UPSTREAM } from "../constants/upstreams";
import { State } from "../state/store";
import { useDispatch, useSelector } from "react-redux";
import Login from "./Login";
import Settings from "./Settings";
import { openSettingsModal } from "../state/slices/local";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: "100%",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const defaultTheme = createTheme();

export default function Dashboard() {
  const dispatch = useDispatch();
  const handleOpen = () => dispatch(openSettingsModal());
  const [loggedIn, lastSyncTsMs] = useSelector<State, [boolean, number]>((s) => {
    return [s.serverInfo.connected && s.serverInfo.lastSyncTsMs > 0, s.serverInfo.lastSyncTsMs];
  });

  return (
    <ThemeProvider theme={defaultTheme}>
      {!loggedIn ? (
        <Login />
      ) : (
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <AppBar position="absolute">
            <Toolbar
              sx={{
                pr: "24px", // keep right padding when drawer closed
              }}
            >
              <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                Last synced {new Date(lastSyncTsMs).toString()}
              </Typography>
              <Button onClick={handleOpen} style={{ color: "white" }}>
                <SettingsIcon />
              </Button>
            </Toolbar>
          </AppBar>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900],
              flexGrow: 1,
              height: "100vh",
              overflow: "auto",
            }}
          >
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Grid container spacing={3} justifyContent={"center"}>
                <Settings />

                {/* Map */}
                <WorldTool upstream={MAP_UPSTREAM} />

                {/* Player list */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                    <Playerlist />
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}
