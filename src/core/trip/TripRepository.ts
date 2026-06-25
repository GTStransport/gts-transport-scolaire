import { Repository } from "../repository";
import type { Trip } from "./models";

export type TripRecord = Readonly<Record<string, unknown>>;

export type TripQuery = Readonly<Record<string, unknown>>;

export abstract class TripRepository extends Repository<TripRecord, TripQuery> {
  abstract create(trip: Trip): Promise<void> | void;
}

