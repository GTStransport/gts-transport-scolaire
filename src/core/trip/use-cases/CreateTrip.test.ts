import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CreateTrip } from "./CreateTrip";
import type { AuditLogger } from "../../audit";
import type { EventBus } from "../../events";
import type { FeatureFlagProvider } from "../../feature-flags";
import type { SystemSettingsProvider } from "../../settings";
import type { TripFactory } from "../TripFactory";
import type { TripRepository } from "../TripRepository";
import type { Trip } from "../models";

describe("CreateTrip", () => {
  it("uses TripFactory and persists the created Trip", async () => {
    const createdTrip: Trip = {
      id: "trip-1",
      status: "planned",
    };

    const factoryCalls: string[] = [];
    const createdTrips: Trip[] = [];

    const tripFactory: TripFactory = {
      create(id: string): Trip {
        factoryCalls.push(id);
        return createdTrip;
      },
    };

    const repository = {
      async create(trip: Trip): Promise<void> {
        createdTrips.push(trip);
      },
      async findById(): Promise<never> {
        throw new Error("findById should not be called.");
      },
      async findMany(): Promise<never> {
        throw new Error("findMany should not be called.");
      },
    } as TripRepository;

    const useCase = new CreateTrip({
      repository,
      tripFactory,
      eventBus: {} as EventBus,
      auditLogger: {} as AuditLogger,
      featureFlags: {} as FeatureFlagProvider,
      settings: {} as SystemSettingsProvider,
    });

    await useCase.execute("trip-1");

    assert.deepEqual(factoryCalls, ["trip-1"]);
    assert.deepEqual(createdTrips, [createdTrip]);
  });
});

