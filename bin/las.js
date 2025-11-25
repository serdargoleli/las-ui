#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');

program
  .name('las')
  .description('LAS CSS - JIT Utility Framework')
  .version('1.0.9');

// las init - Config dosyası oluştur
program
  .command('init')
  .description('LAS projesini başlat (config dosyası oluştur)')
  .option('-f, --framework <type>', 'Framework seç (react, next, vite, vue, angular, html)')
  .action((options) => {
    console.log('🚀 LAS CSS Projesi Başlatılıyor...\n');
    
    const framework = options.framework || 'html';
    
    // Framework'e göre config şablonları
    const configs = {
      react: {
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
        scanDirs: ['./src', './public'],
        output: './public/las.css',
      },
      next: {
        extensions: ['.jsx', '.tsx', '.js', '.ts'],
        scanDirs: ['./app', './pages', './components', './src'],
        output: './public/las.css',
      },
      vite: {
        extensions: ['.jsx', '.tsx', '.js', '.ts', '.vue'],
        scanDirs: ['./src', './public'],
        output: './public/las.css',
      },
      vue: {
        extensions: ['.vue', '.js', '.ts'],
        scanDirs: ['./src', './public'],
        output: './public/las.css',
      },
      angular: {
        extensions: ['.html', '.ts', '.component.html'],
        scanDirs: ['./src/app', './src'],
        output: './src/las.css',
      },
      html: {
        extensions: ['.html', '.js'],
        scanDirs: ['./'],
        output: './dist/las.css',
      },
    };
    
    const selectedConfig = configs[framework] || configs.html;
    
    const configContent = `module.exports = {
  // Framework: ${framework}
  
  // Taranacak dosya uzantıları
  extensions: ${JSON.stringify(selectedConfig.extensions, null, 2)},
  
  // Taranacak dizinler
  scanDirs: ${JSON.stringify(selectedConfig.scanDirs, null, 2)},
  
  // JIT CSS çıktı dosyası (development)
  output: '${selectedConfig.output}',
};
`;
    
    const configPath = path.join(process.cwd(), 'las.config.js');
    
    if (fs.existsSync(configPath)) {
      console.log('⚠️  las.config.js zaten mevcut!');
    } else {
      fs.writeFileSync(configPath, configContent);
      console.log(`✅ las.config.js oluşturuldu! (Framework: ${framework})`);
    }
    
    console.log('\n📖 Kullanım:');
    console.log('  npx las dev    - Geliştirme modunu başlat (watcher)');
    console.log('  npx las build  - Production build al\n');
    console.log('💡 Framework değiştirmek için: npx las init -f <framework>');
    console.log('   Desteklenen: react, next, vite, vue, angular, html\n');
  });

// las watcher - Dosya izleyici (Development)
program
  .command('watcher')
  .description('Dosya değişikliklerini izle ve JIT CSS üret')
  .action(() => {
    // Config dosyasını yükle
    const configPath = path.join(process.cwd(), 'las.config.js');
    let config = {
      extensions: ['.html', '.jsx', '.tsx', '.js', '.ts', '.vue'],
      scanDirs: ['./'],
      output: './dist/jit.css',
    };

    if (fs.existsSync(configPath)) {
      const userConfig = require(configPath);
      config = { ...config, ...userConfig };
    } else {
      console.log('⚠️  las.config.js bulunamadı, varsayılan ayarlar kullanılıyor.');
      console.log('💡 Özelleştirmek için: npx las init\n');
    }

    // Watcher'ı başlat
    const { startWatcher } = require(path.join(__dirname, '../engine/watcher.js'));
    startWatcher({
      scanDirs: config.scanDirs,
      extensions: config.extensions,
      outputPath: path.resolve(process.cwd(), config.output),
    });
  });

// las dev - Alias for watcher
program
  .command('dev')
  .description('Geliştirme modunu başlat (watcher alias)')
  .action(() => {
    program.parse(['node', 'las', 'watcher']);
  });

// las build - Production build
program
  .command('build')
  .description('Production build al (sadece kullanılan class\'ları içerir)')
  .action(() => {
    // Config dosyasını yükle
    const configPath = path.join(process.cwd(), 'las.config.js');
    let config = {
      extensions: ['.html', '.jsx', '.tsx', '.js', '.ts', '.vue'],
      scanDirs: ['./src', './public', './app', './pages', './components'],
      output: './dist/las-production.css',
    };

    if (fs.existsSync(configPath)) {
      const userConfig = require(configPath);
      config = { ...config, ...userConfig };
    }

    // Build'i başlat
    const { buildProduction } = require(path.join(__dirname, '../engine/build.js'));
    buildProduction({
      scanDirs: config.scanDirs,
      extensions: config.extensions,
      outputPath: path.resolve(process.cwd(), config.output),
    });
  });

program.parse(process.argv);
