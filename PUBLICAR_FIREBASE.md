# RITMO · Publicación en Firebase (lista única para el final)

> El orden completo de pasos (Firebase, GitHub Desktop y verificación) y el texto de los commits están en `RESUMEN_CAMBIOS.md`. Este documento detalla las pruebas de reglas.

Todo lo nuevo (versiones 2.2 a 2.9) funciona en la vista previa, pero **las reglas de Firestore no se han probado contra Firebase real**.
Haz esta lista una sola vez, en orden. No publiques nada de Firebase hasta tener las pruebas de la sección 2.

## 1. Publicar las reglas
1. Consola Firebase › Firestore Database › Reglas.
2. Copia **todo** el contenido de `firestore.rules` y publícalo.
3. Comprueba de inmediato que el superusuario sigue entrando y ve Seguimiento. Si algo falla, vuelve a publicar la versión anterior (Reglas › Historial).

## 2. Probar las reglas antes de usarlas (Consola › Reglas › Simulador de reglas)
Crea estos casos con una cuenta real de cada rol. Cada fila es: acción, quién, resultado esperado.

| # | Acción | Quién | Debe… |
|---|---|---|---|
| 1 | Leer `usuarios/{su correo}` | Cualquier usuario | Permitir |
| 2 | Escribir `usuarios/{otro correo}` | Gerente | **Negar** |
| 3 | Crear `entregas/AMPM01_2026-10-Q1` con `tienda: AMPM01` | Gerente de AMPM01 | Permitir (antes de la fecha de planilla) |
| 4 | Crear `entregas/AMPM02_2026-10-Q1` con `tienda: AMPM01` | Gerente de AMPM01 | **Negar** (la tienda debe coincidir con el id) |
| 5 | Crear la entrega y `entregas/…/datos/respaldo` en ese orden | Gerente | Permitir ambos |
| 6 | Actualizar `bloqueada: true` en una entrega | Gerente | **Negar** |
| 7 | Actualizar `bloqueada: true` y `heAprobada` | GZ de esa tienda (correoGZ) | Permitir |
| 8 | Actualizar `reapertura.estado: solicitada` en entrega bloqueada | Gerente | Permitir |
| 9 | Publicar (actualizar) una entrega después de `fechaPlanilla` del calendario | Gerente | **Negar** |
| 10 | Lo mismo, con `reapertura.estado: aprobada` y `resueltaFecha` posterior | Gerente | Permitir |
| 11 | Crear `aperturas/AMPM01_2026-10-Q1` | GZ de AMPM01 | Permitir |
| 12 | Crear `aperturas/AMPM01_2026-10-Q1` | GZ de otra tienda | **Negar** |
| 13 | Leer `personal/*` | Gerente de AMPM01, consultando solo `tienda == AMPM01` | Permitir |
| 14 | Leer `personal/*` | GZ o Visualizar | **Negar** |
| 15 | Crear `personal/*` con `alta.origen: tienda` | Gerente de su tienda | Permitir |
| 16 | Borrar `personal/*` | Auxiliar de Reclutamiento | **Negar** |
| 17 | Borrar `personal/*` | Encargado de Reclutamiento o RRHH | Permitir |
| 18 | Crear `tiendas/AMPM99` | Encargado de Reclutamiento | Permitir |
| 19 | Cambiar `nombre` de una tienda | Encargado de Reclutamiento | **Negar** |
| 20 | Cambiar solo `plazas` | Encargado de Reclutamiento | Permitir |
| 21 | Crear `vacantes/*` | Auxiliar de Reclutamiento | **Negar** |
| 22 | Cambiar `estado: cubierta` en una vacante | Auxiliar de Reclutamiento | Permitir |
| 23 | Leer o escribir `roles/*` | Cualquiera que no sea superusuario | **Negar** |
| 24 | Crear o actualizar una entrega con `fecha` distinta de la hora del servidor (`request.time`) | Gerente | **Negar** (evita adelantar la hora de entrega) |
| 25 | Poner `alta.confirmada: true` en un alta con `alta.origen: tienda` | Gerente | **Negar** (la confirma RRHH, no la propia tienda) |
| 26 | Poner `alta.confirmada: true` y `confirmadaPor` propio en un alta con `alta.origen: rrhh` | Gerente de esa tienda | Permitir |
| 27 | Poner `baja.confirmada: true` en una baja propuesta por la propia tienda | Gerente | **Negar** |
| 28 | Confirmar o disputar (`confirmadaPor` / `disputadaPor` propio) una baja con `origen: rrhh` | Gerente de esa tienda | Permitir |
| 29 | Escribir `trabajo/{su tienda}` | Usuario con rol creado en la app con permiso `mi_horario` y esa tienda en `tiendas` | Permitir |
| 30 | Escribir `calendario/*` | Usuario con rol creado en la app con permiso `calendario` | Permitir (sin ese permiso: **Negar**) |
| 31 | Leer `personal/*` | Auxiliar de Reclutamiento | Permitir; borrar: **Negar** |
| 32 | Cambiar vacante a `estado: cubierta` con `cerrada` | RRHH o Auxiliar (permiso `rrhh_cargar`) | Permitir (cancelarla: **Negar**) |

Nota del caso 9: el cierre usa el campo `fechaPlanilla` (texto `AAAA-MM-DD`) del documento `calendario/{quincena}`, hasta las 23:59 hora de Nicaragua. Si ese campo está vacío, la quincena **no** se cierra sola.

## 3. Datos que deben existir
- **Usuarios con rol nuevo:** los roles Encargado y Auxiliar de Reclutamiento y los que crees en la app necesitan el campo `permisos`. Se escribe solo al asignar el rol desde Administración › Usuarios (o al importar el Excel de roles; la importación ya lo agrega).
- **Usuarios RRHH anteriores sin `permisos`:** funcionan porque las reglas usan la plantilla de RRHH como respaldo.
- **Calendario:** planilla debe publicar `fechaPlanilla` en cada quincena para que el cierre automático funcione.
- **Presupuesto de plazas:** Administración › 3 · Presupuesto de plazas, con el Excel de presupuesto.
- **Altas de personal:** Recursos Humanos › 1 · Cargar altas, con el Excel de altas (después de publicar roles y tiendas).
- **Importar roles otra vez** conserva las plazas y las tiendas creadas en la app (ahora usa `merge`), pero **sobrescribe el rol, el alcance y los permisos** de los usuarios que aparezcan en el Excel. El Excel de roles sigue siendo la fuente de verdad para esos usuarios.

## 4. Subir el código
1. En GitHub Desktop: crea una rama, revisa los cambios y confirma que no aparece ningún `.xlsx`, `.json` ni respaldo (el `.gitignore` los bloquea).
2. Haz un pull request a `main` y fusiónalo. GitHub Pages publica en 1–2 minutos.
3. Prueba en línea con una cuenta de cada rol: inicio de sesión, una entrega, un cierre de quincena y una carga de altas.

## 4b. Service Worker (sin conexión)
- `sw.js` debe quedar en la raíz del repositorio, junto a `index.html`. GitHub Pages lo sirve por HTTPS, que es lo que exigen los navegadores.
- No se pudo probar su instalación en el navegador integrado de la sesión (no soporta Service Workers); su lógica sí se probó con una red simulada. **Pruébalo en Chrome:** abre RITMO, entra una vez, corta el internet (modo avión) y recarga: debe abrir la interfaz y el asistente de ayuda. En DevTools › Application › Service Workers debe aparecer `sw.js` activado.
- Sin internet solo funcionan las pantallas y la ayuda; los datos reales (horarios, personal, entregas) vuelven al recuperar la conexión.
- Si publicas cambios y los usuarios siguen viendo la versión anterior, sube el número de `VERSION` en `sw.js`.

## 5. Ajustes de Google Cloud y GitHub
Ver `SEGURIDAD.md` (restringir la clave de API, App Check, secret scanning, 2FA, rama protegida).

## Límites conocidos
- El cierre de **horarios** del Generador es solo en pantalla: el horario de cada tienda se guarda como un solo documento y el servidor no puede impedir editar una semana concreta. El cierre de la **planilla** sí lo impone el servidor.
- Las alertas al jefe inmediato no envían correos automáticos (requeriría el plan Blaze y funciones en la nube).
- El asistente de ayuda busca por palabras clave; la IA conversacional queda para una fase posterior (necesita un servidor intermedio y el plan Blaze para guardar la clave de API).
