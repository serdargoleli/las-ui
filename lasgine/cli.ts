#!/usr/bin/env node
import { startWatcher } from './watcher';
import path from 'path';

// Basit argüman işleme
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');
const watch = args.includes('--watch') || args.includes('-w');

if (help) {
    console.log(`
  Usage: las-ui [options]

  Options:
    -w, --watch    Start the JIT watcher
    -h, --help     Show this help message
    `);
    process.exit(0);
}

// Varsayılan ayarlar
const options = {
    scanDirs: ['src'], // Varsayılan olarak src klasörünü tara
    extensions: ['.html', '.js', '.jsx', '.ts', '.tsx', '.vue'],
    outputPath: 'public/las.css'
};

// Watcher'ı başlat
startWatcher(options);
