export type EventPayload = Readonly<Record<string, unknown>>;

export type EventMetadata = Readonly<Record<string, unknown>>;

export interface Event<
  TType extends string = string,
  TPayload extends EventPayload = EventPayload,
  TMetadata extends EventMetadata = EventMetadata,
> {
  readonly id: string;
  readonly type: TType;
  readonly payload: TPayload;
  readonly occurredAt: Date;
  readonly metadata?: TMetadata;
}

