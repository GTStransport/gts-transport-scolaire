import type { Event } from "./Event";

export interface EventHandler<TEvent extends Event = Event> {
  handle(event: TEvent): void | Promise<void>;
}

export type EventHandlerFunction<TEvent extends Event = Event> = (
  event: TEvent,
) => void | Promise<void>;

