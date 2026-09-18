# Chips Bakery — Operations Research Dashboard

Dashboard web de investigación de operaciones para el caso **Chips Bakery**: contexto empresarial, inferencia bayesiana, análisis de sensibilidad y teoría de juegos.

La aplicación está en `chips-bakery/`. Las dependencias (`node_modules`) **no** se versionan: cada persona que clone el repo las instala en su máquina.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`)

## Cómo clonarlo y ejecutarlo

```bash
git clone https://github.com/Santiagomunozma/Chips-Bakery---Operations-Research-Dashboard.git
cd Chips-Bakery---Operations-Research-Dashboard/chips-bakery
npm install
npm run dev
```

Abre en el navegador la URL que imprima Vite (por lo general [http://localhost:5173/](http://localhost:5173/)).

## Otros comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera la carpeta `dist/` para producción |
| `npm run preview` | Sirve el build de producción en local |

Si algo falla al instalar, borra `node_modules` y vuelve a ejecutar `npm install` dentro de `chips-bakery`.
