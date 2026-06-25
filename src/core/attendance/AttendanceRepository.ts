import { Repository } from "../repository";
import type { Attendance } from "./models";

export type AttendanceRecord = Readonly<Record<string, unknown>>;

export type AttendanceQuery = Readonly<Record<string, unknown>>;

export abstract class AttendanceRepository extends Repository<
  AttendanceRecord,
  AttendanceQuery
> {
  abstract create(attendance: Attendance): Promise<void> | void;
}
