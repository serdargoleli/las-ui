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

// Shadow properties that should use CSS variables instead of direct colors
const SHADOW_PROPERTIES = new Set(["shadow", "text-shadow"]);

const ALLOWED_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export function generateColor(className: string, config: IConfigProps): string | null {
    const parts = className.split('-');
    // En az 2 parça olmalı (prefix-color), örn: bg-red veya text-white
    if (parts.length < 2) return null;

    const prefix = parts[0];

    // Config'de bu prefix aktif mi ve map'te karşılığı var mı?
    if (!config.colorPrefix[prefix] || !colorPropertyMap[prefix]) {
        return null;
    }

    const cssProperty = colorPropertyMap[prefix];

    // 1. Single Colors Kontrolü (bg-white, text-black vb.)
    // Bu renkler shade almaz ve direkt kullanılır.

    // parts[1] potansiyel renk adıdır (örn: bg-white -> white)
    const potentialSingleColor = parts[1];

    // Eğer config.singleColors içinde varsa ve shade belirtilmemişse (parts.length === 2)
    if (config.singleColors && config.singleColors[potentialSingleColor]) {
        // Shade kontrolü: Eğer bg-white-500 yazıldıysa, bu single color mantığına uymaz.
        // Biz sadece bg-white kabul ediyoruz.
        if (parts.length === 2) {
            const hexColor = config.singleColors[potentialSingleColor];

            // Shadow properties için rgb formatına çevir
            if (SHADOW_PROPERTIES.has(prefix)) {
                const rgbValue = hexToRgbString(hexColor);
                return `${cssProperty}: ${rgbValue};`;
            }

            return `${cssProperty}: ${hexColor};`;
        }
        // Eğer bg-white-500 yazıldıysa, aşağıya düşecek ve palette colors içinde aranacak.
        // Ama white palette içinde yoksa null dönecek. Bu doğru davranış.
    }

    // 2. Palette Colors (bg-red-500 vb.)
    // Renk ve shade'i bul
    let colorName = parts[1];
    let shade = 500; // Default shade
    let hasShade = false;

    // Eğer 3 parça varsa (bg-red-500)
    if (parts.length >= 3) {
        // Son parça sayı mı?
        const lastPart = parts[parts.length - 1];
        if (/^\d+$/.test(lastPart)) {
            const parsedShade = parseInt(lastPart);
            // Shade geçerli listede mi?
            if (ALLOWED_SHADES.includes(parsedShade)) {
                shade = parsedShade;
                hasShade = true;
                // Renk adı aradaki her şey olabilir (örn: light-blue)
                colorName = parts.slice(1, -1).join('-');
            } else {
                return null;
            }
        } else {
            // Sayı değilse, belki sadece renk adıdır (bg-light-blue)
            colorName = parts.slice(1).join('-');
        }
    } else if (parts.length === 2) {
        // bg-red gibi shade olmayan durumlar
        colorName = parts[1];
    }

    // Rengi config'den bul
    const hexColor = config.colors[colorName];
    if (!hexColor) return null;

    // Eğer shade belirtilmemişse (örn: bg-red)
    // Single color değilse ve shade yoksa HATA (null)
    if (!hasShade) {
        // Son bir kontrol: Belki singleColors içinde vardır ama yukarıdaki if'e girmemiştir?
        // (Gerçi yukarıdaki if'e girmesi lazımdı ama ne olur ne olmaz)
        if (config.singleColors && config.singleColors[colorName]) {
            const hexColor = config.singleColors[colorName];

            // Shadow properties için rgb formatına çevir
            if (SHADOW_PROPERTIES.has(prefix)) {
                const rgbValue = hexToRgbString(hexColor);
                return `${cssProperty}: ${rgbValue};`;
            }

            return `${cssProperty}: ${hexColor};`;
        }
        return null;
    }

    // Rengi hesapla
    const finalColor = calculateColor(hexColor, shade);

    // Shadow properties için rgb formatına çevir
    if (SHADOW_PROPERTIES.has(prefix)) {
        const rgbValue = hexToRgbString(finalColor);
        return `${cssProperty}: ${rgbValue};`;
    }

    return `${cssProperty}: ${finalColor};`;
}

/**
 * Hex rengi "rgb(r g b)" formatına çevirir
 */
function hexToRgbString(hex: string): string {
    if (hex === 'transparent') return 'transparent';
    if (hex === 'currentColor') return 'currentColor';

    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    return `rgb(${rgb.r} ${rgb.g} ${rgb.b})`;
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

function mixColors(color1: string, color2: string, weight: number): string {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    if (!c1 || !c2) return color1;

    const w = weight / 100;

    const r = Math.round(c1.r * (1 - w) + c2.r * w);
    const g = Math.round(c1.g * (1 - w) + c2.g * w);
    const b = Math.round(c1.b * (1 - w) + c2.b * w);

    return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}