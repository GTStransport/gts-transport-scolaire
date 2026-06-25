import type { StopPassageStatus } from "./StopPassageStatus";

export interface StopPassage {
  readonly id: string;
  readonly status: StopPassageStatus;
}

