import { playerlistpos } from "../parsers/rcon.js";
import _Store from "./_Store.js";

// TODO: remove this
const dummyData = [
  `SteamID           DisplayName POS                   ROT               
  76561198135242017 jka         (1513.4, 0.1, 1435.5) (-0.6, -0.2, 0.8) `,
  `SteamID           DisplayName POS                   ROT               
  76561198135242017 jka         (1523.4, 0.1, 1435.5) (-0.6, -0.2, 0.8) `,
  `SteamID           DisplayName POS                   ROT               
  76561198135242017 jka         (1533.4, 0.1, 1435.5) (-0.6, -0.2, 0.8) `,
  `SteamID           DisplayName POS                   ROT               
  76561198135242017 jka         (1543.4, 0.1, 1435.5) (-0.6, -0.2, 0.8) `,
];

class RCONPlayers extends _Store<IRCONPlayer> {
  private _tick = 0; // TODO: remove this

  protected async sync(): Promise<void> {
    const str = await this.sendRconCommand("playerlistpos");
    const parsed = playerlistpos(str);
    for (const playerPos of parsed) {
      this._cache.set(playerPos.SteamID, {
        country: "", // TODO!
        health: -1, // TODO!
        id: playerPos.SteamID,
        ip_address: "", // TODO!
        position: playerPos.POS,
        rotation: playerPos.ROT,
      });
    }
  }

  // TODO: implement -- get from actual RCON
  private async sendRconCommand(command: string): Promise<string> {
    const data = dummyData[this._tick++ % dummyData.length];
    return data;
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
