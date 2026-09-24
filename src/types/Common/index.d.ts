declare namespace Types {
  interface Tab {
    id: number;
    title?: string;
    url?: string;
    moves?: boolean;
    fileKey?: string;
    order?: number;
    focused?: boolean;
    isUsingMicrophone?: boolean;
    isInVoiceCall?: boolean;
    loading?: boolean;
    view: import("electron").BrowserView;
  }

  type TabIdType = number | "mainTab" | "communityTab";
  type TabFront = Pick<
    Tab,
    "id" | "title" | "order" | "isUsingMicrophone" | "isInVoiceCall" | "loading"
  >;

  interface AddTabProps {
    id: number;
    url: string;
    title?: string;
    focused?: boolean;
    order?: number;
  }

  interface SavedTab {
    title?: string;
    url?: string;
  }


  interface FeatureFlags {
    desktop_beta_use_agent_for_fonts?: boolean;
  }

  interface WindowState {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
    lastActiveTabPath: string;
    hasOpenedCommunityTab: boolean;
    userId: string;
    tabs: SavedTab[];
  }

  interface CommandSwitch {
    switch: string;
    value?: string;
  }
  interface SettingsInterface {
    clientId: string;
    userId: string;
    authedUserIDs: string[];
    app: {
      logLevel: number;
      lastTimeClearLogFile: number;
      enableColorSpaceSrgb: boolean;
      visibleNewProjectBtn: boolean;
      useZenity: boolean;
      disableThemes: boolean;
      panelHeight: number;
      saveLastOpenedTabs: boolean;
      exportDir: string;
      recentlyClosedTabs: SavedTab[];
      commandSwitches: CommandSwitch[];
      windowsState: {
        [key: string]: WindowState;
      };
      lastOpenedTabs:
        | {
            [key: string]: SavedTab[];
          }
        | SavedTab[];
      featureFlags: FeatureFlags;
      savedExtensions: Extensions.ExtensionJson[];
      lastSavedPluginDir?: string;
      lastExportDir?: string;
      themeDropdownOpen: boolean;
      creatorsThemesDropdownOpen: boolean;
      useOldPreviewer: boolean;
      dontShowTutorialCreator: boolean;
    };
    ui: {
      scalePanel: number;
      scaleFigmaUI: number;
    };
    theme: {
      currentTheme: string;
    };
    [path: string]: any;
  }
}
