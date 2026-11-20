#!/usr/bin/env node
// Validador del catálogo de Tlalli.
// Revisa: formato (schemas), consistencia índice <-> archivos, duplicados,
// datos personales, posibles inyecciones de instrucciones y que las soluciones
// de JavaScript pasen sus propias pruebas.
// Uso: node scripts/validar.mjs   (sale con código 1 si hay errores)

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import Ajv2020 from "ajv/dist/2020.js";
import { generarIndice, carpetasDeTemas } from "./generar-indice.mjs";
import addFormats from "ajv-formats";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const errores = [];
const avisos = [];
const err = (archivo, msg) => errores.push(`❌ ${archivo}: ${msg}`);
const aviso = (archivo, msg) => avisos.push(`⚠️  ${archivo}: ${msg}`);

const leer = (ruta) => {
  try {
    return JSON.parse(readFileSync(join(RAIZ, ruta), "utf8"));
  } catch (e) {
    err(ruta, `JSON inválido o no encontrado (${e.message})`);
    return null;
  }
};

// ---------- Schemas ----------
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const vIndice = ajv.compile(leer("schema/index.schema.json"));
const vPlan = ajv.compile(leer("schema/plan.schema.json"));
const vLeccion = ajv.compile(leer("schema/leccion.schema.json"));

const validarSchema = (validador, datos, archivo) => {
  if (!validador(datos)) {
    for (const e of validador.errors) err(archivo, `${e.instancePath || "(raíz)"} ${e.message}`);
    return false;
  }
  return true;
};

// ---------- Utilidades ----------
const normalizar = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const textos = (obj, out = []) => {
  if (typeof obj === "string") out.push(obj);
  else if (Array.isArray(obj)) obj.forEach((x) => textos(x, out));
  else if (obj && typeof obj === "object") Object.values(obj).forEach((x) => textos(x, out));
  return out;
};

// Datos personales: si aparece algo así, se rechaza.
const PATRONES_PERSONALES = [
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "correo electrónico"],
  [/(?<![\w.])(\+?52[\s-]?)?(\d[\s-]?){10}(?![\w.])/, "número de teléfono"],
  [/\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/, "CURP"],
  [/\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/, "RFC"],
  [/\b(?:\d[ -]?){15,16}\b/, "posible número de tarjeta"],
];

// Instrucciones escondidas para manipular a la IA de otros usuarios.
const PATRONES_INYECCION = [
  /ignor(a|e|ar)\s+(todas\s+)?(las\s+)?(instrucciones|indicaciones)/i,
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /(system|sistema)\s*prompt/i,
  /a\s+partir\s+de\s+ahora\s+eres/i,
  /you\s+are\s+now\b/i,
  /olvida\s+(todo|tus\s+instrucciones)/i,
];

const revisarContenido = (datos, archivo) => {
  for (const t of textos(datos)) {
    for (const [re, nombre] of PATRONES_PERSONALES) {
      if (re.test(t)) err(archivo, `posible dato personal (${nombre}) en: "${t.slice(0, 60)}…"`);
    }
    for (const re of PATRONES_INYECCION) {
      if (re.test(t)) err(archivo, `posible instrucción para manipular a la IA en: "${t.slice(0, 60)}…"`);
    }
  }
};

const probarJavascript = (ej, archivo) => {
  if (ej.tipo !== "codigo" || ej.lenguaje !== "javascript" || !ej.solucion || !ej.funcion) return;
  for (const p of ej.pruebas) {
    try {
      const ctx = vm.createContext({});
      vm.runInContext(`${ej.solucion}\n;globalThis.__r = ${ej.funcion}(...${JSON.stringify(p.entrada)});`, ctx, { timeout: 1000 });
      if (JSON.stringify(ctx.__r) !== JSON.stringify(p.salida)) {
        err(archivo, `ejercicio "${ej.id}": la solución da ${JSON.stringify(ctx.__r)} con ${JSON.stringify(p.entrada)}, se esperaba ${JSON.stringify(p.salida)}`);
      }
    } catch (e) {
      err(archivo, `ejercicio "${ej.id}": la solución falla (${e.message})`);
    }
  }
};

// ---------- Índice ----------
// index.json ya no se edita a mano: se genera de los plan.json y se valida igual que antes
const indice = generarIndice(RAIZ);
if (validarSchema(vIndice, indice, "index.json (generado)")) {
  const nombresTemas = new Map();
  const idsTemas = new Set();
  const rutasEnIndice = new Set();

  for (const tema of indice.temas) {
    const ref = `index.json → ${tema.id}`;
    if (idsTemas.has(tema.id)) err(ref, "ID de tema repetido");
    idsTemas.add(tema.id);
    rutasEnIndice.add(tema.ruta);

    // Duplicados entre temas (por título o alias)
    for (const n of [tema.titulo, tema.id, ...(tema.aliases || [])].map(normalizar)) {
      if (nombresTemas.has(n) && nombresTemas.get(n) !== tema.id) {
        err(ref, `parece duplicado de "${nombresTemas.get(n)}" (coincide "${n}")`);
      }
      nombresTemas.set(n, tema.id);
    }

    if (tema.ruta !== `temas/${tema.categoria}/${tema.id}`) err(ref, `la carpeta debe ser temas/${tema.categoria}/${tema.id}`);

    // Subtemas repetidos dentro del tema
    const nombresSub = new Map();
    const idsSub = new Set();
    for (const s of tema.subtemas) {
      if (idsSub.has(s.id)) err(ref, `subtema repetido: ${s.id}`);
      idsSub.add(s.id);
      for (const n of [s.titulo, s.id, ...(s.aliases || [])].map(normalizar)) {
        if (nombresSub.has(n) && nombresSub.get(n) !== s.id) err(ref, `subtema "${s.id}" parece duplicado de "${nombresSub.get(n)}"`);
        nombresSub.set(n, s.id);
      }
    }

    // ---------- Plan ----------
    const rutaPlan = `${tema.ruta}/plan.json`;
    if (!existsSync(join(RAIZ, rutaPlan))) {
      err(ref, `no existe ${rutaPlan}`);
      continue;
    }
    const plan = leer(rutaPlan);
    if (!plan || !validarSchema(vPlan, plan, rutaPlan)) continue;
    revisarContenido(plan, rutaPlan);
    if (plan.id !== tema.id) err(rutaPlan, `id "${plan.id}" no coincide con el índice "${tema.id}"`);
    if (plan.categoria !== tema.categoria) err(rutaPlan, "la categoría no coincide con el índice");
    if (plan.version !== tema.version) err(rutaPlan, `versión ${plan.version} distinta a la del índice (${tema.version})`);
    for (const req of plan.requisitos || []) if (!indice.temas.some((t) => t.id === req)) aviso(rutaPlan, `requisito "${req}" no existe en el catálogo`);

    const subtemasCubiertos = new Set();
    const idsLecciones = new Set();
    for (const unidad of plan.unidades) {
      for (const lec of unidad.lecciones) {
        if (idsLecciones.has(lec.id)) err(rutaPlan, `lección repetida: ${lec.id}`);
        idsLecciones.add(lec.id);
        if (!idsSub.has(lec.subtema)) err(rutaPlan, `la lección "${lec.id}" usa el subtema "${lec.subtema}", que no está en el índice`);
        subtemasCubiertos.add(lec.subtema);

        // ---------- Lección ----------
        const rutaLec = `${tema.ruta}/${lec.archivo}`;
        if (!existsSync(join(RAIZ, rutaLec))) {
          err(rutaPlan, `no existe ${rutaLec}`);
          continue;
        }
        const leccion = leer(rutaLec);
        if (!leccion || !validarSchema(vLeccion, leccion, rutaLec)) continue;
        revisarContenido(leccion, rutaLec);
        if (leccion.id !== lec.id) err(rutaLec, `id "${leccion.id}" no coincide con el plan "${lec.id}"`);
        if (leccion.tema !== tema.id) err(rutaLec, `tema "${leccion.tema}" debería ser "${tema.id}"`);
        if (leccion.subtema !== lec.subtema) err(rutaLec, "el subtema no coincide con el plan");

        const idsEj = new Set();
        for (const ej of leccion.ejercicios) {
          if (idsEj.has(ej.id)) err(rutaLec, `ejercicio repetido: ${ej.id}`);
          idsEj.add(ej.id);
          if (ej.tipo === "opcion_multiple" && ej.correcta >= ej.opciones.length) err(rutaLec, `"${ej.id}": 'correcta' fuera de rango`);
          probarJavascript(ej, rutaLec);
        }
      }
    }
    for (const s of idsSub) if (!subtemasCubiertos.has(s)) aviso(ref, `el subtema "${s}" no tiene ninguna lección`);
  }

  // Carpetas cuyo plan.json falta o no se puede leer (el generador las omite)
  for (const ruta of carpetasDeTemas(RAIZ)) if (!rutasEnIndice.has(ruta)) err(ruta, "la carpeta no tiene un plan.json válido");
}

// ---------- Resultado ----------
avisos.forEach((a) => console.log(a));
errores.forEach((e) => console.log(e));
if (errores.length) {
  console.log(`\n${errores.length} error(es). Corrige antes de fusionar.`);
  process.exit(1);
}
console.log(`\n✅ Catálogo válido (${indice?.temas.length ?? 0} tema(s), ${avisos.length} aviso(s)).`);
