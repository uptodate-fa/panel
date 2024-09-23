import { Injectable } from '@angular/core';
import {
  Scheme,
  Theme,
  argbFromHex,
  argbFromRgba,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities';

const PRIMARY = '#007AC2';
const SECONDARY = '#EA8F00';
const TERTIARY = '#85BC1E';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  theme: Theme;
  constructor() {
    this.setThemeFromColor();
  }

  setThemeFromColor(): void {
    this.theme = themeFromSourceColor(argbFromHex(PRIMARY));
    this.createCustomProperties(this.schema);
  }

  private get schema() {
    const lightSchema = this.theme.schemes.light.toJSON();
    lightSchema.background = argbFromHex('#F6F6F6');
    lightSchema.onBackground = argbFromHex('#232323');
    lightSchema.primary = argbFromHex(PRIMARY);
    lightSchema.onPrimary = argbFromHex('#FFFFFF');
    lightSchema.secondary = argbFromHex(SECONDARY);
    lightSchema.onSecondary = argbFromHex('#FFFFFF');
    lightSchema.tertiary = argbFromHex(TERTIARY);
    lightSchema.onTertiary = argbFromHex('#FFFFFF');
    lightSchema.error = argbFromHex('#E5202E');
    lightSchema.onError = argbFromHex('#FFFFFF');
    lightSchema.surface = argbFromHex('#F6F6F6');
    lightSchema.onSurface = argbFromHex('#353535');
    lightSchema.outline = argbFromHex('#757575');
    lightSchema.shadow = argbFromRgba({ r: 43, g: 43, b: 43, a: 0.06 });

    return lightSchema;
  }

  private createCustomProperties(schemes: any) {
    let sheet = (globalThis as any)['material-tokens-class'];

    if (!sheet) {
      try {
        sheet = new CSSStyleSheet();
      } catch (error) {
        const styleElement = document.createElement('style');
        styleElement.id = 'material-tokens-class';
        document.head.appendChild(styleElement);
        sheet = styleElement.sheet;
      }
      (globalThis as any)['material-tokens-class'] = sheet;
      try {
        document.adoptedStyleSheets.push(sheet);
      } catch (error) {
        //
      }
    }

    let tokenClassString = ``;
    for (const key in schemes) {
      if (Object.prototype.hasOwnProperty.call(schemes, key)) {
        const keyText = key
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();

        const value = hexFromArgb(schemes[key]);
        document.body.style.setProperty(`--sys-${keyText}`, value);
        tokenClassString += `.${keyText}-text{color:${value} !important}.${keyText}-background{background-color:${value} !important}`;
      }
    }
    try {
      sheet.replaceSync(tokenClassString);
    } catch (error) {
      const rules = tokenClassString.split('.').forEach((rule) => {
        if (rule)
          (sheet as any).insertRule(`.${rule}`, (sheet as any).cssRules.length);
      });
    }
  }

  private getLuminance(hexColor: string): number {
    const argbColor = argbFromHex(hexColor);
    // Convert to a normalized RGB color
    const r = ((argbColor >> 16) & 0xff) / 255;
    const g = ((argbColor >> 8) & 0xff) / 255;
    const b = (argbColor & 0xff) / 255;

    // Calculate luminance
    const a = [r, g, b].map((c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  private getContrastRatio(hexColor1: string, hexColor2: string): number {
    const lum1 = this.getLuminance(hexColor1);
    const lum2 = this.getLuminance(hexColor2);
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  }

  chooseTextColor(backgroundColor: string): string {
    const white = '#FFFFFF';
    const black = '#000000';

    const contrastWithWhite = this.getContrastRatio(backgroundColor, white);
    const contrastWithBlack = this.getContrastRatio(backgroundColor, black);
    return contrastWithWhite > contrastWithBlack ? white : black;
  }
}
