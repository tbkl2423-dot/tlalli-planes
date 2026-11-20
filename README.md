# Planes de estudio de Tlalli

Catálogo comunitario y abierto de planes de estudio para el modo de aprendizaje de **Tlalli**.

- La app descarga `https://tbkl2423-dot.github.io/tlalli-planes/index.json` para saber qué temas y subtemas existen. Ese índice se genera solo, a partir de los `plan.json`, después de cada fusión.
- Si un usuario estudia algo que no existe, la app lo genera y lo propone aquí automáticamente.
- La comunidad puede corregir errores y mejorar lecciones con *issues* y Pull Requests.

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para participar.

## Qué nunca se sube

Los archivos, fotos, libros o links del usuario **nunca** se publican, y tampoco se publican datos personales. Solo se comparten los temas, las lecciones y las preguntas generadas, escritas con palabras propias.

Contenido bajo licencia CC BY-SA 4.0 (`LICENSE-CONTENIDO`) · Código bajo licencia MIT (`LICENSE`).

## Configuración del repositorio (una sola vez)

1. Settings → General → activar **Allow auto-merge**.
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Branches → regla para `main`: exigir el check **validar** y **Require branches to be up to date** (así dos PR que agregan el mismo tema no se fusionan los dos).
4. Issues → Labels → crear `desde-app` y `error-contenido`.
5. Settings → Secrets → Actions: `IA_API_URL`, `IA_API_KEY`, `IA_MODELO` (por ejemplo Groq u OpenRouter).
