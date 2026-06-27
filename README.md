# Residencia Valle de Flores

Página web interactiva para presentar el hogar geriátrico **Residencia Valle de Flores**.

## Características

- Presentación principal con navegación responsive.
- Sección de servicios profesionales.
- Misión y visión enfocadas en el año 2027.
- Actividades interactivas para los abuelos.
- Sección de equipo humano.
- Formulario de contacto con validación.
- Botón flotante de WhatsApp.
- Favicon, logo y metadatos básicos para publicación.

## Estructura

```text
.
├── assets/
│   ├── favicon.svg
│   └── logo.svg
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── index.html
├── README.md
└── .gitignore
```

## Cómo abrir la página

1. Abre la carpeta en Visual Studio Code.
2. Abre `index.html`.
3. Ejecuta la página con Live Server o abre el archivo directamente en el navegador.
4. https://residencia-valle-de-flores-5y4c.vercel.app/

## Datos del formulario

El formulario guarda las solicitudes en IndexedDB, una base de datos local del navegador. Los datos quedan disponibles en el panel interno de la misma página y pueden exportarse como archivo CSV.

Para una publicación real con datos compartidos entre varios dispositivos, se recomienda conectar el formulario a un servicio externo como Firebase, Supabase, MySQL o PostgreSQL.

## Personalización antes de publicar

- Reemplazar el número del botón de WhatsApp en `index.html`.
- Cambiar las imágenes externas por fotos reales del hogar cuando estén disponibles.
- Revisar textos legales o aviso de tratamiento de datos personales si se recibirán datos reales de familias.
