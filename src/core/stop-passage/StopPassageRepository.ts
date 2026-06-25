import { Repository } from "../repository";
import type { StopPassage } from "./models";

export type StopPassageRecord = Readonly<Record<string, unknown>>;

export type StopPassageQuery = Readonly<Record<string, unknown>>;

export abstract class StopPassageRepository extends Repository<
  StopPassageRecord,
  StopPassageQuery
> {
  abstract create(stopPassage: StopPassage): Promise<void> | void;
}

