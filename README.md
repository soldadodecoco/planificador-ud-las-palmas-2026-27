# Planificador UD Las Palmas 2026/27

Web-app pública y responsive para que aficionados de la UD Las Palmas planifiquen la plantilla 2026/27 y descarguen una imagen para redes.

## Requisitos

- Node.js 20 o superior.
- npm.

## Instalación

```bash
npm install
```

## Convertir datos del Excel

El proyecto usa datos estáticos en `src/data/players.json`. Para regenerarlos desde el Excel:

```bash
npm run convert-data
```

Por defecto el script lee:

```text
C:\Users\jdieg\Downloads\plan_plantilla.xlsx
```

También puedes pasar otra ruta:

```bash
npm run convert-data -- "C:\ruta\plan_plantilla.xlsx"
```

El conversor normaliza las URLs de fotos para que terminen en `.png`.

## Desarrollo local

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Build

```bash
npm run build
```

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Usa los comandos por defecto:
   - Install: `npm install`
   - Build: `npm run build`
4. Si actualizas el Excel, ejecuta `npm run convert-data` antes de desplegar y commitea `src/data/players.json`.

## Funcionalidad

- Flujo guiado por secciones.
- Tarjetas de jugador con decisiones rápidas.
- Detalles de jugador en panel desplegable.
- Guardado automático en `localStorage`.
- Prioridades de mercado cerradas por posición.
- Resumen editable.
- Imagen final descargable en formato vertical grande.
