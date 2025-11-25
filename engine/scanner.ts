import fs from 'fs';
import path from 'path';

/**
 * HTML/JSX dosyalarını tarayıp class isimlerini çıkarır
 * 
 * @param filePath - Taranacak dosya yolu
 * @returns Bulunan class isimleri (Set)
 */
export function scanFile(filePath: string): Set<string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractClasses(content);
}

/**
 * Bir dizindeki tüm dosyaları tarar
 * 
 * @param dirPath - Taranacak dizin
 * @param extensions - Taranacak dosya uzantıları (örn: ['.html', '.jsx', '.tsx'])
 * @returns Bulunan tüm class isimleri
 */
export function scanDirectory(
    dirPath: string,
    extensions: string[] = ['.html', '.jsx', '.tsx', '.js', '.ts', '.vue']
): Set<string> {
    const allClasses = new Set<string>();

    function walk(dir: string) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // node_modules, dist, .git gibi klasörleri atla
                if (!['node_modules', 'dist', '.git', 'build'].includes(file)) {
                    walk(filePath);
                }
            } else if (extensions.some(ext => file.endsWith(ext))) {
                const classes = scanFile(filePath);
                classes.forEach(cls => allClasses.add(cls));
            }
        }
    }

    walk(dirPath);
    return allClasses;
}

/**
 * String içinden class isimlerini çıkarır
 * 
 * Desteklenen formatlar:
 * - class="text-center md:flex"
 * - className="text-center md:flex"
 * - className={'text-center md:flex'}
 * 
 * @param content - Taranacak metin
 * @returns Bulunan class isimleri
 */
export function extractClasses(content: string): Set<string> {
    const classes = new Set<string>();

    // Regex: class="..." veya className="..." veya className={'...'}
    const patterns = [
        /class(?:Name)?=["']([^"']+)["']/g,           // class="..." veya className="..."
        /class(?:Name)?=\{['"]([^'"]+)['"]\}/g,       // className={'...'}
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const classString = match[1];
            // Boşluklara göre ayır ve her birini ekle
            const classNames = classString.split(/\s+/).filter(Boolean);
            classNames.forEach(cls => classes.add(cls));
        }
    }

    return classes;
}
