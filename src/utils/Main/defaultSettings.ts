import { randomUUID } from "crypto";

import { BASE_DEFAULT_SETTINGS } from "Utils/Common/defaultSettings";

export const DEFAULT_SETTINGS: Types.SettingsInterface = {
  ...BASE_DEFAULT_SETTINGS,
  clientId: randomUUID(),
};
