import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AttendanceFactory } from "../AttendanceFactory";
import type { AttendanceRepository } from "../AttendanceRepository";
import { CreateAttendance } from "./CreateAttendance";
import type { AuditLogger } from "../../audit";
import type { EventBus } from "../../events";
import type { Attendance } from "../models";

describe("CreateAttendance", () => {
  it("uses AttendanceFactory and persists the created Attendance", async () => {
    const createdAttendance: Attendance = {
      id: "attendance-1",
      status: "present",
    };

    const factoryCalls: string[] = [];
    const createdAttendances: Attendance[] = [];

    const attendanceFactory: AttendanceFactory = {
      create(id: string): Attendance {
        factoryCalls.push(id);
        return createdAttendance;
      },
    };

    const repository = {
      async create(attendance: Attendance): Promise<void> {
        createdAttendances.push(attendance);
      },
      async findById(): Promise<never> {
        throw new Error("findById should not be called.");
      },
      async findMany(): Promise<never> {
        throw new Error("findMany should not be called.");
      },
    } as AttendanceRepository;

    const useCase = new CreateAttendance({
      repository,
      attendanceFactory,
      eventBus: {} as EventBus,
      auditLogger: {} as AuditLogger,
    });

    await useCase.execute({
      id: "attendance-1",
      payload: {},
    });

    assert.deepEqual(factoryCalls, ["attendance-1"]);
    assert.deepEqual(createdAttendances, [createdAttendance]);
  });
});
