import { LogLevel } from "Types/enums";

/**
 * Default settings shared by the main and the renderer processes.
 *
 * The only value that differs between them is `clientId`: the main process
 * generates it, the renderer receives the stored one over IPC. Keeping the rest
 * in a single place prevents the two defaults from drifting apart, which would
 * make the Settings UI show values the app never applies.
 */
export const BASE_DEFAULT_SETTINGS: Types.SettingsInterface = {
  clientId: "",
  userId: "",
  authedUserIDs: [],
  app: {
    logLevel: LogLevel.INFO,
    lastTimeClearLogFile: 0,
    enableColorSpaceSrgb: false,
    visibleNewProjectBtn: true,
    useZenity: false,
    disableThemes: false,
    panelHeight: 40,
    saveLastOpenedTabs: true,
    exportDir: `${process.env.HOME}/Pictures/Figma`,
    commandSwitches: [
      { switch: "enable-gpu-rasterization" },
      // { switch: "enable-unsafe-webgpu" },
      // { switch: "enable-skia-graphite" },
      // { switch: "enable-accelerated-2d-canvas" },
      { switch: "use-vulkan" },
    ],
    fontDirs: [
      "/usr/share/fonts",
      "/usr/local/share/fonts",
      "/run/host/fonts",
      "/run/host/user-fonts",
      `${process.env.HOME}/.local/share/fonts`,
    ],
    recentlyClosedTabs: [],
    windowsState: {},
    lastOpenedTabs: {},
    featureFlags: {},
    savedExtensions: [],
    themeDropdownOpen: true,
    creatorsThemesDropdownOpen: false,
    useOldPreviewer: false,
    dontShowTutorialCreator: false,
  },
  theme: {
    currentTheme: "0",
  },
  ui: {
    scalePanel: 1,
    scaleFigmaUI: 1,
  },
};
