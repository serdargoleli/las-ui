import { IConfigProps } from "./config";

export const colorPropertyMap: Record<string, string> = {
    "bg": "background-color",
    "text": "color",
    "border": "border-color",
    "outline": "outline-color",
    "decoration": "text-decoration-color",
    "caret": "caret-color",
    "fill": "fill",
    "stroke": "stroke",
    "shadow": "--las-shadow-color", // CSS variable for shadow
    "text-shadow": "--las-text-shadow-color" // CSS variable for text-shadow
};
const SHADOW_PROPERTIES = new Set(["shadow", "text-shadow"]);
const ALLOWED_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export function generateColor(className: string, config: IConfigProps): string | null {
    let opacity: number | null = null;

    // Opacity kontrolü (bg-red-500/10)
    if (className.includes('/')) {
        const [name, opacityPart] = className.split('/');
        className = name; // Class ismini güncelle (bg-red-500 olarak kalsın)

        // Config'den opacity değerini al
        if (config.opacities && config.opacities[opacityPart]) {
            opacity = parseFloat(config.opacities[opacityPart]);
        }
        // Config'de yoksa ve sayıysa (örn: /33 -> 0.33)

    }

    const parts = className.split('-');
    //en az 2 parçalı olmalı bg-red-500 veya bg-white gibi
    if (parts.length < 2) return null;

    const prefix = parts[0];

    //gelen prefix sassta tanımlı değil veya false ise veya colorPropertyMap'te yoksa (rastgele prefix girdiyse null dön)  
    if (!config.colorPrefix[prefix] || !colorPropertyMap[prefix]) {
        return null;
    }

    const cssProperty = colorPropertyMap[prefix];

    //#region Single Colors
    // 1. Single Colors Kontrolü (bg-white, text-black vb.)
    // Bu renkler shade almaz ve direkt kullanılır.
    const singleColorName = parts[1];
    // Eğer config.singleColors içinde varsa
    if (config.singleColors && config.singleColors[singleColorName]) {
        // Shade kontrolü: Eğer bg-white-500 yazıldıysa, bu single color mantığına uymaz.
        if (parts.length == 2) {
            const hexColor = config.singleColors[singleColorName]

            // shadow veya text-shadow ise burada class değil değişken tanımlanır ve rgb olarak tanımlar 
            if (SHADOW_PROPERTIES.has(prefix)) {
                // Shadow için opacity desteği şu anlık yok veya farklı işleyebilir
                // Ancak shadow color variable olduğu için, belki variable'ı güncelleyebiliriz?
                // Şimdilik shadow için opacity'i es geçelim veya rgbValue'ya uygulayalım.
                // Shadow genellikle --las-shadow-color: rgb(0 0 0) şeklinde.
                // Opacity varsa rgba(0, 0, 0, 0.1) gibi olmalı.

                if (opacity !== null) {
                    const rgbaValue = hexToRgba(hexColor, opacity);
                    return `${cssProperty}: ${rgbaValue};`;
                }

                const rgbValue = hexToRgbString(hexColor);
                return `${cssProperty}: ${rgbValue};`;
            }

            // Normal renkler
            if (opacity !== null) {
                const rgbaValue = hexToRgba(hexColor, opacity);
                return `${cssProperty}: ${rgbaValue};`;
            }

            // SHADOW_PROPERTIES dışında kalan propertyleri hex olarak üretür
            return `${cssProperty}: ${hexColor};`;
        }
    }

    //#endregion Single Colors

    //#region Palette Colors
    // 2. Palette Colors (bg-red-500 vb.)
    let colorName = parts[1];
    let shade = 500;
    let hasShade = false;

    // Eğer 3 parça varsa (bg-red-500)
    if (parts.length >= 3) {
        const lastPart = parts[parts.length - 1];
        // Son parça sayı mı?
        if (isDigitsOnly(lastPart)) {
            const parsedShade = parseInt(lastPart);
            // geçerli bir shade ise 
            if (ALLOWED_SHADES.includes(parsedShade)) {
                shade = parsedShade;
                hasShade = true;
                // Renk adı aradaki her şey olabilir (örn: light-blue)
                //parts 1 prefix sonuncu shade hariç tümünü al
                colorName = parts.slice(1, -1).join('-');
            } else {
                return null
            }
        } else {
            return null
        }
    }
    //#endregion Palette Colors

    // Palette colors must have a shade
    if (!hasShade) return null;

    const hexColor = config.colors[colorName];
    // girilen renk mevcut renkler arasında yoksa null döndürür
    if (!hexColor) return null;


    // Rengi hesapla
    const finalColor = calculateColor(hexColor, shade);

    if (opacity !== null) {
        const rgbaValue = hexToRgba(finalColor, opacity);
        return `${cssProperty}: ${rgbaValue};`;
    }

    return `${cssProperty}: ${finalColor};`;

}


//#region Helper Functions
/**
 * @description 
 * hex kodunu rgb string formatına çevirir
 * @param hex hex kodu
 * @returns 
 */
function hexToRgbString(hex: string): string {
    if (hex === 'transparent') return 'transparent';
    if (hex === 'currentColor') return 'currentColor';

    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    return `rgb(${rgb.r} ${rgb.g} ${rgb.b})`;
}

function hexToRgba(hex: string, alpha: number): string {
    if (hex === 'transparent' || hex === 'currentColor') return hex;

    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * @description
 * hex kodunu rgb formatına çevirir
 * @param hex hex kodu
 * @returns 
 */
function hexToRgb(hex: string) {
    // hex kodunu yakalaı
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16), //hex (16’lık) stringi onluk sayıya çevirir. ff -> 255
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * @description
 * string sadece rakamlardan oluşuyorsa true döndürür
 * @param str 
 * @returns 
 */
function isDigitsOnly(str: string): boolean {
    return /^\d+$/.test(str);
}


function calculateColor(hex: string, shade: number): string {
    if (hex === 'transparent' || hex === 'currentColor') return hex;

    // 500 ise direkt rengi döndür
    if (shade === 500) return hex;


    // 50-950 arası
    if (shade < 500) {
        // Beyaz ile karıştır
        const whitePercent = (500 - shade) / 500 * 100;
        return mixColors(hex, '#ffffff', whitePercent);
    } else {
        // Siyah ile karıştır
        const blackPercent = (shade - 500) / 500 * 100;
        return mixColors(hex, '#000000', blackPercent);
    }
}

function mixColors(color1: string, colorTransition: string, weight: number): string {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(colorTransition);
    if (!c1 || !c2) return color1;

    const w = weight / 100;

    const r = Math.round(c1.r * (1 - w) + c2.r * w);
    const g = Math.round(c1.g * (1 - w) + c2.g * w);
    const b = Math.round(c1.b * (1 - w) + c2.b * w);

    return rgbToHex(r, g, b);
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
//#endregion Helper Functions