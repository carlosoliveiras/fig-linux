import { ipcMain } from "electron";

import { Logger } from "./Logger";

export class AppLogger extends Logger {
  constructor(private sources: Logger[]) {
    super();

    this.initLoggerEvent();
  }

  private initLoggerEvent = (): void => {
    ipcMain.on("logWarn", (sender, ...msg) =>
      this.warn(`[From web content: ${sender.sender.id}]`, ...msg),
    );
    ipcMain.on("logError", (sender, ...msg) =>
      this.error(`[From web content: ${sender.sender.id}]`, ...msg),
    );
  };

  public log = (msg: string) => {
    for (const source of this.sources) {
      source.log(msg);
    }
  };
}
