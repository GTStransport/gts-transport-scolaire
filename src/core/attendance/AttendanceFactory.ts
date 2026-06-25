import type { Attendance } from "./models";

export class AttendanceFactory {
  create(id: string): Attendance {
    return {
      id,
      status: "present",
    };
  }
}

