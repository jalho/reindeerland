import { IUser } from "./Users.js";

interface IStore<Entity extends { id: string }> {
  findOne(entity: Pick<IUser, "id">): Promise<Entity | null>;
  findMany(entity: Partial<Entity>): Promise<Entity[]>;
  save(entity: Partial<Entity>): Promise<Entity>;
}

abstract class _Store<Entity extends { id: string }> implements IStore<Entity> {
  protected readonly _cache: Map<string, Entity> = new Map<string, Entity>();

  public abstract findOne(entity: Pick<IUser, "id">): Promise<Entity | null>;
  /**
   * @param entity matcher; `null | undefined` means get all
   */
  public abstract findMany(entity: Partial<Entity> | null | undefined): Promise<Entity[]>;
  public abstract save(entity: Partial<Entity>): Promise<Entity>;
}

export type { IStore };
export default _Store;
