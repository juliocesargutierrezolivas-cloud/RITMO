// RITMO · Versión publicada. Subir este número en CADA publicación: las sesiones abiertas lo comparan con el que está en el
// sitio y avisan al usuario que hay una versión nueva (se aplica al cerrar sesión y volver a entrar).
export const VERSION = "2.9";

// RITMO · Novedades del desarrollador
// Agregar cada mejora ARRIBA (la más reciente primero). id único y creciente.
// tipo: "Nuevo" | "Mejora" | "Corrección" · para: roles que lo ven ("Todos" o lista)
export const NOVEDADES = [
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
