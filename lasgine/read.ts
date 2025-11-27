import path from 'path';
import fs from 'fs';

const red = '\x1b[31m';
const reset = '\x1b[0m';

export function readBaseCSS() {
    // Production 
    let cssPath = path.resolve(__dirname, '../utility.min.css');

    if (!fs.existsSync(cssPath)) {
        cssPath = path.resolve(__dirname, '../dist/utility.min.css');
    }
    if (!fs.existsSync(cssPath)) {
        console.error(`${red}
❌ utility.min.css dosyası bulunamadı!

Aranan dosya yolu: ${cssPath}

Lütfen dosyanın mevcut olduğunu ve yolu doğru yazdığınızı kontrol edin.
${reset}`);
        process.exit(1);

    }

    return fs.readFileSync(cssPath, 'utf-8');
}

export function readMetaCSS() {
    let metaPath = path.resolve(__dirname, '../meta.min.css');
    if (!fs.existsSync(metaPath)) {
        metaPath = path.resolve(__dirname, '../dist/meta.min.css');

    }
    if (!fs.existsSync(metaPath)) {
        console.error(`${red}
❌ meta.min.css dosyası bulunamadı!

Aranan dosya yolu: ${metaPath}

Lütfen dosyanın mevcut olduğunu ve yolu doğru yazdığınızı kontrol edin.
${reset}`);
        process.exit(1);
    }
    return fs.readFileSync(metaPath, 'utf-8');

}