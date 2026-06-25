export type RepositoryError = Readonly<{
  code: string;
  message: string;
  cause?: unknown;
}>;

export type RepositoryResult<TValue> =
  | Readonly<{
      ok: true;
      value: TValue;
    }>
  | Readonly<{
      ok: false;
      error: RepositoryError;
    }>;

export type RepositoryListResult<TValue> = RepositoryResult<ReadonlyArray<TValue>>;

