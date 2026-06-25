import type { AuditLogger } from "../../audit";
import type { EventBus } from "../../events";
import type { AttendanceFactory } from "../AttendanceFactory";
import type { AttendanceRepository } from "../AttendanceRepository";
import type { CreateAttendanceCommand } from "../commands";

export type CreateAttendanceDependencies = Readonly<{
  repository: AttendanceRepository;
  eventBus: EventBus;
  auditLogger: AuditLogger;
  attendanceFactory: AttendanceFactory;
}>;

export class CreateAttendance {
  constructor(private readonly dependencies: CreateAttendanceDependencies) {}

  async execute(command: CreateAttendanceCommand): Promise<void> {
    const attendanceId = command.id.trim();

    if (!attendanceId) {
      throw new Error("Attendance id is required.");
    }

    const attendance = this.dependencies.attendanceFactory.create(attendanceId);

    await this.dependencies.repository.create(attendance);

    // TODO: enregistrer l'entrée d'audit lorsque le modèle d'audit Attendance sera validé.
    // TODO: publier les événements Attendance lorsque leurs payloads seront validés.
  }
}
