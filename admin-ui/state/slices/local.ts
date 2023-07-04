/// <reference types="../../../rcon-ws-proxy/admin-ui.d.ts" />

import * as React from "react";
import { createSlice } from "@reduxjs/toolkit";

/**
 * Local state either completely locally generated or derived from remote state
 * over time.
 */
export interface IAdminUIState {
  connected: boolean;
  /**
   * Health of each player before and currently.
   */
  healthDeltas: { [playerId: string]: [timestampBefore: number, valueBefore: number, valueNow: number] };
  /**
   * Time window for which changes in health are accumulated per player.
   */
  healthDeltaWindowMs: number;
  /**
   * Minimum value for player's health delta within a time window required
   * to trigger functionality in UI (e.g. highlight it briefly by flashing an
   * element or something).
   */
  healthDeltaMinThreshold: number;
  /**
   * Whether to show TCs on the map.
   */
  showTcs: "activeOnly" | "all" | "none";
  /**
   * TC authorized players count threshold after which some UI functionality is
   * triggered (e.g. show marker with different color).
   */
  tcMaxAuthedPlayersThreshold: number;
  /**
   * Last positions of players.
   */
  playerTrails: { [id: string]: Array<IRCONPlayer["position"]> };
  /**
   * How many last positions of each player to include in trail.
   */
  maxPlayerTrailLength: number;
  /**
   * Whether UI settings modal is open.
   */
  settingsModalOpen: boolean;
  /**
   * Styles for map markers.
   */
  markerStyles: Record<
    "player" | "tc",
    Record<
      "online" | "offline" | "highlighted",
      Pick<Required<React.CSSProperties>, "backgroundColor" | "color" | "opacity">
    >
  >;
  /**
   * Player that have been selected manually (e.g. by clicking map marker or
   * name in the player listing).
   */
  manuallySelectedPlayers: { [id: string]: boolean };
}

const initialState: Pick<
  IAdminUIState,
  | "healthDeltaMinThreshold"
  | "showTcs"
  | "tcMaxAuthedPlayersThreshold"
  | "settingsModalOpen"
  | "markerStyles"
  | "manuallySelectedPlayers"
> = {
  healthDeltaMinThreshold: 5,
  showTcs: "activeOnly",
  tcMaxAuthedPlayersThreshold: 1,
  settingsModalOpen: false,
  manuallySelectedPlayers: {},
  markerStyles: {
    player: {
      offline: {
        backgroundColor: "white",
        color: "gray",
        opacity: 0.6,
      },
      online: {
        backgroundColor: "white",
        color: "red",
        opacity: 0.6,
      },
      highlighted: {
        backgroundColor: "white",
        color: "blue",
        opacity: 0.6,
      },
    },
    tc: {
      offline: {
        backgroundColor: "white",
        color: "gray",
        opacity: 0.6,
      },
      online: {
        backgroundColor: "white",
        color: "green",
        opacity: 0.6,
      },
      highlighted: {
        backgroundColor: "white",
        color: "blue",
        opacity: 0.6,
      },
    },
  },
};

export const uiSettings = createSlice({
  name: "counter",
  initialState: initialState,
  reducers: {
    openSettingsModal: (state) => {
      state.settingsModalOpen = !state.settingsModalOpen;
    },
    closeSettingsModal: (state) => {
      state.settingsModalOpen = !state.settingsModalOpen;
    },
    selectPlayer: (state, action: { payload: string }) => {
      state.manuallySelectedPlayers[action.payload] = true;
    },
    unselectPlayer: (state, action: { payload: string }) => {
      state.manuallySelectedPlayers[action.payload] = false;
    },
    setShowTcs: (state, action: { payload: IAdminUIState["showTcs"] }) => {
      state.showTcs = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { openSettingsModal, closeSettingsModal, selectPlayer, unselectPlayer, setShowTcs } = uiSettings.actions;

export default uiSettings.reducer;
