import * as path from "path";
import { logger } from "Main/Logger";

import { AVAILABLE_THEME_COLOR_VALUE, DEFAULT_PALETTE } from "Const";
import { keysToCamelCase } from "Utils/Common";

// Theme files use camelCase keys; the default palette is the list of fields.
const AVAILABLE_THEME_FIELDS = Object.keys(keysToCamelCase(DEFAULT_PALETTE));

export default class ThemeValidator {
  public isValidThemeFile(filePath: string, theme: Themes.Theme): boolean {
    const extname = path.extname(filePath);

    if (extname !== ".json") {
      logger.error(`The file "${filePath}" has not .json extension`);
      return false;
    }

    if (!theme.author || !theme.name || !theme.palette) {
      logger.error(`The file "${filePath}" has not the author or name or palette fields`);
      return false;
    }

    if (!this.isValidThemePalette(theme, filePath)) {
      return false;
    }

    return true;
  }
  public isValidThemePalette(theme: Themes.Theme, fileName?: string): boolean {
    if (!theme.palette) {
      return false;
    }

    if (!fileName) {
      fileName = theme.name;
    }

    const palette = Object.keys(theme.palette);

    if (palette.length !== AVAILABLE_THEME_FIELDS.length) {
      logger.error(`The file "${fileName}" has invalid count of palette colors`);
      return false;
    }

    for (const paletteKey of palette) {
      const paletteValue = theme.palette[paletteKey];

      if (!AVAILABLE_THEME_FIELDS.includes(paletteKey)) {
        logger.error(`Theme "${fileName}" has unavailable color field "${paletteKey}"`);
        return false;
      }

      if (!this.checkThemeColorValue(paletteValue)) {
        logger.error(`Theme "${fileName}" has incorrect color value: "${paletteValue}" for "${paletteKey}" field`);
        return false;
      }
    }

    return true;
  }
  public checkThemeColorValue(value: string): boolean {
    return AVAILABLE_THEME_COLOR_VALUE.test(value);
  }
}
