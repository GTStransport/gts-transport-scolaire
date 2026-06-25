export type CreateAttendanceCommandPayload = Readonly<Record<string, unknown>>;

export interface CreateAttendanceCommand {
  readonly id: string;
  readonly payload: CreateAttendanceCommandPayload;
}

