import type { AuditEntry } from "./AuditEntry";

export abstract class AuditLogger {
  abstract log<TEntry extends AuditEntry>(entry: TEntry): void | Promise<void>;
}

export class NoopAuditLogger extends AuditLogger {
  log<TEntry extends AuditEntry>(_entry: TEntry): void {
    return undefined;
  }
}

