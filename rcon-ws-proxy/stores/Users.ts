import _Store from "./__Store.js";

interface IUser {
  id: string;
  passwordHash: Buffer;
}

class Users extends _Store<IUser> {
  protected sync(): Promise<void> {
    return Promise.resolve(); // this is not a remote RCON store -- thus NOOP!
  }

  public async findOne(entity: Pick<IUser, "id">): Promise<IUser | null> {
    const user = this._cache.get(entity.id);
    if (!user) return null;
    else return user;
  }

  public async findMany(): Promise<{ [id: string]: IUser }> {
    throw new Error("Method not implemented.");
  }

  public async save(entity: IUser): Promise<IUser> {
    this._cache.set(entity.id, entity);
    return entity;
  }
}

export type { IUser };
export default Users;
