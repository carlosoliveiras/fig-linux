import { app, ipcMain, BrowserView, Rectangle, IpcMainEvent } from "electron";
import { storage } from "Main/Storage";
import { isDev } from "Utils/Common";
import { settingsUrlProd, settingsUrlDev, toggleDetachedDevTools, Listeners } from "Utils/Main";
import { dialogs } from "Main/Dialogs";

export default class SettingsView {
  private enableColorSpaceSrgbWasChanged = false;
  private disableThemesChanged = false;
  private chromiumFlagsChanged = false;

  public view: BrowserView;
  private listeners = new Listeners();

  constructor() {
    this.view = new BrowserView({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        experimentalFeatures: false,
        webviewTag: true,
      },
    });

    this.view.setAutoResize({
      width: true,
      height: true,
      horizontal: true,
      vertical: true,
    });

    this.view.webContents.loadURL(isDev ? settingsUrlDev : settingsUrlProd);

    this.registerEvents();
  }

  public closeDevTools() {
    if (this.view.webContents.isDevToolsOpened()) {
      this.view.webContents.closeDevTools();
    }
  }

  public postClose() {
    let id = 1;
    if (this.enableColorSpaceSrgbWasChanged) {
      id = dialogs.showMessageBoxSync({
        type: "question",
        title: "Figma",
        message: "Restart to Change Color Space?",
        detail: `Figma needs to be restarted to change the color space.`,
        textOkButton: "Restart",
        defaultFocusedButton: "Ok",
      });
    }
    if (this.chromiumFlagsChanged) {
      id = dialogs.showMessageBoxSync({
        type: "question",
        title: "Figma",
        message: "Restart to apply Chromium flags?",
        detail: `Figma needs to be restarted to ppply Chromium flags.`,
        textOkButton: "Restart",
        defaultFocusedButton: "Ok",
      });
    }
    if (this.disableThemesChanged) {
      let text = "Restart to disable themes?";
      const disableThemes = storage.settings.app.disableThemes;

      if (!disableThemes) {
        text = "Restart to enable themes?";
      }

      id = dialogs.showMessageBoxSync({
        type: "question",
        title: "Figma",
        message: text,
        detail: `Figma needs to be restarted to change use of themes.`,
        textOkButton: "Restart",
        defaultFocusedButton: "Ok",
      });
    }

    if (!id) {
      app.emit("relaunchApp");
    }
  }

  public updateProps(bounds: Rectangle) {
    this.enableColorSpaceSrgbWasChanged = false;
    this.disableThemesChanged = false;
    this.chromiumFlagsChanged = false;
    this.view.setBounds({
      height: bounds.height,
      width: bounds.width,
      y: 0,
      x: 0,
    });
  }

  public toggleThemeCreatorPreviewMask() {
    this.view.webContents.send("toggleThemeCreatorPreviewMask");
  }

  private enableColorSpaceSrgbChange(changed: boolean) {
    this.enableColorSpaceSrgbWasChanged = changed;
  }
  private chromiumFlagsChange(enabled: boolean) {
    this.chromiumFlagsChanged = enabled;
  }
  private disableThemesChange(changed: boolean) {
    this.disableThemesChanged = changed;
  }
  private syncThemesEnd(themes: Themes.Theme[]) {
    this.view.webContents.send("themesLoaded", themes);
  }
  private loadCurrentTheme(theme: Themes.Theme) {
    this.view.webContents.send("loadCurrentTheme", theme);
  }
  private loadCreatorThemes(themes: Themes.Theme[]) {
    this.view.webContents.send("loadCreatorThemes", themes);
  }
  private changeTheme(_: IpcMainEvent, theme: Themes.Theme) {
    this.loadCurrentTheme(theme);

    storage.settings.theme.currentTheme = theme.id;
  }

  public loadSettings() {
    this.view.webContents.send("loadSettings", storage.settings);
  }
  private handleFrontReady() {
    this.loadSettings();
  }

  public destroy() {
    this.listeners.removeAll();

    if (!this.view.webContents.isDestroyed()) {
      this.view.webContents.close();
    }
  }

  private registerEvents() {
    const on = this.listeners.on.bind(this.listeners);

    on(ipcMain, "changeTheme", this.changeTheme.bind(this));
    on(ipcMain, "frontReady", this.handleFrontReady.bind(this));

    on(app, "enableColorSpaceSrgbWasChanged", this.enableColorSpaceSrgbChange.bind(this));
    on(app, "chromiumFlagsChanged", this.chromiumFlagsChange.bind(this));
    on(app, "disableThemesChanged", this.disableThemesChange.bind(this));
    on(app, "syncThemesEnd", this.syncThemesEnd.bind(this));
    on(app, "loadCurrentTheme", this.loadCurrentTheme.bind(this));
    on(app, "loadCreatorThemes", this.loadCreatorThemes.bind(this));
  }
}
