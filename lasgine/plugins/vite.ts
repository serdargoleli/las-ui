import { LasEngine } from '../engine';
import type { ResolvedConfig } from 'vite';
import path from 'path';

interface LasViteOptions {
    include?: string[];
    outputFileName?: string;
}

export default function lasVitePlugin(options: LasViteOptions = {}): any {
    const virtualModuleId = 'virtual:las.css';
    const resolvedVirtualModuleId = '\0' + virtualModuleId;

    // Motoru oluştur
    const engine = new LasEngine();
    let isBuild = false;
    const cssFileName = options.outputFileName || 'las.css';


    function scanProject(root: string) {
        const dirsToScan = options.include || ['src'];
        const scanDirs = dirsToScan.map(dir => path.resolve(root, dir));
        engine.init(scanDirs);
    }

    return {
        name: 'lasgine-vite-plugin',


        resolveId(id: string) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },

        configResolved(config: ResolvedConfig) {
            isBuild = config.command === 'build';
        },

        load(id: string) {
            if (id === resolvedVirtualModuleId) {
                return engine.getCSS();
            }
        },

        buildStart() {
            if (isBuild) {
                scanProject(process.cwd());
            }
        },

        configureServer(server: any) {
            // Sunucu başlarken projeyi tara
            // Kullanıcı options.include verdiyse onu kullan, yoksa default 'src'
            scanProject(server.config.root);
        },

        handleHotUpdate({ file, server }: any) {
            // Dosya değiştiğinde motoru güncelle
            const hasChanges = engine.updateFile(file);

            if (hasChanges) {
                // Eğer yeni class varsa, sanal modülü güncelle
                const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
                if (mod) {
                    server.moduleGraph.invalidateModule(mod);
                    server.ws.send({
                        type: 'update',
                        updates: [
                            {
                                type: 'js-update',
                                path: virtualModuleId,
                                acceptedPath: virtualModuleId,
                                timestamp: Date.now()
                            }
                        ]
                    });
                }
            }
        },

        generateBundle(): void {
            if (!isBuild) return;

            // CSS dosyası olarak emit et
            /*  this.emitFile({
                 type: 'asset',
                 fileName: cssFileName,
                 source: engine.getCSS()
             }); */

            console.log("🎉 LAS Engine build CSS boyutu:", engine.getCSS().length, "byte");
        },

        transformIndexHtml(html: string) {
            const lasCSS = engine.getCSS();
            return html.replace('</head>', `<style>${lasCSS}</style></head>`);
        }
        /*  transformIndexHtml(html: string) {
             // HTML içine link ekle
             return html.replace(
                 '</head>',
                 `<link rel="stylesheet" href="/${cssFileName}"></head>`
             );
         } */
    };
}
