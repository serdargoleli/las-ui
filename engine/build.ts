import fs from 'fs';
import path from 'path';
import { scanDirectory } from './scanner';
import { parseCss } from './parser';
import { loadConfig } from './config';
import { generateCss } from './generator';
import { getBaseCss } from './index';

/**
 * Production Build - Sadece kullanılan class'ları içeren minimal CSS üretir
 */
export function buildProduction(options: {
    scanDirs: string[];
    extensions: string[];
    outputPath: string;
}) {
    console.log('🚀 LAS Production Build Başlatılıyor...\n');

    // 1. CSS Map ve Config'i yükle
    console.log('⏳ CSS ve Config Yükleniyor...');
    const cssContent = getBaseCss();
    const cssMap = parseCss(cssContent);
    const config = loadConfig();

    console.log(`✅ ${cssMap.size} utility class yüklendi`);
    console.log(`✅ ${Object.keys(config.screens).length} breakpoint, ${Object.keys(config.variants).length} variant tanımlı\n`);

    // 2. Tüm projeyi tara
    console.log('🔍 Proje taranıyor...');
    let allClasses = new Set<string>();

    options.scanDirs.forEach(dir => {
        const dirPath = path.resolve(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            console.log(`   📁 ${dir}`);
            const classes = scanDirectory(dirPath, options.extensions);
            classes.forEach(cls => allClasses.add(cls));
        } else {
            console.warn(`   ⚠️  Dizin bulunamadı: ${dir}`);
        }
    });

    console.log(`\n✅ ${allClasses.size} benzersiz class bulundu\n`);

    // 3. CSS üret
    console.log('⚙️  CSS üretiliyor...');
    let css = '/* LAS CSS - Production Build */\n';
    css += `/* Generated: ${new Date().toISOString()} */\n`;
    css += `/* Total Classes: ${allClasses.size} */\n\n`;

    let successCount = 0;
    let failCount = 0;
    const failedClasses: string[] = [];

    allClasses.forEach(cls => {
        const generated = generateCss(cls, cssMap, config);
        if (generated) {
            css += generated + '\n\n';
            successCount++;
        } else {
            failCount++;
            failedClasses.push(cls);
        }
    });

    // 4. Dosyaya yaz
    const outputDir = path.dirname(options.outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(options.outputPath, css);

    // 5. Sonuçları göster
    console.log('\n✅ Build Tamamlandı!\n');
    console.log(`📊 İstatistikler:`);
    console.log(`   ✅ Başarılı: ${successCount} class`);
    console.log(`   ⚠️  Bulunamadı: ${failCount} class`);
    console.log(`   💾 Dosya: ${options.outputPath}`);
    console.log(`   📏 Boyut: ${(css.length / 1024).toFixed(2)} KB\n`);

    if (failedClasses.length > 0 && failedClasses.length <= 10) {
        console.log(`⚠️  Bulunamayan class'lar:`);
        failedClasses.forEach(cls => console.log(`   - ${cls}`));
        console.log('');
    } else if (failedClasses.length > 10) {
        console.log(`⚠️  ${failedClasses.length} class bulunamadı (ilk 10):`);
        failedClasses.slice(0, 10).forEach(cls => console.log(`   - ${cls}`));
        console.log('');
    }

    console.log('🎉 Production build hazır!\n');
}
