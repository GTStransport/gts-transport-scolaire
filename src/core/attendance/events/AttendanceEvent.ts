import type { Event } from "../../events";

export type AttendanceEventType = string;

export interface AttendanceEvent<TType extends AttendanceEventType = AttendanceEventType>
  extends Event<TType> {}

