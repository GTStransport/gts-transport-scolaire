export type AuditMetadata = Readonly<Record<string, unknown>>;

export type AuditActor = Readonly<{
  id: string;
  role: string;
}>;

export type AuditTarget = Readonly<{
  id: string;
  type: string;
}>;

export interface AuditEntry<
  TAction extends string = string,
  TMetadata extends AuditMetadata = AuditMetadata,
> {
  readonly id: string;
  readonly action: TAction;
  readonly actor: AuditActor;
  readonly target?: AuditTarget;
  readonly occurredAt: Date;
  readonly metadata?: TMetadata;
}

