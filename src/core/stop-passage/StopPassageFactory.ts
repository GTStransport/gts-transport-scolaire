import type { StopPassage } from "./models";

export class StopPassageFactory {
  create(id: string): StopPassage {
    return {
      id,
      status: "planned",
    };
  }
}

