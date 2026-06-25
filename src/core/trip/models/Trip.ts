import type { TripStatus } from "./TripStatus";

export interface Trip {
  readonly id: string;
  readonly status: TripStatus;
}

