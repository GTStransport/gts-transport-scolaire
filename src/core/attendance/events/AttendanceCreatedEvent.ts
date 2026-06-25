import type { AttendanceEvent } from "./AttendanceEvent";

export type AttendanceCreatedEventType = "attendance.created";

export interface AttendanceCreatedEvent extends AttendanceEvent<AttendanceCreatedEventType> {}

