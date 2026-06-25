import type { Trip } from "./models";

export class TripFactory {
  create(id: string): Trip {
    return {
      id,
      status: "planned",
    };
  }
}
