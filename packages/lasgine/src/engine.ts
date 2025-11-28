
import { scanDirectory, scanFile } from './core/scanner';
import { readBaseCSS, readUtilityCSS } from './core/read';
import { parserCSS } from './core/parser';
import { loadConfig } from './core/config';
import { generateCSSContent } from './core/writer';
import path from 'path';
import fs from 'fs';

export class LasEngine {
    private usedClasses: Set<string>;
    private cssMap: Map<string, string>;
    private config: any;
    private cssContent: string;
    private extensions: string[];
    private baseCSS: string;

    constructor(extensions: string[] = ['.html', '.js', '.jsx', '.ts', '.tsx', '.vue']) {
        this.usedClasses = new Set();
        this.extensions = extensions;
        this.baseCSS = readBaseCSS();
        // Başlangıç verilerini yükle
        this.cssContent = readUtilityCSS();
        this.cssMap = parserCSS(this.cssContent);
        this.config = loadConfig();
    }

    /**
     * Belirtilen dizinleri tarar ve başlangıç CSS'ini üretir.
     */
    public init(scanDirs: string[]) {
        scanDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                const foundClasses = scanDirectory(dir, this.extensions);
                foundClasses.forEach(cls => this.usedClasses.add(cls));
            }
        });
        console.log(`✅ LasEngine Başlatıldı: ${this.usedClasses.size} class yüklendi.`);
    }

    /**
     * Tek bir dosyayı tarar ve yeni class varsa true döner.
     */
    public updateFile(filePath: string): boolean {
        // Sadece desteklenen uzantıları tara
        if (!this.extensions.some(ext => filePath.endsWith(ext))) return false;

        const newClasses = scanFile(filePath);
        let addedCount = 0;

        newClasses.forEach(cls => {
            if (!this.usedClasses.has(cls)) {
                this.usedClasses.add(cls);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            console.log(`⚡ ${addedCount} yeni class eklendi: ${path.basename(filePath)}`);
            return true;
        }

        return false;
    }

    /**
     * Güncel CSS içeriğini döner.
     */
    public getCSS(): string {
        const generated = generateCSSContent(this.usedClasses, this.cssMap, this.config);
        const baseCSS = this.baseCSS;
        return baseCSS + '\n' + generated;
    }
}
