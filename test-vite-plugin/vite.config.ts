import { defineConfig } from "vite";
import { lasVitePlugin } from "../lasgine";

export default defineConfig({
    plugins: [
        lasVitePlugin()
    ],
    build: {
        outDir: 'dist', // dist klasörü root altında
    }
});