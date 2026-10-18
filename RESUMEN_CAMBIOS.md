# RITMO · Resumen de cambios 2.2 a 2.9 y orden de publicación

Punto de partida: RITMO 2.1 (publicado el 15 de octubre de 2026). Este paquete lleva el sitio a la **2.9**.

## 1. Qué cambia, por versión

| Versión | Cambio | Archivos principales |
|---|---|---|
| **2.2** | La alerta de entrega desaparece para quien ya entregó y se apaga al llegar la fecha de planilla. Cuadro "Estado de roles y accesos" en Administración (última publicación de roles y de accesos). | `panel.html`, `firestore.rules` (colección `sistema`) |
| **2.3** | Cumpleaños en Mi horario (aviso, 🎂 y nota en la hoja de asistencia; solo día y mes de la cédula). Compartir RITMO: tarjeta de vista previa, código QR y mensaje de lanzamiento. | `generador.html`, `panel.html`, `index.html`, `assets/og-ritmo.png`, `js/vendor/qrcode.min.js` |
| **2.4** | Un solo scroll en Mi horario. Fecha de alta que no se cierra al teclear. Nombre en Matriz base sin perder el clic. Paleta de colores tipo Excel y color sugerido por género. Tutoriales: recorridos guiados con voz y apartado por rol. | `generador.html`, `panel.html`, `js/tutorial.js` |
| **2.5** | Presupuesto de plazas por tienda y vista de personal activo frente al presupuesto (sin gerente de tienda). El GZ aprueba las horas extra y la planilla se bloquea; reapertura solicitada por la tienda y aprobada por el GZ. Alertas de incumplimiento para jefes inmediatos. | `panel.html`, `generador.html`, `visor.html`, `firestore.rules` |
| **2.6** | Módulo de Recursos Humanos: registro central de personal, carga de altas desde Excel, control cruzado tienda ↔ RRHH, precarga con confirmación del gerente sin duplicar, ✕ para eliminar líneas erróneas. Quien tiene baja conserva su nombre en negrita y sin color. | `js/rrhh.js`, `panel.html`, `generador.html`, `firestore.rules` |
| **2.7** | Cierre automático de la quincena al pasar la fecha de entrega de planilla (solo el GZ reabre). Quien ingresa en la semana de corte se paga en la quincena siguiente con los días reales. | `firestore.rules`, `panel.html`, `generador.html` |
| **2.8** | Roles y permisos por módulo, administrables desde la app. Nuevos roles Encargado y Auxiliar de Reclutamiento. Vacantes, Nueva tienda y Nuevo puesto. Usuarios y roles en Administración. | `js/roles.js`, `panel.html`, `firestore.rules` |
| **2.9** | Asistente de ayuda flotante (menú de 3 niveles, búsqueda por palabras clave, recorridos, modo sin conexión con Service Worker). Aviso de versión nueva para sesiones abiertas. | `js/asistente.js`, `sw.js`, `panel.html`, `js/novedades.js` |

Correcciones de seguridad incluidas en las reglas (revisión final):
- La tienda de una entrega debe coincidir con su identificador (nadie reserva el lugar de otra tienda).
- La hora de entrega la pone el servidor (no se puede adelantar).
- La tienda no puede confirmar su propia alta ni su propia baja.
- Un rol creado en la app con el permiso `mi_horario` puede trabajar su tienda.
- El importador de roles ya no borra las plazas ni las tiendas creadas desde la app (usa `merge`).

## 2. Archivos del paquete

**Nuevos:** `js/asistente.js`, `js/roles.js`, `js/rrhh.js`, `js/tutorial.js`, `js/vendor/qrcode.min.js`, `js/vendor/LICENCIA-qrcode.txt`, `sw.js`, `assets/og-ritmo.png`, `SEGURIDAD.md`, `PUBLICAR_FIREBASE.md`, `RESUMEN_CAMBIOS.md`.

**Modificados:** `firestore.rules`, `panel.html`, `generador.html`, `index.html`, `visor.html`, `js/novedades.js`, `TRASPASO.md`, `.gitignore`.

**No deben aparecer** en GitHub Desktop: ningún `.xlsx`, `.json`, `.pdf`, `.mp4` ni archivo `Respaldo*` o `Roles*`. Tampoco `.claude/`. Si aparecen, detente y no hagas commit.

## 3. Texto sugerido para el commit

Commit 1 (reglas y documentos):

```
Reglas de seguridad y documentación (2.2–2.9)

- firestore.rules: cierre automático de quincena, aperturas del GZ, registro
  central de personal con control cruzado, permisos por módulo, vacantes y roles.
- SEGURIDAD.md, PUBLICAR_FIREBASE.md, RESUMEN_CAMBIOS.md y TRASPASO.md.
```

Commit 2 (aplicación):

```
RITMO 2.9: RRHH, Reclutamiento, roles, cierre de quincena y asistente

- 2.2–2.5: alertas, cumpleaños, compartir, tutoriales, presupuesto de plazas,
  aprobación de horas extra por el GZ y alertas a jefes inmediatos.
- 2.6: Recursos Humanos con control cruzado y precarga sin duplicados.
- 2.7: cierre tras la fecha de pago y pago diferido por semana de corte.
- 2.8: roles y permisos por módulo, Reclutamiento, vacantes, nueva tienda y puesto.
- 2.9: asistente de ayuda con modo sin conexión (sw.js) y aviso de versión nueva.
```

## 4. Orden exacto de publicación

Las reglas nuevas deberían funcionar con el código que está en línea hoy: según la revisión del código 2.1, escribe `fecha` con la hora del servidor y no toca los campos nuevos. **No se ha probado** contra Firebase real; por eso el paso 6 prueba el sitio actual justo después de publicar. Las reglas van **primero** porque el código nuevo escribe en colecciones que las reglas anteriores bloquean.

### A. Preparación (5 minutos)
1. Consola Firebase › Firestore Database › Reglas: guarda una copia del texto actual (o confía en la pestaña Historial).
2. En GitHub Desktop: *Fetch origin* y *Pull origin* para tener `main` al día.

### B. Firebase: reglas
3. Pega **todo** `firestore.rules` en el editor de reglas. Si la consola marca un error de sintaxis, no publiques y avísame con el texto del error.
4. Abre **Simulador de reglas** y ejecuta los 32 casos de `PUBLICAR_FIREBASE.md` (sección 2) **antes** de publicar. Los casos 3 a 12 y 24 a 28 son los críticos.
5. Si todos dan el resultado esperado, pulsa **Publicar**.
6. Prueba en el sitio actual (aún con la versión 2.1): entra como superusuario, entra como un gerente, publica una planilla. Debe funcionar igual que antes.

### C. GitHub: código
7. En GitHub Desktop crea una rama: *Current Branch › New Branch* → `ritmo-2-9` (cualquier nombre).
8. Revisa la lista de cambios (sección 2 de este documento). Si sale algún archivo prohibido, detente.
9. Marca solo `firestore.rules`, `SEGURIDAD.md`, `PUBLICAR_FIREBASE.md`, `RESUMEN_CAMBIOS.md` y `TRASPASO.md`; pega el **Commit 1**; *Commit to rritmo-2-9*.
10. Marca todo lo demás; pega el **Commit 2**; *Commit to rritmo-2-9*.
11. *Publish branch* y luego *Create Pull Request*. Revisa la página del PR en GitHub y fusiónalo a `main` (*Merge pull request*).
12. GitHub Pages publica solo en 1–2 minutos (pestaña *Actions* del repositorio muestra el avance).

### D. Verificación en línea (con una cuenta de cada rol)
13. Abre el sitio con *Ctrl+F5*. Al pasar el cursor sobre "RITMO" arriba debe decir **RITMO v2.9**.
14. Superusuario: entra a Administración y revisa que aparezcan los 7 roles y los usuarios.
15. Gerente: entra a Mi horario, guarda un cambio y confirma que dice "Guardado en RITMO".
16. Gerente: publica la planilla de la quincena (debe funcionar si la fecha de planilla no ha pasado).
17. GZ: en Seguimiento, prueba **Aprobar HE** en una tienda de prueba (AMPM Beta) y luego **Abrir quincena**.
18. En el calendario de planilla confirma que cada quincena tenga **fecha de entrega de planilla**: sin ella no se cierra sola.
19. Service Worker, en Chrome: entra a RITMO, activa el modo avión y recarga: debe abrir la interfaz y el botón Ayuda. (DevTools › Application › Service Workers debe mostrar `sw.js` activado.)

### E. Datos (en este orden)
20. Administración › **1 · Importar roles** con el Excel de roles (agrega las personas de RRHH y Reclutamiento con su rol) y **Publicar tiendas y usuarios**.
21. Administración › **3 · Presupuesto de plazas** con el Excel de presupuesto.
22. Administración › **2 · Crear accesos** para los usuarios nuevos.
23. Recursos Humanos › **1 · Cargar altas** con el Excel de altas. Revisa los totales antes de publicar. Las personas quedan "por confirmar" hasta que cada gerente las revise.
24. Avisa a los gerentes: al entrar a Mi horario verán "RRHH cargó N colaboradores" y deben tocar **Revisar y confirmar**.

### F. Seguridad de Google Cloud y GitHub
25. Sigue `SEGURIDAD.md`: restringir la clave de API a tu dominio, activar App Check, 2FA, secret scanning y rama `main` protegida.

## 5. Si algo sale mal
- **Reglas:** Consola Firebase › Reglas › Historial, y publica la versión anterior. Es inmediato.
- **Código:** GitHub › *Pull requests* › el PR fusionado › **Revert**. GitHub Pages vuelve a publicar la versión anterior en 1–2 minutos.
- **Una sesión abierta sigue con la versión anterior:** ya no hace falta tocar nada. RITMO avisa "Hay una versión nueva" y se actualiza al cerrar sesión y volver a entrar.

## 6. Para las próximas publicaciones
1. Agrega la novedad arriba en `js/novedades.js` (id siguiente) y **sube `VERSION`** al inicio del mismo archivo.
2. Si cambiaste permisos, publica `firestore.rules` en Firebase **antes** de subir el código.
3. Commit, pull request, fusionar. Los usuarios reciben el aviso solos.
