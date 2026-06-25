import type { AuditLogger } from "../audit";
import type { EventBus } from "../events";
import type { FeatureFlagProvider } from "../feature-flags";
import type { SystemSettingsProvider } from "../settings";
import type { AttendanceRepository } from "./AttendanceRepository";

export type AttendanceServiceDependencies = Readonly<{
  repository: AttendanceRepository;
  eventBus: EventBus;
  auditLogger: AuditLogger;
  featureFlags: FeatureFlagProvider;
  settings: SystemSettingsProvider;
}>;

export abstract class AttendanceService {
  protected constructor(protected readonly dependencies: AttendanceServiceDependencies) {}
}
