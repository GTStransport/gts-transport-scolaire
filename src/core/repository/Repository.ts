import type { RepositoryListResult, RepositoryResult } from "./RepositoryResult";

export type RepositoryId = string;

export type RepositoryQuery = Readonly<Record<string, unknown>>;

export abstract class Repository<TEntity, TQuery extends RepositoryQuery = RepositoryQuery> {
  abstract findById(id: RepositoryId): Promise<RepositoryResult<TEntity | null>>;

  abstract findMany(query?: TQuery): Promise<RepositoryListResult<TEntity>>;
}

