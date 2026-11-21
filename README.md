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

## Referencias de los temarios

El orden y alcance de los subtemas sigue temarios ya establecidos; las lecciones están escritas con palabras propias.

- Python: [tutorial oficial de Python](https://docs.python.org/es/3/tutorial/)
- JavaScript y HTML/CSS: [MDN Learn web development](https://developer.mozilla.org/es/docs/Learn)
- Inglés A1: descriptores A1 del [MCER](https://www.coe.int/en/web/common-european-framework-reference-languages) y el [Core Inventory for General English](https://www.eaquals.org/resources/the-core-inventory-for-general-english/)
- Matemáticas: [Plan de Estudio SEP 2022](https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/07/Plan-de-Estudios-Educacion-Basica_digital-2024.pdf)
- Biología: [OpenStax Biology 2e](https://openstax.org/books/biology-2e/pages/preface) (CC BY 4.0)
- Primeros auxilios: guías internacionales de primeros auxilios de la Cruz Roja (IFRC)
- Ciencias de la computación (algoritmos, redes): [OSSU Computer Science](https://github.com/ossu/computer-science), que sigue las guías ACM/IEEE
- Física, química, anatomía, psicología, astronomía: índices de los libros abiertos de [OpenStax](https://openstax.org/subjects)
- Teoría musical: [Open Music Theory](https://viva.pressbooks.pub/openmusictheory/) (CC BY-SA)
- Historia de México: periodización de los programas de historia de la SEP y del [CCH UNAM](https://portalacademico.cch.unam.mx/)
- Finanzas personales: unidades del curso de [educación financiera de Khan Academy](https://blog.khanacademy.org/empowering-learners-with-financial-literacy/)
- Inglés A2, francés y portugués A1: descriptores del MCER
