#!/usr/bin/env node
// Genera index.json a partir de los plan.json, para que las contribuciones solo agreguen carpetas y nunca choquen.
// Uso: node scripts/generar-indice.mjs [carpeta-salida]   (por defecto _site/, que GitHub Pages publica)

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Rutas "temas/<categoria>/<tema>" de cada carpeta de tema. */
export function carpetasDeTemas(raiz = RAIZ) {
  const base = join(raiz, "temas");
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .filter((cat) => statSync(join(base, cat)).isDirectory())
    .flatMap((cat) => readdirSync(join(base, cat)).map((t) => `temas/${cat}/${t}`))
    .filter((ruta) => statSync(join(raiz, ruta)).isDirectory())
    .sort();
}

/** El índice: solo lo que la app necesita para comparar temas sin descargar los planes. Ignora planes ilegibles (validar.mjs los reporta). */
export function generarIndice(raiz = RAIZ, version = Math.floor(Date.now() / 1000)) {
  const temas = [];
  for (const ruta of carpetasDeTemas(raiz)) {
    let plan;
    try {
      plan = JSON.parse(readFileSync(join(raiz, ruta, "plan.json"), "utf8"));
    } catch {
      continue;
    }
    temas.push({
      id: plan.id,
      titulo: plan.titulo,
      categoria: plan.categoria,
      ruta,
      version: plan.version,
      aliases: plan.aliases ?? [],
      subtemas: plan.subtemas ?? [],
    });
  }
  // version: segundos desde 1970, siempre crece entre publicaciones; la app solo compara si cambió
  return { version, actualizado: new Date(version * 1000).toISOString().slice(0, 10), temas };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const salida = join(RAIZ, process.argv[2] ?? "_site");
  mkdirSync(salida, { recursive: true });
  cpSync(join(RAIZ, "temas"), join(salida, "temas"), { recursive: true });
  const indice = generarIndice();
  writeFileSync(join(salida, "index.json"), JSON.stringify(indice));
  console.log(`index.json generado con ${indice.temas.length} tema(s) en ${salida}`);
}
