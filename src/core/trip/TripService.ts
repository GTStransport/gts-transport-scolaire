import type { AuditLogger } from "../audit";
import type { EventBus } from "../events";
import type { FeatureFlagProvider } from "../feature-flags";
import type { SystemSettingsProvider } from "../settings";
import type { TripRepository } from "./TripRepository";

export type TripServiceDependencies = Readonly<{
  repository: TripRepository;
  eventBus: EventBus;
  auditLogger: AuditLogger;
  featureFlags: FeatureFlagProvider;
  settings: SystemSettingsProvider;
}>;

export abstract class TripService {
  protected constructor(protected readonly dependencies: TripServiceDependencies) {}
}

