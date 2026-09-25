import type { EventEmitter } from "events";

// Listeners on process-wide emitters (app, ipcMain) outlive the window that
// registered them unless they are removed when it closes.
export class Listeners {
  private removers: Array<() => void> = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(emitter: EventEmitter, event: string, listener: (...args: any[]) => void) {
    emitter.on(event, listener);
    this.removers.push(() => emitter.removeListener(event, listener));
  }

  public removeAll() {
    this.removers.splice(0).forEach((remove) => remove());
  }
}
