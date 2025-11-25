import { Config } from './config';

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
export function generateCss(
    className: string,
    cssMap: Map<string, string>,
    config: Config
): string | null {
    // 1. Class ismini ':' ile parçala
    const parts = className.split(':');

    // 2. En sondaki parça = Kök utility class
    const baseClass = parts[parts.length - 1];

    // 3. Kök class'ı Map'te ara
    const baseCss = cssMap.get(baseClass);
    if (!baseCss) {
        return null; // Class bulunamadı
    }

    // 4. Modifier'ları (md, hover, vb.) topla
    const modifiers = parts.slice(0, -1);

    // 5. CSS kodunu oluştur
    let css = `.${escapeClassName(className)} { ${baseCss} }`;

    // 6. Modifier'ları uygula (tersten, içten dışa doğru)
    for (let i = modifiers.length - 1; i >= 0; i--) {
        const modifier = modifiers[i];

        // Breakpoint mu?
        if (config.screens[modifier]) {
            css = `@media (min-width: ${config.screens[modifier]}) {\n  ${css}\n}`;
        }
        // Variant (pseudo-selector) mu?
        else if (config.variants[modifier]) {
            // Pseudo selector'ı class'a ekle
            css = css.replace(
                `.${escapeClassName(className)}`,
                `.${escapeClassName(className)}${config.variants[modifier]}`
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
    return className.replace(/:/g, '\\:');
}
