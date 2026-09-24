import { storage } from "../Storage";
import { NativeDialogs } from "./Native";
import { ZenityDialogs } from "./Zenity";

export class Provider {
  private native = new NativeDialogs();
  private zenity = new ZenityDialogs();

  // Read on every call, so toggling the setting takes effect without a restart.
  private get provider(): ProviderDialog {
    return storage.settings.app.useZenity ? this.zenity : this.native;
  }

  public showMessageBox = (params: Dialogs.MessageBoxOptions): Promise<number> => {
    return this.provider.showMessageBox(params);
  };
  public showMessageBoxSync = (params: Dialogs.MessageBoxOptions): number => {
    return this.provider.showMessageBoxSync(params);
  };

  public showOpenDialog = (params?: Dialogs.OpenOptions): Promise<string[] | null> => {
    return this.provider.showOpenDialog(params);
  };

  public showSaveDialog = (params: Dialogs.SaveOptions): Promise<string | null> => {
    return this.provider.showSaveDialog(params);
  };
}

export const dialogs = new Provider();
