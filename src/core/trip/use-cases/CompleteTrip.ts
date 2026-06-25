import type { AuditLogger } from "../../audit";
import type { EventBus } from "../../events";
import type { FeatureFlagProvider } from "../../feature-flags";
import type { SystemSettingsProvider } from "../../settings";
import type { TripRepository } from "../TripRepository";
import type { TripStateMachine } from "../TripStateMachine";

export type CompleteTripDependencies = Readonly<{
  repository: TripRepository;
  eventBus: EventBus;
  auditLogger: AuditLogger;
  featureFlags: FeatureFlagProvider;
  settings: SystemSettingsProvider;
  stateMachine: TripStateMachine;
}>;

export class CompleteTrip {
  constructor(private readonly dependencies: CompleteTripDependencies) {}

  async execute(): Promise<void> {
    const canComplete = this.dependencies.stateMachine.canTransition("running", "completed");
    void canComplete;

    // TODO: utiliser Repository pour charger et persister le Trip lorsque le modèle sera validé.
    // TODO: enregistrer l'audit Trip lorsque le modèle d'audit sera validé.
    // TODO: publier les événements Trip lorsque leurs contrats seront validés.
  }
}
