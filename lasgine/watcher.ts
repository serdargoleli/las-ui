import chokidar from 'chokidar';
import { LasEngine } from './engine';
import path from 'path';
import fs from 'fs';

interface IWatcherProps {
    scanDirs: string[];
    extensions: string[];
    outputPath: string;
}

export function startWatcher(options: IWatcherProps) {
    console.log('🚀 LAS JIT Watcher Başlatılıyor...\n');

    // Motoru başlat
    const engine = new LasEngine(options.extensions);

    // İzlenecek dizinleri hazırla
    const watchPaths = options.scanDirs.map(dir => path.resolve(process.cwd(), dir));

    // İlk taramayı yap
    engine.init(watchPaths);

    // İlk CSS'i yaz
    writeOutput(engine.getCSS(), options.outputPath);

    console.log('👀 Dosya izleyici aktif...');
    console.log(`📁 İzlenen dizinler: ${options.scanDirs.join(', ')}`);
    console.log(`📦 Çıktı: ${options.outputPath}\n`);

    const watcher = chokidar.watch(watchPaths, {
        ignored: [
            /(^|[\/\\])\../,  // Gizli dosyalar
            '**/node_modules/**',
            '**/dist/**',
            '**/output/**',
            '**/.git/**',
            '**/public/**'
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50
        }
    });

    const handleUpdate = (filePath: string) => {
        const hasChanges = engine.updateFile(filePath);
        if (hasChanges) {
            writeOutput(engine.getCSS(), options.outputPath);
            console.log(`   ✅ CSS güncellendi`);
        }
    };

    watcher.on('change', handleUpdate);
    watcher.on('add', (filePath) => {
        console.log(`\n➕ Yeni dosya: ${path.relative(process.cwd(), filePath)}`);
        handleUpdate(filePath);
    });

    process.on('SIGINT', () => {
        console.log('\n\n👋 LAS JIT kapatılıyor...');
        watcher.close();
        process.exit(0);
    });
}

function writeOutput(css: string, outputPath: string) {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, css);
}
