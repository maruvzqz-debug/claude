import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
// Un solo HTML autocontenido (fuentes y logos embebidos): se abre desde disco o se publica como página.
export default defineConfig({ plugins: [react(), viteSingleFile()], base: "./", build: { assetsInlineLimit: 100000000 } });
