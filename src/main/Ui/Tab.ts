import { parse } from "url";
import {
  app,
  shell,
  Rectangle,
  BrowserView,
  BrowserWindow,
  HandlerDetails,
  DidCreateWindowDetails,
  BrowserViewConstructorOptions,
} from "electron";

import { preloadScriptPathDev, preloadScriptPathProd } from "Utils/Main";
import {
  isDev,
  isValidProjectLink,
  isPrototypeUrl,
  isAppAuthRedeem,
  isFigmaDocLink,
} from "Utils/Common";
import { logger } from "Main/Logger";

export default class Tab {
  public id: number;
  public title?: string;
  public url?: string;
  public moves?: boolean;
  public fileKey?: string;
  public isInVoiceCall?: boolean;
  public view: BrowserView;

  constructor(private windowId: number) {
    this.initTab();
    this.registerEvents();
  }

  public loadUrl(url: string) {
    this.url = url;
    this.view.webContents.loadURL(url);
  }
  public getUrl() {
    return this.view.webContents.getURL();
  }
  public setAutosize(flag: boolean) {
    this.view.setAutoResize({
      width: flag,
      height: flag,
      horizontal: flag,
      vertical: flag,
    });
  }
  public setBounds(bounds: Rectangle) {
    this.view.setBounds(bounds);
  }

  private initTab() {
    const options: BrowserViewConstructorOptions = {
      webPreferences: {
        nodeIntegration: false,
        webgl: true,
        contextIsolation: false,
        zoomFactor: 1,
        preload: isDev ? preloadScriptPathDev : preloadScriptPathProd,
      },
    };

    this.view = new BrowserView(options);
    this.id = this.view.webContents.id;

    this.setAutosize(true);

    app.emit("requestBoundsForTabView", this.windowId);
  }

  public updateScale(scale: number) {
    this.view.webContents.setZoomFactor(scale);
  }
  public reloadCurrentTheme() {
    app.emit("reloadCurrentTheme");
  }

  private onDomReady(event: any) {
    this.reloadCurrentTheme();
  }
  private onMainWindowWillNavigate(event: any, newUrl: string) {
    const currentUrl = event.sender.getURL();

    if (isAppAuthRedeem(newUrl)) {
      return;
    }

    if (newUrl === currentUrl) {
      event.preventDefault();
      return;
    }

    if (isFigmaDocLink(newUrl)) {
      shell.openExternal(newUrl);

      event.preventDefault();
      return;
    }

    const from = parse(currentUrl);
    const to = parse(newUrl);

    if (from.pathname === "/login") {
      // TODO:

      event.preventDefault();
      return;
    }

    if (to.pathname === "/logout") {
      app.emit("signOut");
    }

    if (to.search && to.search.match(/[?&]redirected=1/)) {
      event.preventDefault();
      return;
    }
  }
  private onNewWindow(window: BrowserWindow, details: DidCreateWindowDetails) {
    const url = details.url;
    logger.debug("newWindow, url: ", url);

    if (/start_google_sso/.test(url)) return;

    if (isPrototypeUrl(url) || isValidProjectLink(url)) {
      app.emit("openUrlInNewTab", url);
      return;
    }

    shell.openExternal(url);
  }

  private windowOpenHandler(details: HandlerDetails) {
    const { url } = details;

    if (isPrototypeUrl(url) || isValidProjectLink(url)) {
      app.emit("openUrlInNewTab", url);
    } else {
      shell.openExternal(url);
    }

    return { action: "deny" };
  }

  private registerEvents() {
    this.view.webContents.setWindowOpenHandler(this.windowOpenHandler.bind(this));
    this.view.webContents.on("will-navigate", this.onMainWindowWillNavigate.bind(this));
    this.view.webContents.on("dom-ready", this.onDomReady.bind(this));
    this.view.webContents.on("did-create-window", this.onNewWindow.bind(this));

  }
}
