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
import Playerlist from "./Playerlist";
import WorldTool from "./WorldTool";
import { MAP_UPSTREAM } from "../constants/upstreams";
import { Dispatch, connectUpstream } from "../state/store";
import { IConnectUpstreamCredentials } from "../state/Upstream";
import { useDispatch } from "react-redux";

const MAP_ELEMENT_SIZE = 500;

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

// TODO: get as user input
const credentials: IConnectUpstreamCredentials = {
  password: "bar",
  username: "foo",
};

export default function Dashboard() {
  const dispatch = useDispatch<Dispatch>();

  // TODO: dispatch when user has provided credentials
  React.useEffect(() => {
    dispatch(connectUpstream(credentials));
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute">
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              Reindeerland
            </Typography>
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
              {/* Map */}
              <Grid item>
                <Paper
                  style={{
                    width: MAP_ELEMENT_SIZE,
                    height: MAP_ELEMENT_SIZE,
                  }}
                >
                  <WorldTool upstream={MAP_UPSTREAM} mapElementSizePx={MAP_ELEMENT_SIZE} />
                </Paper>
              </Grid>

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
    </ThemeProvider>
  );
}
