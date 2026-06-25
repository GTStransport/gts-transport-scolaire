import type { AuditLogger } from "../../audit";
import type { EventBus } from "../../events";
import type { FeatureFlagProvider } from "../../feature-flags";
import type { SystemSettingsProvider } from "../../settings";
import { TripFactory } from "../TripFactory";
import type { TripRepository } from "../TripRepository";

export type CreateTripDependencies = Readonly<{
  repository: TripRepository;
  eventBus: EventBus;
  auditLogger: AuditLogger;
  featureFlags: FeatureFlagProvider;
  settings: SystemSettingsProvider;
  tripFactory: TripFactory;
}>;

export class CreateTrip {
  constructor(private readonly dependencies: CreateTripDependencies) {}

  async execute(id: string): Promise<void> {
    const trip = this.dependencies.tripFactory.create(id);

    await this.dependencies.repository.create(trip);

    // TODO: compléter la logique métier de création Trip lorsque le modèle sera validé.
    // TODO: enregistrer l'audit Trip lorsque le modèle d'audit sera validé.
    // TODO: publier les événements Trip lorsque leurs contrats seront validés.
  }
}
