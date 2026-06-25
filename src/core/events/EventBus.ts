import type { Event } from "./Event";
import type { EventHandler, EventHandlerFunction } from "./EventHandler";

export type EventSubscription = () => void;

export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandlerFunction<Event>>>();

  subscribe<TEvent extends Event>(
    eventType: TEvent["type"],
    handler: EventHandler<TEvent> | EventHandlerFunction<TEvent>,
  ): EventSubscription {
    const normalizedHandler = this.normalizeHandler(handler);
    const existingHandlers = this.handlers.get(eventType) ?? new Set<EventHandlerFunction<Event>>();

    existingHandlers.add(normalizedHandler);
    this.handlers.set(eventType, existingHandlers);

    return () => {
      existingHandlers.delete(normalizedHandler);

      if (existingHandlers.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }

  async publish<TEvent extends Event>(event: TEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);

    if (!handlers || handlers.size === 0) {
      return;
    }

    await Promise.all(Array.from(handlers, (handler) => handler(event)));
  }

  clear(eventType?: string): void {
    if (eventType) {
      this.handlers.delete(eventType);
      return;
    }

    this.handlers.clear();
  }

  private normalizeHandler<TEvent extends Event>(
    handler: EventHandler<TEvent> | EventHandlerFunction<TEvent>,
  ): EventHandlerFunction<Event> {
    if (typeof handler === "function") {
      return handler as EventHandlerFunction<Event>;
    }

    return ((event: Event) => handler.handle(event as TEvent)) as EventHandlerFunction<Event>;
  }
}

