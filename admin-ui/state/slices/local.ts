/// <reference types="../../../rcon-ws-proxy/admin-ui.d.ts" />

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
  showTcs: boolean;
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
}

const initialState: Pick<
  IAdminUIState,
  "healthDeltaMinThreshold" | "showTcs" | "tcMaxAuthedPlayersThreshold" | "settingsModalOpen"
> = {
  healthDeltaMinThreshold: 5,
  showTcs: true,
  tcMaxAuthedPlayersThreshold: 1,
  settingsModalOpen: false,
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
  },
});

// Action creators are generated for each case reducer function
export const { openSettingsModal, closeSettingsModal } = uiSettings.actions;

export default uiSettings.reducer;
