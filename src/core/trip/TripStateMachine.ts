import type { TripStatus } from "./models";

export class TripStateMachine {
  private readonly transitions: Readonly<Record<TripStatus, ReadonlyArray<TripStatus>>> = {
    planned: ["running", "cancelled"],
    running: ["completed", "interrupted", "cancelled"],
    completed: [],
    cancelled: [],
    interrupted: ["running", "cancelled"],
  };

  canTransition(from: TripStatus, to: TripStatus): boolean {
    return this.transitions[from].includes(to);
  }
}

