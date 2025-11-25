import fs from 'fs';
import path from 'path';

export interface Config {
    screens: Record<string, string>;
    variants: Record<string, string>;
}

export function loadConfig(): Config {
    // 1. Meta CSS yolunu bul
    let metaPath = path.resolve(__dirname, '../meta.css');
    if (!fs.existsSync(metaPath)) {
        metaPath = path.resolve(__dirname, '../dist/meta.css');
    }

    if (!fs.existsSync(metaPath)) {
        throw new Error("Meta CSS dosyası bulunamadı! Önce build almalısın.");
    }

    const cssContent = fs.readFileSync(metaPath, 'utf-8');

    const screens: Record<string, string> = {};
    const variants: Record<string, string> = {};

    // Regex ile değişkenleri yakala: --las-(breakpoint|variant)-([a-z0-9-]+):\s*([^;]+);
    const regex = /--las-(breakpoint|variant)-([a-z0-9-]+):\s*([^;]+);/g;

    let match;
    while ((match = regex.exec(cssContent)) !== null) {
        const type = match[1]; // breakpoint veya variant
        const name = match[2]; // sm, md, hover vs.
        const value = match[3].trim(); // 768px, :hover vs.

        if (type === 'breakpoint') {
            screens[name] = value;
        } else if (type === 'variant') {
            variants[name] = value;
        }
    }

    return { screens, variants };
}
