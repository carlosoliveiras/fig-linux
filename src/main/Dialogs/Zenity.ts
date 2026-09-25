import { execFile, execFileSync } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Arguments go straight to zenity, never through a shell: file names come
// from Figma and can contain quotes, `$(...)` or backticks. Success is the
// exit code only, since GTK often prints warnings on stderr.
const messageBoxArgs = (options: Dialogs.MessageBoxOptions) => {
  const args = [`--${options.type}`, "--ellipsize"];

  if (options.title) {
    args.push(`--title=${options.title}`);
  }
  if (options.message || options.detail) {
    args.push(`--text=${[options.message, options.detail].filter(Boolean).join("\n")}`);
  }
  if (options.textOkButton) {
    args.push(`--ok-label=${options.textOkButton}`);
  }
  if (options.type === "question") {
    if (options.textCancelButton) {
      args.push(`--cancel-label=${options.textCancelButton}`);
    }
    if (options.defaultFocusedButton === "Cancel") {
      args.push("--default-cancel");
    }
  }

  return args;
};

const selectedPath = (stdout: string) => stdout.replace(/\n$/, "");

export class ZenityDialogs implements ProviderDialog {
  public showMessageBox = async (options: Dialogs.MessageBoxOptions) => {
    try {
      await execFileAsync("zenity", messageBoxArgs(options));
      return 0;
    } catch (error) {
      return 1;
    }
  };
  public showMessageBoxSync = (options: Dialogs.MessageBoxOptions) => {
    try {
      execFileSync("zenity", messageBoxArgs(options), { stdio: "ignore" });
      return 0;
    } catch (error) {
      return 1;
    }
  };

  public showOpenDialog = async (options: Dialogs.OpenOptions) => {
    const args = ["--file-selection"];

    if (options.defaultPath) {
      args.push(`--filename=${options.defaultPath}`);
    }
    if (options.properties?.includes("openDirectory")) {
      args.push("--directory");
    }
    if (options.properties?.includes("multiSelections")) {
      args.push("--multiple");
    }

    try {
      const { stdout } = await execFileAsync("zenity", args);
      return selectedPath(stdout).split("|");
    } catch (error) {
      return null;
    }
  };

  public showSaveDialog = async (options: Dialogs.SaveOptions) => {
    const args = ["--file-selection", "--save", "--confirm-overwrite"];

    if (options.defaultPath) {
      args.push(`--filename=${options.defaultPath}`);
    }

    try {
      const { stdout } = await execFileAsync("zenity", args);
      return selectedPath(stdout);
    } catch (error) {
      return null;
    }
  };
}
