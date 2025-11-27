import { readMetaCSS } from './read';

export interface IConfigProps {
    screens: Record<string, string>;
    variants: Record<string, string>;
    colors: Record<string, string>;
    colorPrefix: Record<string, boolean>;
    singleColors: Record<string, string>;
    opacities: Record<string, string>;
}

export function loadConfig(): IConfigProps {
    // 1. Meta CSS yolunu bul
    const cssContent = readMetaCSS()

    const screens: Record<string, string> = {};
    const variants: Record<string, string> = {};
    const colors: Record<string, string> = {};
    const colorPrefix: Record<string, boolean> = {};
    const singleColors: Record<string, string> = {};
    const opacities: Record<string, string> = {};


    // Regex ile değişkenleri yakalar
    // --las-breakpoint-sm: ...
    // --las-variant-hover: ...
    // --las-color-red: ...
    // --las-config-color-bg: true
    // --las-opacity-50: 0.5
    const regex = /--las-(breakpoint|variant|color|config-color|single-color|opacity)-([a-z0-9-]+):\s*([^;]+);/g;

    let match;
    while ((match = regex.exec(cssContent)) !== null) {
        const type = match[1]; // breakpoint, variant, color, config-color
        const name = match[2]; // sm, hover, red, bg
        const value = match[3].trim();

        if (type === 'breakpoint') {
            screens[name] = value;
        } else if (type === 'variant') {
            variants[name] = value;
        } else if (type === 'color') {
            colors[name] = value;
        } else if (type === 'config-color') {
            colorPrefix[name] = value === 'true';
        } else if (type === 'single-color') {
            singleColors[name] = value;
        } else if (type === 'opacity') {
            opacities[name] = value;
        }
    }

    return { screens, variants, colors, colorPrefix, singleColors, opacities };
}