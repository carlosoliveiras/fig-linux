import { session } from "electron";

import * as Const from "Const";
import { logger } from "./Logger";
import { dialogs } from "./Dialogs";

const ALLOWED_PERMISSIONS = [
  "fullscreen",
  "pointerLock",
  "clipboard-read",
  "clipboard-write",
  "clipboard-sanitized-write",
];

export default class Session {
  private _hasFigmaSession: boolean;
  // Tabs (by webContents id) where the user allowed the microphone.
  private microphoneAllowed = new Set<number>();

  constructor() {
    this._hasFigmaSession = null;
  }

  public get hasFigmaSession() {
    return this._hasFigmaSession;
  }

  public handleAppReady = () => {
    // One handler for the whole session; each tab used to replace it with its own.
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (ALLOWED_PERMISSIONS.includes(permission)) {
        return callback(true);
      }
      if (permission !== "media") {
        return callback(false);
      }
      if (this.microphoneAllowed.has(webContents.id)) {
        return callback(true);
      }

      dialogs
        .showMessageBox({
          type: "question",
          title: "Figma",
          message: "Microphone access required for voice call.",
          detail: "Allow microphone access?",
          textOkButton: "Allow",
          textCancelButton: "Deny",
          defaultFocusedButton: "Ok",
        })
        .then((button) => {
          if (button === 0) {
            this.microphoneAllowed.add(webContents.id);
          }
          callback(button === 0);
        });
    });

    const defaultUserAgent = session.defaultSession.getUserAgent();
    const userAgent = defaultUserAgent.replace(/Figma([^/]+)\/([^\s]+)/, "Figma$1/$2 Figma/$2");

    session.defaultSession.setUserAgent(userAgent);
    session.defaultSession.cookies
      .get({
        url: Const.HOMEPAGE,
      })
      .then((cookies) => {
        this._hasFigmaSession = !!cookies.find((cookie) => {
          return cookie.name === Const.FIGMA_SESSION_COOKIE_NAME;
        });

        logger.info("[wm] already signed in?", this._hasFigmaSession);
      })
      .catch((error: Error) =>
        logger.warn("[wm] failed to get cookies during handleAppReady:", Const.HOMEPAGE, error),
      );
  };
}
