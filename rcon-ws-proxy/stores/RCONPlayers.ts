import _Store from "./_Store.js";

class RCONPlayers extends _Store<IRCONPlayer> {
  protected sync(): Promise<void> {
    return Promise.resolve(); // TODO: implement cache interval sync -- update from RCON
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

  public async save(entity: IRCONPlayer): Promise<IRCONPlayer> {
    this._cache.set(entity.id, entity);
    return entity;
  }
}

export default RCONPlayers;
