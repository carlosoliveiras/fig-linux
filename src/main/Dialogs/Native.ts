import { MessageBoxOptions, dialog } from "electron";

const toElectronOptions = (options: Dialogs.MessageBoxOptions): MessageBoxOptions => {
  const ops: MessageBoxOptions = {
    type: options.type,
    title: options.title,
    message: options.message,
    detail: options.detail,
    defaultId: 0,
  };

  if (options.type === "question") {
    ops.buttons = [options.textOkButton || "Ok", options.textCancelButton || "Cancel"];
  } else if (options.textOkButton) {
    ops.buttons = [options.textOkButton];
  }

  return ops;
};

export class NativeDialogs implements ProviderDialog {
  public showMessageBox = async (options: Dialogs.MessageBoxOptions) => {
    const result = await dialog.showMessageBox(null, toElectronOptions(options));
    return result.response;
  };
  public showMessageBoxSync = (options: Dialogs.MessageBoxOptions) => {
    return dialog.showMessageBoxSync(null, toElectronOptions(options));
  };

  public showOpenDialog = async (options: Dialogs.OpenOptions) => {
    const result = await dialog.showOpenDialog(null, options);
    return !result.canceled ? result.filePaths : null;
  };

  public showSaveDialog = async (options: Dialogs.SaveOptions) => {
    const result = await dialog.showSaveDialog(null, options);
    return !result.canceled && result.filePath ? result.filePath : null;
  };
}
