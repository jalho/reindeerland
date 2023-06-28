import _Store from "./_Store.js";

interface IRCONPlayer {
  /** Steam ID */
  id: string;
}

class RCONPlayers extends _Store<IRCONPlayer> {
  public async findOne(entity: Pick<IRCONPlayer, "id">): Promise<IRCONPlayer | null> {
    const user = this._cache.get(entity.id);
    if (!user) return null;
    else return user;
  }

  public async findMany(entity?: Partial<IRCONPlayer> | null): Promise<IRCONPlayer[]> {
    if (entity) throw new Error("Not implemented");
    else return Object.entries(this._cache).map(([k, v]) => v);
  }

  public async save(entity: IRCONPlayer): Promise<IRCONPlayer> {
    this._cache.set(entity.id, entity);
    return entity;
  }
}

export type { IRCONPlayer };
export default RCONPlayers;
