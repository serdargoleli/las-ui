import { generateCss } from "./generator";
import path from "path";
import fs from "fs";

// output css string üretir
export function generateCSSContent(usedClasses: Set<string>, cssMap: Map<string, string>, config: any): string {
    let css = '/* LAS JIT - Auto-generated CSS */\n\n';

    // Breakpoint sırasını config'den al
    const screenKeys = Object.keys(config.screens);

    // Classları sırala
    const sortedClasses = Array.from(usedClasses).sort((a, b) => {
        return getSortOrder(a, screenKeys) - getSortOrder(b, screenKeys);
    });

    sortedClasses.forEach(cls => {
        const generated = generateCss(cls, cssMap, config);
        if (generated) {
            css += generated + '\n';
        }
    });

    return css;
}

// output css yazar
export function writeCSS(usedClasses: Set<string>, cssMap: Map<string, string>, config: any, outputPath: string) {
    const css = generateCSSContent(usedClasses, cssMap, config);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, css);
}

function getSortOrder(className: string, screenKeys: string[]): number {
    const parts = className.split(':');
    for (const part of parts) {
        // Eğer bu parça bir screen (breakpoint) ise indexini döndür
        const index = screenKeys.indexOf(part);
        if (index !== -1) {
            // 0 indexi base classlar için rezerve edildiğinden +1 ekliyoruz
            return index + 1;
        }
    }

    return 0;
}