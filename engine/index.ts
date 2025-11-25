import fs from 'fs';
import path from 'path';

export function getBaseCss() {
    // 1. Prod Yolu: ../utility.min.css
    let cssPath = path.resolve(__dirname, '../utility.min.css');

    // 2. Dev Yolu: ../dist/utility.min.css
    if (!fs.existsSync(cssPath)) {
        cssPath = path.resolve(__dirname, '../dist/utility.min.css');
    }

    if (!fs.existsSync(cssPath)) {
        throw new Error(`Base CSS dosyası bulunamadı! Aranan yollar kontrol edildi.\nSon denenen: ${cssPath}`);
    }

    return fs.readFileSync(cssPath, 'utf-8');
}

// Export diğer modüller için
export { parseCss } from './parser';
export { loadConfig } from './config';
export { generateCss } from './generator';
export { scanFile, scanDirectory } from './scanner';

