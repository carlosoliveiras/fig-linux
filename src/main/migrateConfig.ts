import { app } from "electron";
import { cpSync, existsSync, renameSync, rmSync } from "fs";
import { basename, join } from "path";

// The app used to be called figma-linux, so settings, session and themes of
// existing users live in that directory. Copy them over on the first run under
// the new name. The old directory is left untouched.
// Must run before anything else reads app.getPath("userData").
const oldDir = join(app.getPath("appData"), "figma-linux");
const newDir = app.getPath("userData");

if (!existsSync(newDir) && existsSync(oldDir)) {
  const tmpDir = `${newDir}.migrating`;

  try {
    rmSync(tmpDir, { recursive: true, force: true });
    cpSync(oldDir, tmpDir, {
      recursive: true,
      // Chromium's single-instance lock files point at the old process.
      filter: (src) => !basename(src).startsWith("Singleton"),
    });
    renameSync(tmpDir, newDir);
  } catch (error) {
    console.error(`Could not migrate settings from ${oldDir}: `, error);
  }
}
