/// <reference types="../../player-detail-service/ipinfo.d.ts" />

import { listtoolcupboards } from "../parsers/rcon.js";
import _RCON from "./_RCON.js";
import _Store from "./__Store.js";

class RCONToolcupboards extends _RCON<IRCONToolCupboard> {
  protected async sync(): Promise<void> {
    try {
      // listtoolcupboards
      const listtoolcupboards_response = await this.sendRconCommand("listtoolcupboards");
      const listtoolcupboards_parsed = listtoolcupboards(listtoolcupboards_response.rconMessage);
  
      const online: { [id: string]: true } = {};
      for (const [id, tc] of Object.entries(listtoolcupboards_parsed)) {
        online[id] = true;
        const rconTc: IRCONToolCupboard = {
          authed_players_count: tc.Authed,
          destroyed: false,
          id,
          position: tc.Position,
        };
        this._cache.set(id, rconTc);
      }
  
      // set destroyed status for TCs that are no longer on the map
      for (const [id, tc] of this._cache) {
        if (online[id]) continue;
        else if (!tc.destroyed) {
          tc.destroyed = true;
          this._cache.set(id, tc);
          this._logg.info(
            "Marked TC at [%s] destroyed: entity ID %s, authed players %d",
            tc.position.join(", "),
            tc.id,
            tc.authed_players_count
          );
        }
      }
    } catch (e_sync) {
      this._logg.error(e_sync);
      return;
    }
  }

  public async findMany(entity?: Partial<IRCONToolCupboard> | null): Promise<{ [id: string]: IRCONToolCupboard }> {
    if (entity) throw new Error("Not implemented");
    else {
      const all: { [id: string]: IRCONToolCupboard } = {};
      for (const [key, value] of this._cache) all[key] = value;
      return all;
    }
  }
}

export default RCONToolcupboards;
