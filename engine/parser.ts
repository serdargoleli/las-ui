/**
 * CSS String'ini analiz edip Class -> Style eşleşmesi çıkaran fonksiyon.
 * Örnek Girdi: ".text-center{text-align:center}"
 * Örnek Çıktı: Map { "text-center" => "text-align:center" }
 */
export function parseCss(css: string): Map<string, string> {
    const map = new Map<string, string>();

    // Regex Açıklaması:
    // \.([a-zA-Z0-9_\\-]+)  -> Nokta ile başlayan class ismini yakala (escaped karakterler dahil)
    // (?::[a-zA-Z0-9_\\-]+)* -> (Opsiyonel) Pseudo class'ları atla (örn: :hover) - Şimdilik sadece kök class'ı alıyoruz
    // \s*\{                 -> Boşluk ve süslü parantez açılışı
    // ([^}]+)               -> Süslü parantez kapanana kadar olan her şeyi (CSS içeriği) al
    // \}                    -> Süslü parantez kapanışı
    const regex = /\.([a-zA-Z0-9_\\-]+)(?::[a-zA-Z0-9_\\-]+)*\s*\{([^}]+)\}/g;

    let match;
    while ((match = regex.exec(css)) !== null) {
        let className = match[1];
        const content = match[2];

        // CSS içindeki escaped karakterleri temizle (örn: \: -> :)
        className = className.replace(/\\/g, '');

        map.set(className, content);
    }

    return map;
}