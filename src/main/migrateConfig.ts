import { app } from "electron";
import { copyFileSync, cpSync, existsSync } from "fs";
import { basename, join } from "path";

// The app used to be called figma-linux, so settings, session and themes of
// existing users live in that directory. Copy them over on the first run under
// the new name. The old directory is left untouched.
// Must run before anything else reads app.getPath("userData").
const oldDir = join(app.getPath("appData"), "figma-linux");
const newDir = app.getPath("userData");
const SETTINGS = "settings.json";

// Electron creates userData (Crashpad) before this runs, so the directory
// always exists. settings.json is copied last and marks a finished migration;
// an interrupted copy is simply redone on the next start.
if (!existsSync(join(newDir, SETTINGS)) && existsSync(join(oldDir, SETTINGS))) {
  try {
    cpSync(oldDir, newDir, {
      recursive: true,
      // Chromium's single-instance lock files point at the old process.
      filter: (src) => src !== join(oldDir, SETTINGS) && !basename(src).startsWith("Singleton"),
    });
    copyFileSync(join(oldDir, SETTINGS), join(newDir, SETTINGS));
  } catch (error) {
    console.error(`Could not migrate settings from ${oldDir}: `, error);
  }
}
