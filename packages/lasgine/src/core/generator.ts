import { generateColor } from "./color";
import { IConfigProps } from "./config";
import { generateArbitrary } from "./arbitrary";

/**
 * JIT Generator - Dinamik CSS Üretici
 * 
 * Örnek: "md:hover:text-center" -> CSS kodu
 * 
 * @param className - Kullanıcının yazdığı class ismi (örn: "md:hover:text-center")
 * @param cssMap - Utility class'ların CSS kodlarını içeren Map
 * @param config - Breakpoint ve variant tanımları
 * @returns Üretilen CSS kodu veya null (eğer class bulunamazsa)
 */
export function generateCss(className: string, cssMap: Map<string, string>, config: IConfigProps) {
    const parts = className.split(':');
    const baseClass = parts[parts.length - 1];
    let baseCss = cssMap.get(baseClass);
    if (!baseCss) {
        // 1. Önce arbitrary value kontrolü (bg-[#123], p-[20px])
        const arbitraryCss = generateArbitrary(baseClass);
        if (arbitraryCss) {
            baseCss = arbitraryCss;
        }
        // 2. Sonra renk utility kontrolü
        else {
            const colorCss = generateColor(baseClass, config);
            if (colorCss) {
                baseCss = colorCss;
            } else {
                return null;
            }
        }
    }


    const modifiers = parts.slice(0, -1);
    const escapedClassName = escapeClassName(className);
    let css = `.${escapedClassName} { ${baseCss} }`;

    for (let i = modifiers.length - 1; i >= 0; i--) {
        const modifier = modifiers[i];
        if (config.screens[modifier]) {
            css = `@media (min-width: ${config.screens[modifier]}) {\n  ${css}\n}`;
        }
        else if (config.variants[modifier]) {
            css = css.replace(
                `.${escapedClassName}`,
                `.${escapedClassName}${config.variants[modifier]}`
            );
        }
    }
    return css;

}

/**
 * CSS class isimlerindeki özel karakterleri escape eder
 * Örnek: "md:text-center" -> "md\\:text-center"
 */
function escapeClassName(className: string): string {
    let escaped = className.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
    if (/^-?\d/.test(escaped)) {
        escaped = `\\3${escaped[0]} ${escaped.slice(1)}`;
    }
    return escaped;
}
