import log4js from "log4js";
import { IUser } from "./Users.js";

interface IStore<Entity extends { id: string }> {
  findOne(entity: Pick<IUser, "id">): Promise<Entity | null>;
  findMany(entity: Partial<Entity>): Promise<{ [id: string]: Entity }>;
}

abstract class _Store<Entity extends { id: string }> implements IStore<Entity> {
  protected readonly _cache: Map<string, Entity>;
  protected _logg: log4js.Logger;

  constructor() {
    this._cache = new Map<string, Entity>();
    this._logg = log4js.getLogger(this.constructor.name);
  }

  public findOne(searchable: Pick<IUser, "id">): Promise<Entity | null> {
    const found = this._cache.get(searchable.id);
    return Promise.resolve(found ?? null);
  }

  /**
   * @param entity matcher; `null | undefined` means get all
   */
  public abstract findMany(entity: Partial<Entity> | null | undefined): Promise<{ [id: string]: Entity }>;
}

export type { IStore };
export default _Store;
