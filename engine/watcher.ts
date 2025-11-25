import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { scanFile, scanDirectory } from './scanner';
import { parseCss } from './parser';
import { loadConfig } from './config';
import { generateCss } from './generator';
import { getBaseCss } from './index';

/**
 * Dosya izleyici - Değişiklikleri algılayıp JIT CSS üretir
 */
export function startWatcher(options: {
    scanDirs: string[];
    extensions: string[];
    outputPath: string;
}) {
    console.log('🚀 LAS JIT Watcher Başlatılıyor...\n');

    // 1. CSS Map ve Config'i yükle
    console.log('⏳ CSS ve Config Yükleniyor...');
    const cssContent = getBaseCss();
    const cssMap = parseCss(cssContent);
    const config = loadConfig();

    console.log(`✅ ${cssMap.size} utility class yüklendi`);
    console.log(`✅ ${Object.keys(config.screens).length} breakpoint, ${Object.keys(config.variants).length} variant tanımlı\n`);

    // 2. İlk taramayı yap (tüm dosyaları tara)
    console.log('🔍 İlk tarama yapılıyor...');
    let allClasses = new Set<string>();

    options.scanDirs.forEach(dir => {
        const dirPath = path.resolve(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            const classes = scanDirectory(dirPath, options.extensions);
            classes.forEach(cls => allClasses.add(cls));
        }
    });

    console.log(`✅ ${allClasses.size} class bulundu\n`);

    // 3. CSS üret ve dosyaya yaz
    writeJitCss(allClasses, cssMap, config, options.outputPath);

    // 4. Dosya izleyiciyi başlat
    const watchPaths: string[] = [];

    options.scanDirs.forEach(dir => {
        const basePath = path.resolve(process.cwd(), dir);
        options.extensions.forEach(ext => {
            // Hem kök dizindeki dosyalar hem de alt dizinlerdeki dosyalar
            watchPaths.push(path.join(basePath, `*${ext}`));  // Kök seviye
            watchPaths.push(path.join(basePath, `**/*${ext}`)); // Alt dizinler
        });
    });

    console.log('👀 Dosya izleyici aktif...');
    console.log(`📁 İzlenen dizinler: ${options.scanDirs.join(', ')}`);
    console.log(`📝 İzlenen uzantılar: ${options.extensions.join(', ')}`);
    console.log(`📦 Çıktı: ${options.outputPath}\n`);
    console.log('✨ Hazır! Dosyalarınızı düzenleyebilirsiniz.\n');

    const watcher = chokidar.watch(watchPaths, {
        ignored: [
            /(^|[\/\\])\../,  // Gizli dosyalar
            '**/node_modules/**',
            '**/dist/**',
            '**/output/**',
            '**/.git/**'
        ],
        persistent: true,
        ignoreInitial: true,
    });

    watcher.on('change', (filePath) => {
        console.log(`\n📝 Değişiklik: ${path.relative(process.cwd(), filePath)}`);

        // Dosyayı tara
        const newClasses = scanFile(filePath);
        let addedCount = 0;

        newClasses.forEach(cls => {
            if (!allClasses.has(cls)) {
                allClasses.add(cls);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            console.log(`   ✨ ${addedCount} yeni class bulundu`);
            writeJitCss(allClasses, cssMap, config, options.outputPath);
        } else {
            console.log(`   ℹ️  Yeni class yok`);
        }
    });

    watcher.on('add', (filePath) => {
        console.log(`\n➕ Yeni dosya: ${path.relative(process.cwd(), filePath)}`);

        const newClasses = scanFile(filePath);
        let addedCount = 0;

        newClasses.forEach(cls => {
            if (!allClasses.has(cls)) {
                allClasses.add(cls);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            console.log(`   ✨ ${addedCount} class eklendi`);
            writeJitCss(allClasses, cssMap, config, options.outputPath);
        }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n👋 Watcher kapatılıyor...');
        watcher.close();
        process.exit(0);
    });
}

/**
 * JIT CSS dosyasını yaz
 */
function writeJitCss(
    classes: Set<string>,
    cssMap: Map<string, string>,
    config: any,
    outputPath: string
) {
    let css = '/* LAS JIT - Auto-generated CSS */\n\n';
    let successCount = 0;
    let failCount = 0;

    classes.forEach(cls => {
        const generated = generateCss(cls, cssMap, config);
        if (generated) {
            css += generated + '\n\n';
            successCount++;
        } else {
            failCount++;
        }
    });

    // Çıktı dizinini oluştur
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, css);

    console.log(`   💾 CSS yazıldı: ${outputPath}`);
    console.log(`   ✅ ${successCount} class | ⚠️  ${failCount} bulunamadı`);
}
