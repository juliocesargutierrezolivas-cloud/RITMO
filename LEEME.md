# RITMO · Horarios y Planilla

Sistema en línea para sucursales AMPM: los gerentes cargan horarios y planilla quincenal; zona, distrito y operaciones validan; planilla descarga.

## Estructura
- `index.html` — Bienvenida y acceso (login real con Firebase; vista previa si no hay configuración).
- `panel.html` — Panel por rol: seguimiento de la quincena, entrega del gerente, descarga de planilla y administración.
- `js/firebase-config.js` — Datos del proyecto Firebase (pegar aquí).
- `js/nube.js` — Conexión a Firebase.
- `firestore.rules` — Reglas de seguridad por rol.
- `GUIA_FIREBASE.md` — Paso a paso para conectar Firebase.
- `js/novedades.js` — Novedades del desarrollador (bitácora visible para usuarios).
- `TRASPASO.md` — Documento para entregar RITMO al equipo de desarrollo de AMPM.
- `assets/escena0-7.gif` — Vistazo animado de la herramienta (8 escenas).
- `assets/logo-ampm.png`, `assets/logo-mbk.png` — Logos oficiales.
- `../Roles_de_Ritmo_v2.xlsx` — Tiendas, usuarios, roles, alcances y permisos.

## Bitácora
- 2026-10-15 · v1: pantalla de bienvenida con vistazo animado y 4 niveles de acceso (Editor, Visualizar, Descargar, Superusuario).
- 2026-10-15 · Repositorio publicado en GitHub y conectado a Claude para subir avances directo.
- 2026-10-15 · Roles v2: archivo de roles reestructurado en Tiendas / Usuarios / Permisos / Revisión.

- 2026-10-15 · v1.1: login con Firebase, panel por rol, entrega por respaldo del Generador, importación de roles y creación de accesos.
- 2026-10-15 · v1.2: calendario de planilla (semanas de HE con rezago + fecha límite) con alertas para todos, estados a tiempo/tarde/vencida, panel de novedades y documento de traspaso.

## Próximo
1. Cerrar pendientes de la hoja Revisión.
2. Crear el proyecto Firebase (GUIA_FIREBASE.md) y pegar la configuración.
3. Panel del Superusuario: cumplimiento por tienda y quincena.
