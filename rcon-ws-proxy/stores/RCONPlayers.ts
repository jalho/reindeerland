import { playerlistpos } from "../parsers/rcon.js";
import _RCON from "./_RCON.js";
import _Store from "./__Store.js";

class RCONPlayers extends _RCON {
  protected async sync(): Promise<void> {
    const { rconMessage, timestamp } = await this.sendRconCommand("playerlistpos");
    const parsed = playerlistpos(rconMessage);
    for (const playerPos of parsed) {
      this._cache.set(playerPos.SteamID, {
        country: "", // TODO!
        health: -1, // TODO!
        id: playerPos.SteamID,
        ip_address: "", // TODO!
        position: playerPos.POS,
        rotation: playerPos.ROT,
        name: playerPos.DisplayName,
      });
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
