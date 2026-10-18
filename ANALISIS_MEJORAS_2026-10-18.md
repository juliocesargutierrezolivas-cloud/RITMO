# RITMO · Análisis de las mejoras del 18 de octubre de 2026

Fuente: `Mejoras 18.10.26.docx` (texto y 6 imágenes). Este documento no cambia el código: ordena lo pedido, dice qué ya existe, qué datos faltan, qué hay que decidir y en qué orden construirlo.

Escala de esfuerzo: **S** (horas) · **M** (1 sesión) · **L** (2–3 sesiones) · **XL** (varias versiones).

## 1. Lo que pides, en 3 bloques

| Bloque | Idea central |
|---|---|
| **A · Recursos Humanos** | Pasar de "lista de pendientes" a un **tablero de decisiones**: filtros por región, zona y tienda; tarjetas que filtran al hacer clic; días sin completar por tienda; altas y bajas por semana frente al presupuesto; ficha de la persona con su carga real en tienda. |
| **B · Reclutamiento** | Su trabajo en una sola vista (plazas pendientes por sucursal, zona y región, con contador de días), **prospectos** con proceso por etapas, y "Contratar" que clona al empleado sin reescribir. |
| **C · Generales** | Accesibilidad completa (tema oscuro de marca, tamaño de letra, luz nocturna), manual ocultable, pantalla de carga con las barras del logo, resumen de **Planilla MBK** para el GZ (GD y GO lo ven), y quitar lo de las quincenas a quienes no les sirve. |

## 2. Lo que ya existe y se reutiliza

- Registro central `personal` con alta/baja y control cruzado; `resumen` por tienda; `vacantes`; roles y permisos por módulo; `dialogo()`, `kpi`, `rh-tag`, `rhr` (estilo de tarjetas y filas).
- El Generador ya guarda por persona: días de clase (`estudia`), novedades de cada día, horas, noches y horas extra. **Pero vive en el documento `trabajo` de cada tienda**, que solo lee su gerente. Para que RRHH y Reclutamiento lo vean hay que **publicar resúmenes ligeros** (igual que se hizo con `resumen`), no abrir el horario completo.
- RRHH y Superusuario ya leen las entregas publicadas (`entregas/…/datos`, que incluyen cédulas y salarios). Eso sirve como respaldo, pero es pesado y sensible: no es la base correcta para "cómo trabaja esta persona".

## 3. Bloque A · Recursos Humanos

| # | Mejora pedida | Cómo se resolvería | Datos nuevos | Esfuerzo |
|---|---|---|---|---|
| A1 | Secciones plegables con rangos de 100 / 500 / 1000 líneas | Cada tarjeta ("Pendientes", "Personal registrado", etc.) se despliega y tiene selector de filas por página + paginación | — | S |
| A2 | Filtros de **región, zona y tienda** | Barra común arriba del tablero que filtra todo (KPI, tablas, reportes). Región y zona salen de la ficha de tienda | — | S |
| A3 | Tarjetas de avisos **interactivas** | Clic en una tarjeta aplica el filtro y baja a la lista correspondiente ("7 atrasadas" → lista de atrasadas) | — | S |
| A4 | Avisos **según la función**: tiendas incompletas, resumen por tienda/zona/región, **contador de días sin completar** | Calcular días desde que la tienda quedó por debajo de su presupuesto: se puede reconstruir con las fechas de ingreso y de baja del registro de personal | `baja.fecha` obligatoria y confiable | M |
| A5 | **Tablero informativo**: altas y tipos de contrato | Panel con altas por semana/mes, por empresa (AMPM / SASA), por categoría | **Tipo de contrato** (hoy no viene en el Excel de altas) | M |
| A6 | Quitar "3 · Registrar una baja" | Ver pregunta P2: se contradice con lo decidido antes | — | S |
| A7 | Excel de altas **solo el superusuario, una sola vez** | Quitar la tarjeta de carga a RRHH y Reclutamiento; el flujo posterior viene de Reclutamiento (Contratar) y de las tiendas | Permiso nuevo `rrhh_importar` (solo super) | S |
| A8 | Clic en el nombre → **cómo trabaja en tienda** (validar quejas de sobrecarga) | Ficha de la persona con su carga semanal: horas, extras, noches, días trabajados, novedades. Alimentada por un resumen semanal que publica el Generador | Colección `carga` (resumen semanal por persona, sin datos sensibles) | L |
| A9 | No mostrar quincenas | Ocultar selector de quincena y aviso de calendario a los roles sin Seguimiento ni Mi horario (ver imágenes 2, 3 y 6) | — | S |
| A10 | Avance **semana a semana** de altas y bajas por tienda; **reporte semanal** | Tabla y gráfica por semana (altas, bajas, neto, personal activo, % del presupuesto) y por tienda | Fechas completas en el registro | M |
| A11 | **Motivo de baja doble**: el de la tienda y el de RRHH | Dos campos en la baja: `motivoTienda` (lo ve RRHH) y `motivoRRHH` (lo que se entera cuando llama o maneja la información), con catálogo de motivos para poder medir | Catálogo de motivos | M |
| A12 | **Efectividad frente al presupuesto** | Indicadores: cobertura (activos / plazas), rotación, tiempo promedio de cobertura | Plazas por tienda (ya existe) | M |
| A13 | **Presupuesto** editable por RRHH si la tienda no lo tiene | RRHH y Reclutamiento solo pueden completar `plazas` cuando está vacío; cambiarlo después es del Encargado | Regla nueva en `tiendas` | S |
| A14 | **Modificar o eliminar** información de tiendas | Editar datos y **desactivar** (no borrar) con confirmación; borrado real solo superusuario | Reglas de `tiendas` más amplias | M |
| A15 | **Novedades de personal por tienda** (vacaciones, subsidio, ausencias) como tabla general | Publicar un resumen de novedades desde el Generador; la tabla solo muestra tiendas que tengan | Colección `novedades` | M |
| A16 | **Estudiantes por tienda**, qué día estudia y **afectación de turnos** | Tabla por tienda (conteo) con detalle por persona y día; indicador de turnos de mañana que se pierden por estudiantes | Días de clase por persona, publicados | M–L |
| A17 | **Actualizar salario** por cambio de contrato | Acceso puntual con historial (fecha, anterior, nuevo, motivo, quién). Ver P5: hoy el salario lo escribe el gerente en Planilla | Colección restringida `salarios` | L |
| A18 | **Ficha del empleado** (de las referencias) | Datos personales, puesto, departamento, jefe directo, fecha de alta | `jefe` y `departamento` (están en el Excel de altas, hoy no se guardan) | M |

## 4. Bloque B · Reclutamiento

| # | Mejora pedida | Cómo se resolvería | Esfuerzo |
|---|---|---|---|
| B1 | Ver su trabajo: plazas pendientes por **sucursal, zona y región** | Tablero con filtros y tarjetas interactivas (como A2 y A3) | S–M |
| B2 | **Días con la vacante abierta**; al ingresar alguien se reinicia | El contador cuenta desde la última alta de esa tienda con vacantes abiertas, o desde que se abrió la vacante si no hubo ninguna | S |
| B3 | **Prospectos**: tienda destino, fecha de contacto, documentos completos, entrevista, fecha probable de ingreso, botón **Completado → dar de alta** y asignar tienda | Colección `prospectos` con etapas (Postulado → Entrevista → Evaluado → Aceptado → Contratado). **No afecta las altas** hasta pulsar Contratar. Al contratar se clonan los datos a `personal` | L |
| B4 | Cada cambio guarda **quién es el reclutador** y se mide frente a sus asignaciones | Campo `reclutador` en cada movimiento y asignación de tiendas/zonas por reclutador; reporte: avance vs. asignado y trabajo extra | M |
| B5 | **GT adicional** (maternidad, accidentes) y **eventual** (temporada alta) | Dos cargos nuevos: "Gerente adicional (cobertura)" y "Eventual", con fecha de fin; **no cuentan para el presupuesto**. Afecta el Generador (lista de cargos, planilla y reglas) | L |
| B6 | Si el candidato **estudia**: ¿puede entrar según el horario? + check de **aceptado por la tienda** | Indicador por tienda con los turnos de mañana disponibles sin estudiantes, y un campo "tienda acepta" que confirma el gerente en RITMO | L |
| B7 | **Actualizar salarios** | Ver A17 y P5 | L |
| B8 | No mostrar la quincena de operaciones | Igual que A9 | S |
| B9 | **Documentación legal**: identificación, currículum, certificaciones, referencias (distinto trato a primera experiencia) | Lista de verificación por prospecto (sí/no por documento). **No se suben archivos**: ver riesgo R2 | M |

## 5. Bloque C · Cambios generales

| # | Mejora | Cómo se resolvería | Esfuerzo |
|---|---|---|---|
| C1 | **Accesibilidad global** (tema claro/oscuro de marca, tamaño de letra 100 / 112.5 / 125 %, luz nocturna, persistencia `ritmo_accessibility`, sin parpadeo) | **No existe una hoja de estilos global**: cada página trae su CSS en línea. Se crean `css/ritmo-a11y.css` y `js/a11y.js` y se cargan en las 4 páginas. Paleta de marca: azul marino `#04003f`, naranja `#ff8300`, azul `#0055ba`. Modo oscuro derivado del azul marino (no negro). Auditoría de contraste AA con un script que revise los pares de colores | L |
| C2 | Escalado de letra sin romper el calendario | Hoy casi todo está en `px`. Hay que convertir los tamaños de letra a `rem` (se puede hacer con un script) y añadir `min-width`/`flex-shrink` a las columnas del calendario y a las tarjetas | L |
| C3 | Luz nocturna sutil | Una capa fija semitransparente con mezcla `multiply` (mejor que `filter: sepia` en `body`, porque un `filter` rompe los elementos `position: fixed` como el asistente y los recorridos) | S |
| C4 | **Manual de uso** ocultable (imagen 5) | Botón mostrar/ocultar con recuerdo en el navegador | S |
| C5 | **Planilla MBK para el GZ** (también GD y GO) | Cuadro resumen bajo el detalle por tienda: monto a solicitar, semana solicitada por cada tienda, alerta si una tienda pide 3 semanas y otras 2 o hay discrepancia de fechas, check de **aprobado** y exportar **imagen**. El Generador debe publicar un resumen semanal de MBK por tienda | L |
| C6 | **Pantalla de carga** con el logo y sus barras en movimiento | Reemplazar "Cargando RITMO…" por una pantalla con las 4 barras animadas del logo (ya existe la animación `pulse`), respetando "reducir animaciones" | S |
| C7 | Ocultar lo de las quincenas a quien no le sirve | Ver A9 | S |

## 6. Modelo de datos nuevo (resumen)

| Colección o campo | Para qué | Quién lo escribe | Quién lo lee |
|---|---|---|---|
| `personal`: `contrato`, `jefe`, `departamento`, `clase[]`, `baja.motivoTienda`, `baja.motivoRRHH` | Ficha, contratos, estudiantes, doble motivo | RRHH / tienda | RRHH, Reclutamiento, gerente de su tienda |
| `carga/{tienda}` | Resumen semanal por persona: horas, extras, noches, días, novedades | Gerente (al guardar Mi horario) | RRHH |
| `novedades/{tienda}` | Vacaciones, subsidio y ausencias | Gerente | RRHH |
| `salarios/{persona}` + historial | Salario vigente y cambios por contrato | RRHH (o quien se decida) | Solo quien se decida |
| `prospectos/{id}` | Proceso de candidatos | Reclutamiento | Reclutamiento, RRHH |
| `tiendas`: `reclutador`, `activa`, edición de datos | Asignaciones y mantenimiento | Encargado | Todos los permitidos |
| `mbk/{tienda}_{semana}` | Resumen de solicitud de MBK | Gerente | GZ, GD, GO |
| Cargos nuevos en el Generador | GT adicional y Eventual | — | — |

## 7. Conflictos con lo decidido antes y preguntas

1. **P1 · Cédulas y la carga única.** Dices que el Excel de altas lo sube solo el superusuario una vez. Entonces, ¿quién da de alta a partir de ahí? Propuesta: Reclutamiento (botón Contratar) y las tiendas, y RRHH confirma. ¿Correcto?
2. **P2 · "3 · Registrar una baja".** Antes decidimos que RRHH puede registrar la baja cuando la tienda la omite. Ahora pides quitar esa tarjeta, pero también que RRHH agregue su propio motivo de baja. Propuesta: quitar el formulario suelto y dejar la acción **dentro de la ficha de la persona** (para cuando la tienda no la registra). ¿Prefieres quitarla por completo?
3. **P3 · Tipo de contrato.** El Excel de altas no trae un tipo de contrato; trae empresa (AMPM o SASA) y categorización (Nivel 1, 2, 3, Auxiliar). ¿"Tipos de contratos" se refiere a esos dos, o hay otra lista (indefinido, temporal, eventual, prueba…) que debemos crear?
4. **P4 · Estudiantes: ¿por persona?** Recomiendo guardar por persona los **días de clase** (dato poco sensible) y mostrar a RRHH tanto el conteo por tienda como el detalle al abrir. ¿De acuerdo?
5. **P5 · Salarios: ¿quién manda?** Hoy el gerente escribe el salario en Planilla. Si RRHH y Reclutamiento actualizan salarios, hay que elegir la fuente única: (a) RRHH la central y el Generador la lee, o (b) sigue en el Generador. Recomiendo (a), con historial. Implica que los gerentes dejen de editarlo. ¿Lo aceptas?
6. **P6 · Quién ve salarios.** ¿Solo RRHH y superusuario, o también el Encargado de Reclutamiento? Hoy los GZ ya los ven dentro de las entregas publicadas.
7. **P7 · Afectación de turnos.** ¿Cómo quieres medirla? Opción simple: "turnos de mañana que la tienda no puede cubrir con estudiantes". Opción completa: simular la cobertura con el horario real.
8. **P8 · "Aceptado por la tienda".** ¿Lo confirma el gerente de tienda dentro de RITMO (recomendado) o el reclutador lo marca después de hablar con él?
9. **P9 · Eventuales y GT adicional.** ¿Cuentan en el presupuesto? Recomiendo que **no**, con fecha de fin y aparte en los reportes.
10. **P10 · Planilla MBK del GZ.** ¿"Aprobado" significa que el GZ avala el monto para que planilla lo pague? ¿Se debe bloquear algo después de aprobar?
11. **P11 · Reclutadores.** ¿Cuántos reclutadores hay y cómo se asignan las tiendas (por zona, por región o una por una)?
12. **P12 · Accesibilidad.** ¿Dejamos como valores por defecto tema claro, letra 100 % y luz nocturna apagada? ¿El tema oscuro debe respetar también la preferencia del equipo del usuario?

## 8. Riesgos

- **R1 · Datos personales y salarios.** Más datos sensibles en más pantallas. Cada colección nueva necesita su regla propia y pruebas. Conviene revisar el aviso de privacidad con Legal (Ley 787).
- **R2 · Documentos del candidato.** Subir archivos exige **Firebase Storage, que requiere el plan Blaze**. Propuesta: solo lista de verificación; los documentos físicos o digitales siguen donde están hoy.
- **R3 · Prospectos antes de ser empleados.** Son datos personales de personas que aún no trabajan en AMPM: necesitan consentimiento y un plazo de conservación.
- **R4 · Rendimiento.** 1 000 filas por pantalla se pueden mostrar, pero hay que paginar y no leer toda la colección en cada clic.
- **R5 · Accesibilidad y diseño.** Es el cambio más amplio: toca las 4 páginas. Debe hacerse con la paleta de marca y probarse en el calendario de horarios.
- **R6 · Resúmenes desde el Generador.** Si el gerente no abre Mi horario, los resúmenes (carga, novedades, MBK) no se actualizan. Hay que mostrar la fecha de la última actualización.
- **R7 · Reglas de Firestore.** Seguimos sin poder probarlas contra Firebase real desde aquí; cada versión suma casos al simulador.

## 9. Orden sugerido por versiones

| Versión | Contenido | Por qué en ese orden |
|---|---|---|
| **3.0 · Base visible** | C6 pantalla de carga, C4 manual ocultable, A9 ocultar quincenas, A7 carga de altas solo superusuario | Cambios pequeños, sin datos nuevos |
| **3.1 · Accesibilidad** | C1, C2, C3 | Toca todas las páginas; mejor hacerlo antes de agregar más pantallas |
| **3.2 · Tablero de RRHH** | A1, A2, A3, A4, A10, A12, A13, A14, ficha de persona (A18) | Todo sale del registro de personal que ya existe |
| **3.3 · Bajas y datos de tienda** | A11, A15, A16, A8, A5 | Necesita resúmenes desde el Generador y definir tipo de contrato |
| **3.4 · Reclutamiento** | B1 a B4, B9, B3 | Requiere prospectos y asignación de reclutadores |
| **3.5 · Casos especiales** | B5, B6, B7, A17 | Tocan el Generador y la fuente única de salarios |
| **3.6 · MBK para el GZ** | C5 | Requiere resumen semanal de MBK y la definición de "aprobado" |

## 10. Pendientes de la 2.9 que conviene cerrar antes

- En la imagen 1 (carga de altas) aparecen **12 filas sin tienda en RITMO**, **3 cédulas repetidas** y **7 cédulas por revisar**. Hay que corregir el Excel o crear esas tiendas antes de publicar las altas.
- Cargar roles, presupuesto y accesos (ver `RESUMEN_CAMBIOS.md`).
- Probar el Service Worker en Chrome y revisar el calendario con `fechaPlanilla`.
