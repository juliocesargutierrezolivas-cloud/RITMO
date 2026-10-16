# RITMO · Documento de traspaso

Proyecto piloto creado por Gerencia de Zona (Julio César Gutiérrez Olivas) para aprobación y paso a producción. Este documento permite entregar RITMO al equipo de desarrollo de AMPM sin depender de quien lo creó.

## 1. Qué hace
- Gerentes de tienda entregan cada quincena el respaldo del Generador de Horarios (horario + datos de planilla).
- GZ, distrito y operaciones ven el cumplimiento por tienda (solo lectura).
- Planilla publica el calendario de la quincena (semanas de horas extra a pagar con rezago y fecha límite) y descarga lo de sus tiendas asignadas.
- Superusuario administra tiendas, usuarios y accesos.

## 2. Arquitectura
| Pieza | Tecnología | Dónde |
|---|---|---|
| Interfaz | HTML + JS sin compilación (ES modules) | Este repositorio, publicado con GitHub Pages |
| Usuarios | Firebase Authentication (correo/contraseña) | Proyecto Firebase |
| Datos | Cloud Firestore | Proyecto Firebase |
| Seguridad | `firestore.rules` | Se publica en la consola de Firebase |
| Lectura de Excel | SheetJS (cdnjs) | Solo en el navegador del superusuario |

Sin servidor propio ni costos en el plan gratuito (Spark).

## 3. Archivos
| Archivo | Función |
|---|---|
| `index.html` | Bienvenida y login |
| `panel.html` | Panel por rol: Seguimiento, Mi tienda, Calendario de planilla, Novedades, Guardados aquí, Administración |
| `visor.html` | Abre una entrega en solo lectura dentro del Generador |
| `generador.html` | Generador de Horarios (misma versión que usan las tiendas) con modo visor `?visor=1` y hoja de asistencia |
| `js/local.js` | Copias en el navegador (IndexedDB) |
| `js/firebase-config.js` | Identificadores del proyecto Firebase y correo del superusuario inicial |
| `js/nube.js` | Conexión a Firebase y utilidades de quincena |
| `js/novedades.js` | Bitácora de mejoras que ven los usuarios |
| `firestore.rules` | Permisos por rol y alcance |
| `GUIA_FIREBASE.md` | Creación del proyecto Firebase paso a paso |
| `assets/` | Logos oficiales y animaciones de la bienvenida |

## 4. Modelo de datos (Firestore)
| Colección | Id | Campos principales |
|---|---|---|
| `usuarios` | correo en minúsculas | nombre, cargo, rol, alcance, valor, tiendas[], reportaA, activo, accesoCreado |
| `tiendas` | código (AMPMxx) | numero, nombre, zona, region, correoTienda, correoGZ, gzNombre, auxiliar, activa |
| `entregas` | `CODIGO_AAAA-MM-Q1/Q2` | tienda, quincena, archivo, bytes, estado, por, porNombre, fecha |
| `trabajo` | código de tienda | contenido (JSON del Generador en edición), bytes, por, actualizado |
| `entregas/{id}/datos/respaldo` | — | contenido (JSON del Generador: incluye cédulas y salarios), archivo, tienda |
| `calendario` | `AAAA-MM-Q1/Q2` | semanas[] (lunes de cada semana), limite, nota, por, porNombre, fecha |

## 5. Roles
| Rol | Alcance típico | Puede |
|---|---|---|
| Editor | Tienda | Entregar su quincena |
| Visualizar | GZ / Región / Todas | Ver cumplimiento |
| Descargar | Asignadas / Todas | Ver cumplimiento, descargar respaldos, publicar calendario |
| Superusuario | Todas | Todo, incluida administración |

La fuente de verdad de roles es `Roles_de_Ritmo_v2.xlsx` (no está en el repositorio por contener datos personales). Se importa desde Administración.

## 6. Cómo publicar un cambio
1. Editar en una rama, probar abriendo `panel.html` sin configuración (modo vista previa con datos de ejemplo; `?rol=Editor|Visualizar|Descargar|Superusuario`).
2. Agregar la mejora arriba en `js/novedades.js` (id siguiente).
3. Fusionar a `main`: GitHub Pages publica solo en 1–2 minutos.
4. Si cambian permisos, publicar `firestore.rules` en la consola de Firebase.

## 7. Traspaso a AMPM (checklist)
- [ ] **Repositorio:** GitHub › Settings › General › *Transfer ownership* a la organización de AMPM. GitHub redirige la dirección anterior.
- [ ] **Dominio:** si AMPM usa dominio propio, configurarlo en Settings › Pages › Custom domain y agregarlo en Firebase › Authentication › Dominios autorizados.
- [ ] **Firebase:** Configuración del proyecto › *Usuarios y permisos* › agregar al responsable de TI como **Propietario**; luego retirar las cuentas personales.
- [ ] **Correo del sistema:** buzón corporativo (p. ej. `ritmo@ampm.com.ni`) como dueño de Firebase y remitente de los correos.
- [ ] **Superusuario:** actualizar el correo en `js/firebase-config.js` y en `firestore.rules` (función `bootstrap`).
- [ ] **Facturación:** el plan gratuito cubre el piloto; evaluar plan Blaze si se agregan correos automáticos o funciones de servidor.
- [ ] **Respaldo de datos:** exportar Firestore (Consola › Firestore › Importar/Exportar, requiere Blaze) o descargar desde el panel antes de cualquier migración.

## 8. Pendientes conocidos (siguiente fase)
- Avisos por correo (entrega recibida, recordatorio antes del límite, resumen para planilla).
- Generar la planilla en Excel directo desde el panel (hoy se descarga el respaldo y se abre en el Generador).
- (Hecho en v2.0) Generador integrado en Mi horario con publicación desde Planilla.

## 9. Insumos pendientes (los consigue Julio)
- [ ] **Plazas por tienda:** cantidad de agentes + gerente de cada tienda, con todos sus datos, para precargarlos automáticamente en cada tienda y que el GT solo arme horarios.
- [ ] **Salarios por colaborador** (nombre y apellidos) para actualizar los salarios. Dato sensible: se carga por Administración, nunca se sube al repositorio.

## 10. Próxima sesión (orden propuesto)
1. Alerta: se quita a quien ya entregó; vencida solo a pendientes hasta la fecha de planilla.
2. Administración: cuadro fijo leído de la nube con la última publicación de roles y accesos.
3. Cumpleañeros (fecha desde la cédula, solo día y mes, como observación).
4. Link para compartir (tarjeta de vista previa, QR, mensaje de lanzamiento).
5. Trabajo sin conexión (app instalable con sincronización).
6. Rol RRHH: plazas presupuestadas vs reales por semana y ficha del personal.
