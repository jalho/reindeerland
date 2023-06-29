/// <reference types="../../player-detail-service/ipinfo.d.ts" />

import { playerlist, playerlistpos } from "../parsers/rcon.js";
import _RCON from "./_RCON.js";
import _Store from "./__Store.js";
import http from "node:http";

class RCONPlayers extends _RCON {
  private _countryCache: { [steamId: string]: string } = {};

  protected async sync(): Promise<void> {
    // playerlistpos
    const playerlistpos_response = await this.sendRconCommand("playerlistpos");
    const playerlistpos_parsed = playerlistpos(playerlistpos_response.rconMessage);

    // playerlist
    const playerlist_response = await this.sendRconCommand("playerlist");
    const playerlist_parsed = playerlist(playerlist_response.rconMessage);

    const online: { [id: string]: true } = {};
    for (const player of playerlist_parsed) {
      online[player.SteamID] = true;
      const { POS, ROT } = playerlistpos_parsed[player.SteamID] ?? {};
      const { Address, ConnectedSeconds, DisplayName, Health, Ping } = player;
      const country = await this.resolveCountry(player.SteamID, Address);

      const rconPlayer: IRCONPlayer = {
        connected_seconds: ConnectedSeconds,
        country: country ?? "",
        health: Health,
        id: player.SteamID,
        ip_address: Address,
        name: DisplayName,
        ping: Ping,
        position: POS,
        rotation: ROT,
        online: true,
      };
      this._cache.set(player.SteamID, rconPlayer);
    }

    // set offline status for disconnected players
    for (const [id, player] of this._cache) {
      if (online[id]) continue;
      else if (player.online) {
        player.online = false;
        this._cache.set(id, player);
        this._logg.info("Marked player offline: %s (Steam ID %s)", player.name, id);
      }
    }
  }

  private async resolveCountry(steamdId: string, ip: string): Promise<string | null> {
    // check cache first -- only request upstream if not cached
    if (this._countryCache[steamdId]) return this._countryCache[steamdId];

    const { IPINFO_APIKEY } = process.env;
    if (!IPINFO_APIKEY) return null;

    const ipInfo = await new Promise<IIPInfo | null>((resolve) => {
      const r = http.request("http://player-detail-service:80/player?ip=" + ip);
      r.setHeader("x-ipinfo-apikey", IPINFO_APIKEY);
      r.on("error", (err) => {
        this._logg.error("Cannot resolve country for player IP.", err);
        return resolve(null);
      });
      r.on("response", (incMsg) => {
        const bufs: Buffer[] = [];
        incMsg.on("data", (buf) => bufs.push(buf));
        incMsg.on("end", () => {
          const response: IIPInfo = JSON.parse(Buffer.concat(bufs).toString());
          resolve(response);
        });
      });
      r.end();
    });

    const { country } = ipInfo ?? {};
    if (country) this._countryCache[steamdId] = country; // cache
    return country ?? null;
  }

  public async findOne(entity: Pick<IRCONPlayer, "id">): Promise<IRCONPlayer | null> {
    const user = this._cache.get(entity.id);
    if (!user) return null;
    else return user;
  }

  public async findMany(entity?: Partial<IRCONPlayer> | null): Promise<{ [id: string]: IRCONPlayer }> {
    if (entity) throw new Error("Not implemented");
    else {
      const all: { [id: string]: IRCONPlayer } = {};
      for (const [key, value] of this._cache) all[key] = value;
      return all;
    }
  }
}

export default RCONPlayers;
