import type { AuditLogger } from "../../audit";
import type { EventBus } from "../../events";
import type { FeatureFlagProvider } from "../../feature-flags";
import type { SystemSettingsProvider } from "../../settings";
import type { TripRepository } from "../TripRepository";
import type { TripStateMachine } from "../TripStateMachine";

export type StartTripDependencies = Readonly<{
  repository: TripRepository;
  eventBus: EventBus;
  auditLogger: AuditLogger;
  featureFlags: FeatureFlagProvider;
  settings: SystemSettingsProvider;
  stateMachine: TripStateMachine;
}>;

export class StartTrip {
  constructor(private readonly dependencies: StartTripDependencies) {}

  async execute(): Promise<void> {
    const canStart = this.dependencies.stateMachine.canTransition("planned", "running");
    void canStart;

    // TODO: utiliser Repository pour charger et persister le Trip lorsque le modèle sera validé.
    // TODO: enregistrer l'audit Trip lorsque le modèle d'audit sera validé.
    // TODO: publier les événements Trip lorsque leurs contrats seront validés.
  }
}
