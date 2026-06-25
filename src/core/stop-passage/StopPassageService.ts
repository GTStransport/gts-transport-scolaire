import type { AuditLogger } from "../audit";
import type { EventBus } from "../events";
import type { FeatureFlagProvider } from "../feature-flags";
import type { SystemSettingsProvider } from "../settings";
import type { StopPassageRepository } from "./StopPassageRepository";

export type StopPassageServiceDependencies = Readonly<{
  repository: StopPassageRepository;
  eventBus: EventBus;
  auditLogger: AuditLogger;
  featureFlags: FeatureFlagProvider;
  settings: SystemSettingsProvider;
}>;

export abstract class StopPassageService {
  protected constructor(protected readonly dependencies: StopPassageServiceDependencies) {}
}

