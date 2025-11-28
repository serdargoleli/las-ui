
/**
 * CSS String'ini analiz edip Class -> Style eşleşmesi çıkaran fonksiyon.
 * Örnek Girdi: ".text-center{text-align:center}"
 * Örnek Çıktı: Map { "text-center" => "text-align:center" }
 */

export function parserCSS(cssString: string) {
    const map = new Map<string, string>()
    // Regex: Escaped karakterleri de yakala (örn: \.p-2\.5)
    const regex = /\.([a-zA-Z0-9_\-\/\\.\\]+(?:\:[a-zA-Z0-9_\-\/\\.\\]+)*)\s*\{([^}]+)\}/g
    let match;

    while ((match = regex.exec(cssString)) !== null) {
        let className = match[1]
        const content = match[2]

        // CSS içindeki escaped karakterleri temizle (örn: \: -> :, \. -> .)
        className = className.replace(/\\/g, '');
        map.set(className, content)
    }
    return map

}
