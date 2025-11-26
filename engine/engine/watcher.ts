import chokidar from 'chokidar';
import { scanDirectory, scanFile } from './scanner';
import { readBaseCSS } from './read';
import { parserCSS } from './parser';
import { loadConfig } from './config';
import path from 'path';
import fs from 'fs';
import { writeCSS } from './writer';

interface IWatcherProps {
    scanDirs: string[];
    extensions: string[];
    outputPath: string;
}
export function startWatcher(options: IWatcherProps) {
    console.log('🚀 LAS JIT Watcher Başlatılıyor...\n');
    const cssContent = readBaseCSS();
    const cssMap = parserCSS(cssContent); //utility'nin ts dosyasından çıkarılan css
    const config = loadConfig();

    console.log(`✅ ${cssMap.size} utility class yüklendi`);
    console.log(`✅ ${Object.keys(config.screens).length} breakpoint, ${Object.keys(config.variants).length} variant tanımlı\n`);

    // 2. İlk taramayı yap (tüm dosyaları tara)
    let usedAllClasses = new Set<string>();

    options?.scanDirs.forEach(dir => {
        const dirPath = path.resolve(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            const usedClasses = scanDirectory(dirPath, options.extensions);
            usedClasses.forEach(cls => usedAllClasses.add(cls));
        }
    });

    console.log(`✅ ${usedAllClasses.size} class bulundu\n`);

    // 3. CSS üret ve dosyaya yaz
    writeCSS(usedAllClasses, cssMap, config, options?.outputPath);

    // buraya kadar olan kısım uygulam ailk ayağa kalktığında classları generate edecek bundan sonra watcher devere girecek ve dinamik ekleme yapacak

    // İzlenecek dizinleri hazırla
    const watchPaths = options.scanDirs.map(dir => path.resolve(process.cwd(), dir));

    console.log('👀 Dosya izleyici aktif...');
    console.log(`📁 İzlenen dizinler: ${options.scanDirs.join(', ')}`);
    console.log(`📝 İzlenen uzantılar: ${options.extensions.join(', ')}`);
    console.log(`📦 Çıktı: ${options.outputPath}\n`);
    console.log(`🔍 İzlenen yollar:`, watchPaths);
    console.log('✨ Hazır! Dosyalarınızı düzenleyebilirsiniz.\n');

    const watcher = chokidar.watch(watchPaths, {
        ignored: [
            /(^|[\/\\])\../,  // Gizli dosyalar
            '**/node_modules/**',
            '**/dist/**',
            '**/output/**',
            '**/.git/**',
            '**/public/**'  // Çıktı dosyasını izleme
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 100, // 100ms boyunca dosya değişmezse “yazma bitti” de
            pollInterval: 50 //her 50ms dosya hâlâ yazılıyor mu diye bak
        }
    });

    //dosya değiştiğinde çalışır
    watcher.on('change', (filePath) => {
        const newClasses = scanFile(filePath);
        let addedCount = 0;
        newClasses.forEach(cls => {
            if (!usedAllClasses.has(cls)) {
                usedAllClasses.add(cls);
                addedCount++;
            }
        });
        if (addedCount > 0) {
            console.log(`   ✨ ${addedCount} yeni class bulundu`);
            writeCSS(usedAllClasses, cssMap, config, options?.outputPath);
            console.log(`   ✅ CSS güncellendi (toplam ${usedAllClasses.size} class)`);
        } else {
            console.log(`   ℹ️  Yeni class yok`);
        }

    })

    // yeni dosya eklendğinde çalılır
    watcher.on('add', (filePath) => {
        console.log(`\n➕ Yeni dosya: ${path.relative(process.cwd(), filePath)}`);

        const newClasses = scanFile(filePath);
        let addedCount = 0;

        newClasses.forEach(cls => {
            if (!usedAllClasses.has(cls)) {
                usedAllClasses.add(cls);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            console.log(`   ✨ ${addedCount} class eklendi`);
            writeCSS(usedAllClasses, cssMap, config, options.outputPath);
        }
    });

    process.on('SIGINT', () => {
        console.log('\n\n👋 LAS JIT  kapatılıyor...');
        watcher.close();
        process.exit(0);
    });
}
