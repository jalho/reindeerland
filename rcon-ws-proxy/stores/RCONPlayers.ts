import { playerlist, playerlistpos } from "../parsers/rcon.js";
import _RCON from "./_RCON.js";
import _Store from "./__Store.js";

class RCONPlayers extends _RCON {
  protected async sync(): Promise<void> {
    // playerlistpos
    const playerlistpos_response = await this.sendRconCommand("playerlistpos");
    const playerlistpos_parsed = playerlistpos(playerlistpos_response.rconMessage);

    // playerlist
    const playerlist_response = await this.sendRconCommand("playerlist");
    const playerlist_parsed = playerlist(playerlist_response.rconMessage);

    for (const player of playerlist_parsed) {
      const { POS, ROT } = playerlistpos_parsed[player.SteamID];
      const { Address, ConnectedSeconds, DisplayName, Health, Ping } = player;
      const rconPlayer: IRCONPlayer = {
        connected_seconds: ConnectedSeconds,
        country: "", // TODO
        health: Health,
        id: player.SteamID,
        ip_address: Address,
        name: DisplayName,
        ping: Ping,
        position: POS,
        rotation: ROT,
      };
      this._cache.set(player.SteamID, rconPlayer);
    }
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
