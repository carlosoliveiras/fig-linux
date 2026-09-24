import { createWriteStream, writeFileSync, WriteStream } from "fs";
import { join } from "path";
import { app } from "electron";

import { storage } from "../Storage";
import { Logger } from "./Logger";

export class FileLogger extends Logger {
  private logFilePath: string;
  // One append stream: opening the file for every line cost a syscall round
  // trip each time, and concurrent appends could land out of order.
  private stream: WriteStream;

  constructor() {
    super();

    this.logFilePath = join(app.getPath("userData"), "logfile.log");
    this.truncFile();
    this.stream = createWriteStream(this.logFilePath, { flags: "a" });
    this.stream.on("error", (error) => {
      console.error(`Cannot write log to file: ${this.logFilePath}, error: `, error);
    });
  }

  private truncFile() {
    const currentTimestamp = new Date().getTime();

    if (storage.settings.app.lastTimeClearLogFile === 0) {
      storage.settings.app.lastTimeClearLogFile = currentTimestamp;
      storage.save();
    }

    const cmprTimestamp = storage.settings.app.lastTimeClearLogFile + 8.64e7;

    if (cmprTimestamp <= currentTimestamp) {
      try {
        writeFileSync(this.logFilePath, "");
      } catch (error) {
        console.error(`Cannot clear log file: ${this.logFilePath}, error: `, error);
      }

      storage.settings.app.lastTimeClearLogFile = currentTimestamp;
      storage.save();
    }
  }

  public log = (msg: string) => {
    this.stream.write(`${msg}\n`);
  };
}
