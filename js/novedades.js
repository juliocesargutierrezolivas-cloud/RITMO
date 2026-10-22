// RITMO · Versión publicada. Subir este número en CADA publicación: las sesiones abiertas lo comparan con el que está en el
// sitio y avisan al usuario que hay una versión nueva (se aplica al cerrar sesión y volver a entrar).
export const VERSION = "3.5";

// RITMO · Novedades del desarrollador
// Agregar cada mejora ARRIBA (la más reciente primero). id único y creciente.
// tipo: "Nuevo" | "Mejora" | "Corrección" · para: roles que lo ven ("Todos" o lista)
export const NOVEDADES = [
  {
    id: 55, fecha: "2026-10-21", version: "3.5", tipo: "Nuevo", para: ["Superusuario"],
    titulo: "Periodos: abrir y cerrar quincenas de todas las tiendas",
    detalle: "Hay una pestaña nueva, Periodos, junto a Administración: una matriz con todas las tiendas y las últimas 6 quincenas. Casilla marcada = abierta (el gerente puede importar horarios, cambiar y publicar); desmarcada = cerrada. Con «Abrir septiembre y octubre» o la casilla de cada columna abres de una vez los periodos atrasados para que las tiendas importen sus horarios; luego cada GZ los cierra con «Aprobar HE». Cada apertura y cierre queda en la auditoría."
  },
  {
    id: 54, fecha: "2026-10-21", version: "3.5", tipo: "Mejora", para: "Todos",
    titulo: "Pantallas más legibles y recorrido de bienvenida más visible",
    detalle: "El diálogo de Importar Excel ya no esconde columnas: a pantallas medianas cada fila se muestra completa. Configuración, Matriz base y Seguimiento aprovechan todo el ancho y la columna de acciones del Seguimiento (Ver, Planilla Excel, Aprobar HE, Abrir quincena) queda a la vista. La invitación al recorrido de la primera visita ahora aparece al centro, grande y con el fondo atenuado."
  },
  {
    id: 53, fecha: "2026-10-21", version: "3.5", tipo: "Mejora", para: ["RRHH","Encargado de Reclutamiento","Auxiliar de Reclutamiento","Superusuario"],
    titulo: "Al cargar altas, las cédulas repetidas se explican con nombres",
    detalle: "Si dos personas del Excel traen la misma cédula, RITMO ahora te dice quiénes son y en qué filas (antes solo daba el número de fila) y omite a la segunda. Si una cédula ya está registrada a nombre de otra persona, ya no la sobrescribe: la marca como «Cédula de otra persona» para que corrijas el archivo. Así nadie se queda sin aparecerle a su tienda sin saber por qué."
  },
  {
    id: 52, fecha: "2026-10-21", version: "3.5", tipo: "Nuevo", para: "Todos",
    titulo: "Tutoriales para todos los roles y más ayudas",
    detalle: "Ahora hay recorridos guiados en Tutoriales para cada rol: Matriz base y Planilla para gerentes de tienda; Seguimiento y Calendario para GZ, GD, GO y planilla; Recursos Humanos y Reclutamiento; y Administración para el superusuario. El asistente de ayuda suma 40 respuestas nuevas, por ejemplo cómo duplicar o limpiar una semana, deshacer, enviar el horario por WhatsApp, entender el semáforo, aprobar el MBK, publicar altas o ver la auditoría. Escribe lo que quieres hacer y te lleva paso a paso."
  },
  {
    id: 51, fecha: "2026-10-21", version: "3.5", tipo: "Mejora", para: ["Editor","Superusuario"],
    titulo: "Guía de la Configuración de tu tienda",
    detalle: "Ya hay un recorrido «Configuración: horarios y reglas de tu tienda» en Tutoriales y ayudas en el asistente para cambiar la entrada y salida de un turno, crear un horario nuevo, fijar el presupuesto de agentes y el tope semanal, elegir los días del MBK de 12 h y agregar la festividad local."
  },
  {
    id: 50, fecha: "2026-10-21", version: "3.5", tipo: "Mejora", para: ["Editor","Visualizar","Descargar","Superusuario"],
    titulo: "El monto del MBK solicitado se mantiene al día",
    detalle: "Si una tienda cambia un viático o su horario después de solicitar el MBK, el monto solicitado se actualiza solo en cada guardado (y al volver a publicar la planilla), así la vista del GZ muestra siempre lo vigente. Si el GZ ya había aprobado otro monto, la tienda sale marcada para aprobar de nuevo. En Planilla MBK también hay un botón para actualizar la solicitud al instante."
  },
  {
    id: 49, fecha: "2026-10-21", version: "3.5", tipo: "Corrección", para: ["Editor","Superusuario"],
    titulo: "El viático MBK de cada persona es por día, no semanal",
    detalle: "En Planilla › Datos del personal la columna ahora se llama Viático por día MBK: el monto que escribes es lo que se le paga a esa persona por cada día con salida de 8 pm o 10 pm (por ejemplo, 50 por día) y ya no se divide entre 7. Si ya habías escrito montos, ahora se leen por día. El presupuesto semanal de la tienda sigue igual y se compara con lo real."
  },
  {
    id: 48, fecha: "2026-10-21", version: "3.5", tipo: "Mejora", para: ["Editor","Superusuario"],
    titulo: "Viático MBK por persona y solicitud automática con la planilla",
    detalle: "En Planilla › Datos del personal hay una columna nueva, Viático por día MBK: escribe lo que se le paga a cada persona por cada día con salida de 8 pm o 10 pm. El viático de la semana es ese monto por sus días con salida; quien no lo tiene sigue compartiendo el presupuesto de la tienda. Además, al publicar la planilla el viático de las mismas semanas de pago se solicita solo, y a las tiendas que ya publicaron se les aplicó igual al abrir Mi horario. La tabla de Planilla MBK queda para observar y compara el presupuesto semanal con lo real. Al publicar, RITMO te avisa «Tu Planilla MBK está lista»."
  },
  {
    id: 47, fecha: "2026-10-21", version: "3.5", tipo: "Mejora", para: ["Editor","Superusuario"],
    titulo: "Liquidación a la par del horario, celular y tutoriales nuevos",
    detalle: "La Liquidación semana ahora es una tabla como la de tu Excel (Nombre, Turnos, Horas, H.E. y Feriado, con el total) y va a la par del horario en pantallas grandes. En el celular, Mi horario se abre a pantalla completa y, en vertical, te sugiere girar el teléfono sin bloquearte. Los tutoriales y el asistente de ayuda ya explican todo esto, con un recorrido nuevo: «Importar horarios desde Excel»."
  },
  {
    id: 46, fecha: "2026-10-20", version: "3.5", tipo: "Nuevo", para: ["Editor","Superusuario"],
    titulo: "Importar horarios desde Excel",
    detalle: "En Mi horario hay un botón Importar Excel. Lee la plantilla de RITMO o tu hoja manual de siempre (LUNES a DOMINGO), reconoce a cada persona por la cédula de la hoja PLANILLA o por su nombre, propone la caja y el horario de cada fila y arma las semanas. Quien no se pueda vincular se marca en rojo: sin turnos la planilla no le cuenta horas extra, feriados ni novedades (sus días se calculan desde su ingreso). También compara la tabla NOMBRE · TURNOS de tu Excel, crea el horario «RITMO Turno 16 h» cuando una celda trae horas anotadas, y los turnos de 24 h quedan con la alerta «¡Turno de 24 hrs!». Los avisos de la carga quedan en la semana y en la campanita hasta que los corrijas."
  },
  {
    id: 45, fecha: "2026-10-19", version: "3.4", tipo: "Nuevo", para: "Todos",
    titulo: "Bandeja de avisos",
    detalle: "La campanita de arriba reúne lo que te falta por hacer según tu rol: entregas pendientes, aprobaciones, altas y bajas por confirmar, vacantes y más. Los avisos se calculan solos, se marcan como leídos y cada uno trae un botón para ir a resolverlo. Todo lo que ya existía se conserva."
  },
  {
    id: 44, fecha: "2026-10-19", version: "3.4", tipo: "Nuevo", para: ["Visualizar","Descargar","Superusuario"],
    titulo: "Seguimiento: horas extra, semáforo, recordatorio y Excel",
    detalle: "Cada tienda muestra sus horas extra y feriadas de las semanas marcadas para pago, y un semáforo de planilla, horas extra, MBK y plazas. Arriba hay una tarjeta con el total. El botón Recordatorio arma un mensaje de WhatsApp con las tiendas a las que les falta algo, y Excel descarga lo que ves. Las tarjetas ahora dicen de qué quincena son."
  },
  {
    id: 43, fecha: "2026-10-19", version: "3.4", tipo: "Mejora", para: ["Visualizar","Descargar","Superusuario"],
    titulo: "Planilla MBK: varias semanas y filtros compartidos",
    detalle: "Puedes elegir varias semanas a la vez; el GZ aprueba su selección completa. Los filtros de Seguimiento ahora también filtran la tabla de MBK, y hay una alerta cuando una tienda entregó planilla y no solicitó MBK. GD y GO solo consultan. Ver como ahora incluye a cada auxiliar de planilla."
  },
  {
    id: 42, fecha: "2026-10-19", version: "3.4", tipo: "Nuevo", para: ["RRHH","Superusuario"],
    titulo: "Rotación, Excel de personal y registro de auditoría",
    detalle: "RRHH ve las bajas de los últimos 6 meses por mes y por zona, con rotación y antigüedad al salir, y puede descargar el personal en Excel (sin cédulas). El superusuario tiene un registro de auditoría con quién aprobó horas extra y MBK, y quién abrió o reabrió quincenas."
  },
  {
    id: 40, fecha: "2026-10-18", version: "3.3", tipo: "Nuevo", para: ["Visualizar","Descargar","Superusuario"],
    titulo: "Planilla MBK: resumen a solicitar",
    detalle: "En Seguimiento, debajo del detalle por tienda, hay un cuadro con el monto de MBK que solicita cada tienda por semana, con observaciones: qué semana pide, si una tienda pide otra semana distinta a las demás o si cambió el horario después de solicitar. El GZ marca Aprobado y puede descargar la imagen; GD y GO lo consultan."
  },
  {
    id: 41, fecha: "2026-10-18", version: "3.3", tipo: "Mejora", para: ["RRHH","Encargado de Reclutamiento","Auxiliar de Reclutamiento","Superusuario"],
    titulo: "Reclutamiento y RRHH más completos",
    detalle: "Los prospectos se pueden editar. Vacantes y plazas por cubrir tienen scroll, se ven por tienda o por zona, y las vacantes abiertas se pueden quitar todas. RRHH muestra cuántas personas faltan y permite editar cargo, categoría, empresa o tienda del personal activo (ascensos y traslados), con historial."
  },
  {
    id: 39, fecha: "2026-10-18", version: "3.2", tipo: "Mejora", para: ["Encargado de Reclutamiento","Auxiliar de Reclutamiento","Superusuario"],
    titulo: "Reclutamiento: dónde enfocarte",
    detalle: "Reclutamiento abre con las plazas por cubrir de cada tienda (presupuesto menos personal activo), de la más urgente a la menos, con filtro por zona. Quien tiene el permiso de aperturas puede abrir las vacantes de una tienda o de todas con un clic; al contratar o dar de alta a alguien, la vacante se cierra sola."
  },
  {
    id: 38, fecha: "2026-10-18", version: "3.1", tipo: "Nuevo", para: ["Encargado de Reclutamiento","Auxiliar de Reclutamiento","Superusuario"],
    titulo: "Prospectos: del candidato a la contratación",
    detalle: "En Reclutamiento hay una lista de prospectos con etapas (nuevo, entrevista, documentos, aceptado por la tienda). Al contratar se pide la cédula y la fecha de ingreso: se crea el alta en RRHH para que la tienda la confirme y se cierra la vacante abierta de ese cargo. Los prospectos no guardan cédula hasta que se contratan."
  },
  {
    id: 37, fecha: "2026-10-18", version: "3.1", tipo: "Mejora", para: ["RRHH","Superusuario"],
    titulo: "Doble motivo de baja",
    detalle: "En la ficha de una persona dada de baja se ven dos motivos: el que escribió la tienda y el de RRHH. RRHH puede agregar o editar el suyo sin borrar el de la tienda."
  },
  {
    id: 36, fecha: "2026-10-18", version: "3.0", tipo: "Nuevo", para: ["RRHH","Superusuario"],
    titulo: "Tablero de RRHH: filtros, tarjetas y ficha",
    detalle: "Filtra por región, zona o tienda. Las tarjetas de arriba filtran la lista al tocarlas. El cuadro Estado por tienda muestra activos frente al presupuesto y los días sin completar; toca una tienda para ver solo a su gente. Al tocar el nombre de una persona se abre su ficha."
  },
  {
    id: 35, fecha: "2026-10-18", version: "3.0", tipo: "Nuevo", para: "Todos",
    titulo: "Accesibilidad: tema, letra y luz nocturna",
    detalle: "El botón Aa (arriba, junto a Ayuda) permite elegir tema claro u oscuro, tamaño de letra al 100, 112 o 125 % y luz nocturna suave. Se recuerda en este navegador. Dentro del Generador se aplica el tamaño de letra y la luz nocturna; el tema oscuro cubre el panel."
  },
  {
    id: 34, fecha: "2026-10-18", version: "3.0", tipo: "Mejora", para: "Todos",
    titulo: "Pantalla de carga y manual ocultable",
    detalle: "RITMO abre con el logo y sus barras en movimiento (se detienen si pediste reducir animaciones). El manual Cómo se entrega se puede ocultar y el navegador recuerda tu elección."
  },
  {
    id: 33, fecha: "2026-10-18", version: "2.10", tipo: "Mejora", para: "Todos",
    titulo: "Datos de arranque cargados una sola vez",
    detalle: "Los archivos de roles, presupuesto y altas se cargan una vez desde Administración y alimentan a todos los usuarios: cada tienda ve su presupuesto y su personal activo desde el primer día. A partir de ahí solo se actualiza el día a día. El superusuario tiene un respaldo descargable y un reinicio con confirmación para casos de emergencia. RRHH y Reclutamiento ya no ven la quincena ni la alerta de planilla."
  },
  {
    id: 32, fecha: "2026-10-18", version: "2.9", tipo: "Nuevo", para: "Todos",
    titulo: "Asistente de ayuda flotante",
    detalle: "El botón Ayuda (abajo a la derecha) abre un asistente: elige una categoría, una acción y recibe la respuesta corta con el botón Iniciar recorrido visual, que oscurece la pantalla y te guía paso a paso. También puedes escribir tu duda con tus palabras. Funciona sin internet con las guías guardadas en tu navegador; los datos de RITMO sí necesitan conexión."
  },
  {
    id: 30, fecha: "2026-10-18", version: "2.8", tipo: "Nuevo", para: ["Superusuario"],
    titulo: "Roles y usuarios desde la app",
    detalle: "En Administración, Roles y permisos muestra todos los roles, permite crear nuevos marcando los módulos que verán, duplicar uno existente y eliminar los creados aquí. Usuarios permite cambiar el rol de una persona y crear usuarios nuevos. Los roles Encargado y Auxiliar de Reclutamiento ya vienen incluidos."
  },
  {
    id: 31, fecha: "2026-10-18", version: "2.8", tipo: "Nuevo", para: ["RRHH","Encargado de Reclutamiento","Auxiliar de Reclutamiento","Superusuario"],
    titulo: "Reclutamiento: vacantes, tiendas nuevas y puestos nuevos",
    detalle: "La pestaña Reclutamiento lista las vacantes abiertas por tienda. El Encargado puede abrir una tienda nueva (con su presupuesto y sus vacantes), agregar un puesto nuevo (suma una plaza al presupuesto) y cancelar vacantes. Quien carga altas puede marcar una vacante como cubierta, y se cierra sola cuando RRHH da de alta a alguien en esa tienda con ese cargo."
  },
  {
    id: 28, fecha: "2026-10-18", version: "2.7", tipo: "Nuevo", para: "Todos",
    titulo: "Cierre automático tras la fecha de pago",
    detalle: "Pasada la fecha de entrega de planilla, la planilla y los horarios de esa quincena quedan cerrados. Solo tu GZ puede reabrirlos: en Entregar solicitas la reapertura, o el GZ usa Abrir quincena en Seguimiento. Lo que se publique después de una reapertura cuenta a tiempo. Los GZ ven un 🔒 en las tiendas cerradas."
  },
  {
    id: 29, fecha: "2026-10-18", version: "2.7", tipo: "Mejora", para: ["Editor","Descargar","Superusuario"],
    titulo: "Quien ingresa en la semana de corte se paga en la siguiente quincena",
    detalle: "Si una persona ingresa en la semana (lunes a domingo) que contiene el 15 o el último día del mes, la planilla de esa quincena la marca con la nota 'se paga en la siguiente quincena' y la paga en la quincena siguiente con los días reales desde su ingreso, sin el tope de 15. Ejemplo: ingreso el 12 de octubre, se paga en la 2da de octubre con 20 días."
  },
  {
    id: 26, fecha: "2026-10-18", version: "2.6", tipo: "Nuevo", para: ["Editor","Superusuario"],
    titulo: "Recursos Humanos y tu personal, sin duplicados",
    detalle: "RRHH carga las altas y tú las confirmas desde Mi horario: cada persona se empareja por cédula (o por nombre) para que nadie quede duplicado. Si hay una línea repetida, elige vincularla o eliminarla con ✕: no queda como baja. Lo que tú registras (altas y bajas) lo confirma RRHH, y si RRHH registra una baja, tú la confirmas o la disputas."
  },
  {
    id: 27, fecha: "2026-10-18", version: "2.6", tipo: "Mejora", para: ["Editor","Superusuario"],
    titulo: "Bajas: nombre en negrita y sin color",
    detalle: "Quien ya tiene baja conserva su nombre en el horario, pero sin color de fondo y en negrita, para que se note sin confundirse con el personal activo."
  },
  {
    id: 25, fecha: "2026-10-18", version: "2.5", tipo: "Nuevo", para: ["Visualizar","Descargar","Superusuario"],
    titulo: "Alertas de incumplimiento para jefes inmediatos",
    detalle: "En Seguimiento aparece una tarjeta con las tiendas de tu alcance que no cumplen la fecha límite: críticas, vencidas, por vencer, entregas tardías y solicitudes de reapertura. Con ✉ Avisar abres tu correo con el mensaje listo, o copias el texto para WhatsApp, y marcas Ya avisé para llevar el control. La pestaña Seguimiento muestra un punto con el número de pendientes."
  },
  {
    id: 24, fecha: "2026-10-18", version: "2.5", tipo: "Nuevo", para: "Todos",
    titulo: "El GZ aprueba las horas extra y la planilla se bloquea",
    detalle: "Tu GZ revisa la planilla publicada y, en Seguimiento, toca Aprobar HE. Desde ese momento la planilla de esa quincena queda bloqueada (🔒). Si la tienda necesita corregir algo, en Entregar usa Solicitar reapertura y escribe el motivo; el GZ la aprueba o la rechaza. Lo que se publique después de una reapertura aprobada cuenta siempre a tiempo."
  },
  {
    id: 23, fecha: "2026-10-18", version: "2.5", tipo: "Nuevo", para: ["Visualizar","Descargar","Superusuario"],
    titulo: "Personal activo vs presupuesto",
    detalle: "En Seguimiento hay una columna Personal que compara el personal activo de cada tienda con sus plazas presupuestadas, sin contar al gerente de tienda: Faltan, Completo o Sobran. Arriba, un indicador muestra el porcentaje de plazas cubiertas. El mismo dato aparece en el módulo Planilla de cada tienda. Solo se comparten cifras, nunca nombres, cédulas ni salarios."
  },
  {
    id: 22, fecha: "2026-10-18", version: "2.4", tipo: "Nuevo", para: "Todos",
    titulo: "Tutoriales: recorridos guiados dentro de RITMO",
    detalle: "Nueva pestaña Tutoriales y botón ❓ arriba. La pantalla se oscurece, te mostramos dónde hacer clic y, si quieres, un locutor lee cada paso. Hay un recorrido general para todos y, para gerentes de tienda, lecciones de Mi horario, Entrega de la quincena y Novedades. Las guías de los demás roles llegarán pronto."
  },
  {
    id: 21, fecha: "2026-10-18", version: "2.4", tipo: "Mejora", para: ["Editor","Superusuario"],
    titulo: "Mi horario más cómodo: un solo scroll, fechas y colores",
    detalle: "Mi horario ya no tiene doble scroll: la página queda fija y el Generador se desplaza solo. La fecha de alta y de baja se puede teclear sin que el campo se cierre, y al hacer clic en un nombre queda listo para escribir. En Matriz base, toca el cuadro de color para elegir de una paleta como la de Excel; si el nombre es masculino o femenino, RITMO sugiere azules o rosados."
  },
  {
    id: 20, fecha: "2026-10-18", version: "2.3", tipo: "Nuevo", para: ["Superusuario"],
    titulo: "Compartir RITMO: tarjeta, QR y mensaje",
    detalle: "En Administración, el cuadro Compartir RITMO trae el enlace oficial, un código QR descargable y un mensaje de lanzamiento listo para copiar o enviar por WhatsApp. Al compartir el enlace se muestra una tarjeta con el logo."
  },
  {
    id: 19, fecha: "2026-10-18", version: "2.3", tipo: "Nuevo", para: ["Editor","Superusuario"],
    titulo: "Cumpleaños en Mi horario",
    detalle: "Si la cédula del colaborador está completa, Mi horario avisa los cumpleaños de la semana y marca 🎂 el día en Novedades del personal. La hoja de asistencia lo anota en Observaciones. Solo se usan el día y el mes; el año de la cédula no se guarda ni se muestra."
  },
  {
    id: 18, fecha: "2026-10-18", version: "2.2", tipo: "Mejora", para: ["Superusuario"],
    titulo: "Estado de roles y accesos en Administración",
    detalle: "Un cuadro fijo muestra cuándo y quién publicó por última vez los roles (tiendas y usuarios) y el último envío de accesos. Se lee de la nube, así que no se pierde al usar Ver como."
  },
  {
    id: 17, fecha: "2026-10-18", version: "2.2", tipo: "Mejora", para: "Todos",
    titulo: "Alerta de entrega más inteligente",
    detalle: "La alerta de planilla desaparece para quien ya entregó y, cuando se cumple la fecha de entrega de planilla, deja de mostrarse. Mientras tanto, solo aparece a quienes tienen tiendas pendientes."
  },
  {
    id: 16, fecha: "2026-10-15", version: "2.1", tipo: "Mejora", para: "Todos",
    titulo: "Planilla en Excel directo y semanas en orden",
    detalle: "Planilla descarga la planilla en Excel de cada tienda con un clic, con las horas extra de las semanas publicadas en el calendario; el 💾 guarda ese Excel en el navegador. El calendario muestra las 4 semanas anteriores y las del mes en curso, en orden. Ver mi entrega del gerente muestra Horario, Planilla y Planilla MBK."
  },
  {
    id: 15, fecha: "2026-10-15", version: "2.0", tipo: "Nuevo", para: ["Editor","Superusuario"],
    titulo: "Publicar planilla desde el Generador",
    detalle: "En el módulo Planilla de Mi horario está el botón 📤 Publicar planilla: entrega la quincena a RITMO. Queda en gris (✓ Planilla publicada) y vuelve a color si haces algún cambio, para que lo publiques de nuevo."
  },
  {
    id: 14, fecha: "2026-10-15", version: "2.0", tipo: "Nuevo", para: ["Editor","Superusuario"],
    titulo: "Mi horario: el Generador dentro de RITMO",
    detalle: "Ya no necesitas abrir otro archivo: en la pestaña Mi horario creas el horario, la planilla y MBK, y todo se guarda solo en la nube. Trae tu respaldo una sola vez o empieza desde cero."
  },
  {
    id: 13, fecha: "2026-10-15", version: "1.9", tipo: "Mejora", para: ["Superusuario"],
    titulo: "Roles Beta y entrega de prueba en un clic",
    detalle: "En Ver como hay un grupo Pruebas con gerente de tienda, GZ, distrito, operaciones y planilla Beta, todos sobre AMPM Beta. En Administración, un botón carga una entrega ficticia en AMPM Beta para revisar cada vista."
  },
  {
    id: 12, fecha: "2026-10-15", version: "1.8", tipo: "Nuevo", para: "Todos",
    titulo: "Ver la operación de cada tienda (solo lectura)",
    detalle: "Con el botón 👁 Ver abres el horario, la planilla, la planilla MBK y el historial de la entrega tal como los ve la tienda, sin poder editar. Planilla, además, descarga la planilla en Excel desde ahí."
  },
  {
    id: 11, fecha: "2026-10-15", version: "1.8", tipo: "Nuevo", para: ["Editor","Superusuario"],
    titulo: "Hoja de asistencia lista para firmar",
    detalle: "En el Generador, el botón 🖨 Hoja de asistencia imprime la semana en tamaño carta con el turno programado de cada colaborador y el espacio para su firma."
  },
  {
    id: 10, fecha: "2026-10-15", version: "1.7", tipo: "Nuevo", para: "Todos",
    titulo: "Cambio de contraseña cada 60 días",
    detalle: "Por seguridad, RITMO te pedirá una contraseña nueva cada 60 días, contados desde tu primer ingreso. Te avisamos 7 días antes. También puedes cambiarla cuando quieras con el botón 🔑 de arriba."
  },
  {
    id: 9, fecha: "2026-10-15", version: "1.7", tipo: "Nuevo", para: ["Editor","Descargar","Superusuario"],
    titulo: "Guardar copias en este navegador",
    detalle: "Con el botón 💾 o la casilla al entregar, guardas una copia del respaldo y la hoja de asistencia en tu navegador. Las encuentras en la pestaña 'Guardados aquí'. No lo uses en computadoras compartidas."
  },
  {
    id: 8, fecha: "2026-10-15", version: "1.6", tipo: "Nuevo", para: "Todos",
    titulo: "Entrega completa: hoja de asistencia y validación del gerente",
    detalle: "El aviso de planilla ahora trae la fecha límite de envío, la fecha de entrega de planilla, las semanas de horas extra (de lunes a domingo) y los requisitos. El gerente sube el respaldo y la foto de la hoja de asistencia y confirma que validó todo. Si entrega después del límite, se marca 'Tarde · sin pago de HE'."
  },
  {
    id: 7, fecha: "2026-10-15", version: "1.5", tipo: "Mejora", para: "Todos",
    titulo: "Saludo personalizado e indicador de conexión",
    detalle: "Al entrar, RITMO te saluda por tu nombre y te recuerda qué puedes hacer. Arriba a la derecha, la luz verde confirma que estás en línea con conexión segura; si se pierde internet se pone en rojo."
  },
  {
    id: 6, fecha: "2026-10-15", version: "1.5", tipo: "Nuevo", para: ["Superusuario"],
    titulo: "Ver como: revisa la pantalla de cada rol",
    detalle: "El superusuario puede ver RITMO como gerente de tienda, gerente de zona, distrito, operaciones o planilla, sin cambiar sus permisos reales. Ideal para revisar antes de producción."
  },
  {
    id: 5, fecha: "2026-10-15", version: "1.4", tipo: "Mejora", para: ["Superusuario"],
    titulo: "Tienda de pruebas y envío de acceso a un solo correo",
    detalle: "AMPM Beta (zona Pruebas) solo la ve el superusuario y su gerente de prueba; no cuenta en el cumplimiento. En Administración se puede enviar el acceso a un correo puntual antes de hacerlo masivo."
  },
  {
    id: 4, fecha: "2026-10-15", version: "1.3", tipo: "Nuevo", para: "Todos",
    titulo: "RITMO conectado a la nube",
    detalle: "El acceso con usuario y contraseña ya funciona en línea. Tus entregas y el calendario de planilla se guardan de forma segura y los ve cada quien según su rol."
  },
  {
    id: 3, fecha: "2026-10-15", version: "1.2", tipo: "Nuevo", para: "Todos",
    titulo: "Calendario de planilla y alertas de entrega",
    detalle: "Planilla define por quincena qué semanas de horas extra se pagan y la fecha límite de entrega. Todos ven la alerta con la cuenta regresiva; el seguimiento marca entregas a tiempo, tardías y vencidas."
  },
  {
    id: 2, fecha: "2026-10-15", version: "1.1", tipo: "Nuevo", para: "Todos",
    titulo: "Acceso con usuario y panel por rol",
    detalle: "Inicio de sesión con correo y contraseña. Gerentes entregan la quincena subiendo el respaldo del Generador; GZ, distrito y operaciones ven el cumplimiento; planilla descarga lo de sus tiendas asignadas."
  },
  {
    id: 1, fecha: "2026-10-15", version: "1.0", tipo: "Nuevo", para: "Todos",
    titulo: "Bienvenida a RITMO",
    detalle: "Pantalla de inicio con un vistazo animado de lo que hace la herramienta: autollenado, ajustes, novedades, planilla, viático MBK y respaldo."
  }
];
