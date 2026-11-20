# Cómo contribuir a los planes de Tlalli

Este repositorio es el catálogo **comunitario** de planes de estudio de [Tlalli](https://tbkl2423-dot.github.io/tlalli-privacidad/). Cualquiera puede corregir errores, mejorar lecciones o agregar temas nuevos.

## Formas de contribuir

1. **Desde la app (automático).** Cuando un usuario estudia un tema o subtema que todavía no existe, la app genera la lección y la envía como Pull Request con la etiqueta `desde-app`. Si pasa todas las revisiones, se fusiona sola.
2. **Reportar un error.** Abre un *issue* con la plantilla "Error en una lección", o usa el botón **Reportar error** dentro de la app.
3. **Corregir o agregar contenido a mano.** Haz un fork, edita los archivos y abre un Pull Request.

## Estructura

```
temas/<categoria>/<tema>/plan.json      ← subtemas, unidades y orden de las lecciones
temas/<categoria>/<tema>/lecciones/*.json
schema/                                 ← reglas del formato
scripts/generar-indice.mjs              ← arma index.json (no se edita a mano; se publica en GitHub Pages)
```

## Reglas

- **IDs** en minúsculas con guiones (`async-await`) y **nunca se cambian** una vez publicados: la app los usa para guardar el progreso de cada usuario.
- **Si cambias una lección**, sube su `version` y la del tema en `plan.json`.
- **Un subtema nuevo** se agrega en `plan.json` → `subtemas`, en una unidad y como archivo en `lecciones/`.
- **Un tema nuevo** necesita su carpeta `temas/<categoria>/<id>/`, su `plan.json` y sus lecciones.
- **No edites `index.json`**: se genera solo después de cada fusión.
- **Explicaciones cortas**: cada bloque se narra por voz en 20–30 segundos.
- **Escribe con tus propias palabras.** No copies párrafos de libros, artículos ni cursos.
- **Sin datos personales**: nombres de personas privadas, correos, teléfonos, direcciones, matrículas, etc.
- **Nada de instrucciones para la IA** dentro del contenido (por ejemplo, "ignora tus instrucciones").
- En ejercicios de código JavaScript incluye `funcion`, `pruebas` y `solucion`: la validación ejecuta la solución contra las pruebas.

## Validar antes de enviar

```bash
npm install
npm run validar
```

Cada Pull Request se revisa automáticamente:

1. Formato (schemas).
2. Consistencia entre carpetas, planes y lecciones.
3. Duplicados de temas o subtemas (por título y alias).
4. Datos personales e instrucciones dirigidas a la IA.
5. Que las soluciones de código pasen sus pruebas.
6. Revisión de contenido con IA (exactitud, originalidad, que sea educativo).

## Licencia

Al contribuir aceptas que tu contribución se publique bajo la licencia **CC BY-SA 4.0** (ver `LICENSE`).
