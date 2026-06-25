import type { AttendanceStatus } from "./AttendanceStatus";

export interface Attendance {
  readonly id: string;
  readonly status: AttendanceStatus;
}

