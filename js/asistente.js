// RITMO · Asistente flotante de ayuda (fase 1, sin IA).
// Responde dudas con un menú guiado de 3 niveles (categoría → acción → resolución) y con búsqueda por palabras clave,
// y puede iniciar un recorrido visual en la pantalla actual. Toda la ayuda está en este archivo: el Service Worker (sw.js)
// lo guarda en el navegador, así el asistente funciona igual con y sin internet. La IA conversacional queda para una fase
// posterior (necesita un servidor intermedio para guardar la clave de API).
//
// Para agregar una ayuda: sumar un objeto a AYUDA. Campos:
//   cat: categoría (nivel 1) · accion: texto del botón (nivel 2) · texto: respuesta corta (nivel 3)
//   kw: palabras clave para la búsqueda · perm: permiso necesario (ver js/roles.js) o "todos" · pasos(ctx): recorrido opcional

const F = "#genF";

export const CATEGORIAS = [
  { id: "horarios",      t: "Horarios y turnos",      i: "🗓" },
  { id: "personal",      t: "Mi personal",            i: "👥" },
  { id: "planilla",      t: "Planilla y entrega",     i: "📤" },
  { id: "seguimiento",   t: "Seguimiento y alertas",  i: "🔔" },
  { id: "rrhh",          t: "Recursos Humanos",       i: "🧾" },
  { id: "reclutamiento", t: "Reclutamiento",          i: "🏪" },
  { id: "admin",         t: "Administración",         i: "⚙️" },
  { id: "cuenta",        t: "Mi cuenta y ayuda",      i: "🔑" }
];

export const AYUDA = [
  /* ---------- Horarios y turnos ---------- */
  { cat: "horarios", perm: "mi_horario", accion: "Crear el horario de la semana", id: "crear-horario",
    kw: "crear armar llenar horario semana autollenar turnos programar generar",
    texto: "En Mi horario › Horario toca ⚡ Autollenar: arma la semana respetando la ley y las reglas de la tienda. Después puedes ajustar a mano cualquier turno.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Aquí armas el horario de tu tienda." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="auto"]', opcional: true, titulo: "⚡ Autollenar", texto: "Toca este botón y RITMO arma la semana completa. Si ya tenías turnos, usa Duplicar semana anterior para partir de ellos." },
      { frame: F, sel: ".board", opcional: true, titulo: "Revisa y ajusta", texto: "Cada celda es un turno. Toca una celda para cambiarlo, o arrástralo a otro día. Las alertas de reglas aparecen en rojo o amarillo." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Cambiar o mover un turno", id: "mover-turno",
    kw: "mover cambiar modificar editar turno arrastrar intercambiar quitar borrar solapamiento corregir cambio",
    texto: "Arrastra el nombre de una persona a otra celda para moverlo o intercambiarlo. Para quitarlo, selecciona la celda y presiona Supr. Si rompes una regla, queda marcado como alerta.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los turnos se cambian directamente en el horario de la semana." },
      { frame: F, antes: () => c.gen("horario"), sel: ".board", opcional: true, titulo: "Mover o intercambiar", texto: "Arrastra a una persona de una celda a otra. Si la celda destino ya tiene a alguien, se intercambian. Con la tecla Supr quitas el turno seleccionado." },
      { frame: F, sel: "aside.side", opcional: true, titulo: "Alertas y liquidación", texto: "Aquí ves si el cambio rompe una regla (descansos, horas, noches) y cuántas horas lleva cada persona." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Registrar vacaciones, subsidio o ausencias", id: "novedades",
    kw: "vacaciones subsidio ausencia falta faltar incapacidad permiso novedad extraordinario enfermedad falto",
    texto: "En la tabla Novedades del personal, toca la celda del día y elige Vacaciones, Subsidio, Extraordinario o Ausencia. Queda reflejado en el horario y en la planilla.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Las novedades se registran en la semana del horario." },
      { frame: F, antes: () => c.gen("horario"), sel: "table.nov", opcional: true, titulo: "Novedades del personal", texto: "Toca la celda de la persona y el día para marcar vacaciones, subsidio, extraordinario o ausencia de 8 o 12 horas." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Imprimir la hoja de asistencia", id: "asistencia",
    kw: "hoja asistencia firmar firma imprimir impresion carta semana",
    texto: "En Horario toca 🖨 Hoja de asistencia: imprime la semana en tamaño carta con el turno de cada colaborador y espacio para su firma.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "La hoja de asistencia sale del horario de la semana." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="asis"]', opcional: true, titulo: "🖨 Hoja de asistencia", texto: "Toca aquí para imprimir la semana en tamaño carta. Cada colaborador firma al terminar su turno." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Horas extra de la semana", id: "horas-extra",
    kw: "horas extra extras he extraordinarias tope 48 sobretiempo",
    texto: "Activa Horas extra esta semana solo si la necesitas; apagado, nadie pasa del tope. Las horas extra a pagar se eligen en el módulo Planilla.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Las horas extra se permiten por semana." },
      { frame: F, antes: () => c.gen("horario"), sel: ".toolbar .switch", opcional: true, titulo: "Horas extra esta semana", texto: "Enciéndelo cuando la semana lo requiera. Después, en Planilla, marcas qué semanas se pagan." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Importar mi horario desde Excel", id: "importar-horario",
    kw: "importar excel horario subir cargar archivo hoja manual plantilla vincular nombres primera vez semanas anteriores planilla",
    texto: "En Mi horario toca ⬆ Importar Excel y elige tu hoja manual (LUNES a DOMINGO) o la plantilla de RITMO. RITMO reconoce a cada persona por la cédula de la hoja PLANILLA o por su nombre, propone la caja y el horario de cada fila y arma las semanas. Si tu Excel trae la hoja PLANILLA, también puede completar cédula, nombre, ingreso y salario que falten en tu Matriz base y Planilla (solo campos vacíos). Revisa el informe y corrige lo que te avise.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "La importación se hace en el horario de tu tienda. Tu personal ya debe estar en la Matriz base." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="impxlsx"]', opcional: true, titulo: "⬆ Importar Excel", texto: "Aquí bajas la plantilla con tu personal o eliges tu archivo. Antes de importar verás una vista previa para revisar y corregir." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Una persona quedó «sin vincular» al importar", id: "importar-sin-vincular",
    kw: "sin vincular no coincidio recursos humanos rrhh sin salario sin dias trabajados nombre no aparece persona importar vinculo emparejar",
    texto: "Significa que ese nombre del Excel no coincidió con el personal que cargó RRHH. El horario es lo que alimenta la planilla: sin turnos la planilla no cuenta sus horas extra, feriados ni novedades (sus días se calculan desde su ingreso). En la vista previa, elige a su persona en el selector (queda recordado para la próxima). Si no está en tu Matriz base, confírmala o dala de alta primero.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los avisos de la importación quedan en la semana hasta que los corrijas." },
      { frame: F, antes: () => c.gen("matriz"), sel: '[data-act="addag"]', opcional: true, titulo: "Matriz base", texto: "Si la persona no está aquí, no se puede vincular. Confírmala o dala de alta y vuelve a importar." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Turno de 24 horas", id: "turno-24",
    kw: "turno 24 horas veinticuatro doble turno am pm 12 falta de personal seguido continuo",
    texto: "Un turno de 24 h (AM 12 h + PM 12 h el mismo día) solo se asigna a mano, por falta de personal; el autollenado nunca lo propone. RITMO lo marca con la alerta «¡Turno de 24 hrs!» para que quede a la vista, y también aparece así si lo traes de un Excel.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Si asignas un segundo turno continuo a la misma persona, RITMO lo avisa." },
      { frame: F, antes: () => c.gen("horario"), sel: "aside.side", opcional: true, titulo: "Alertas", texto: "Aquí aparece «¡Turno de 24 hrs!» con el día y la persona." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Horas anotadas en el Excel (ej. «Paola 16hrs»)", id: "importar-horas",
    kw: "16hrs 16 horas anotadas nota excel importar horas trabajadas ritmo turno horario creado",
    texto: "Si en una celda de tu Excel escribes el nombre con sus horas (por ejemplo «Paola 16hrs»), RITMO las toma como horas trabajadas y crea el horario «RITMO Turno 16 h» en tu tienda. Lo ves y lo puedes editar en Configuración.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El horario creado queda en la Configuración de tu tienda." },
      { frame: F, antes: () => c.gen("config"), sel: "#view-config", opcional: true, titulo: "Horarios de tu tienda", texto: "Busca «RITMO Turno … h»: lo creó la importación. Puedes renombrarlo o borrarlo." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Viático MBK por persona y solicitud con la planilla", id: "viatico-mbk",
    kw: "viatico viaticos mbk transporte semanal monto cada persona gasta solicitud automatica publicar planilla solicitado transportarse pauta real diferencia lista aviso",
    texto: "En Planilla › Datos del personal escribe el viático semanal MBK de cada agente (lo que gasta en transportarse). RITMO paga ese monto ÷ 7 por cada día que sale a las 8 pm o 10 pm. En Planilla MBK escribes la pauta semanal de la tienda y ves la pauta contra lo real, con su diferencia. Al publicar la planilla, el viático de las mismas semanas de pago se solicita solo y RITMO te avisa «Tu Planilla MBK está lista»; la tabla queda para observarla.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El viático MBK vive en el Generador." },
      { frame: F, antes: () => c.gen("planilla"), sel: '[data-pf="viatico"]', opcional: true, titulo: "Viático semanal MBK", texto: "Escribe aquí lo que cada persona gasta en transporte por semana. Se deja en blanco a quien no lo necesite." },
      { frame: F, antes: () => c.gen("mbk"), sel: "#view-mbk .panel", opcional: true, titulo: "Planilla MBK", texto: "Aquí ves a quién se paga, cuánto y por qué día. Con la planilla publicada, las semanas de pago ya quedan solicitadas." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Liquidación de la semana junto al horario", id: "liquidacion",
    kw: "liquidacion semana tabla turnos horas extra feriado he nombre total alertas a la par lado",
    texto: "A la derecha del horario (en pantallas grandes) está la tabla Liquidación semana: Nombre, Turnos, Horas, H.E. y Feriado de cada persona, con el total, como la tabla que usabas en Excel. Debajo están las alertas. Con «Ocultar liquidación y alertas» ganas espacio.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "La liquidación está junto al horario de la semana." },
      { frame: F, antes: () => c.gen("horario"), sel: "aside.side", opcional: true, titulo: "Liquidación semana", texto: "Turnos, horas, horas extra y horas en feriado de cada persona, con el total y las alertas." }] },

  /* ---------- Mi personal ---------- */
  { cat: "personal", perm: "mi_horario", accion: "Dar de alta a un colaborador", id: "alta",
    kw: "alta nuevo ingreso agregar colaborador agente persona contratar matriz base personal",
    texto: "En Matriz base toca + Dar de alta. Llena nombre, cargos, días de clase y fecha de alta. Si RRHH ya lo cargó, no lo repitas: confírmalo desde el aviso de personal de RRHH.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El personal se maneja en la Matriz base." },
      { frame: F, antes: () => c.gen("matriz"), sel: '[data-act="addag"]', opcional: true, titulo: "+ Dar de alta", texto: "Agrega a la persona y completa su cargo base y su fecha de alta. En Planilla completas la cédula." },
      { sel: "#genPers", opcional: true, titulo: "¿Ya la cargó RRHH?", texto: "Si ves este aviso, RRHH ya cargó a tu personal: revisa y confirma para no duplicar a nadie." }] },
  { cat: "personal", perm: "mi_horario", accion: "Dar de baja a alguien", id: "baja",
    kw: "baja salida renuncia despido retirar quitar terminar contrato salio se fue",
    texto: "En Matriz base escribe el último día laborado en Baja. Desde el día siguiente sale del horario. Su nombre se conserva en negrita y sin color. Si la línea es un error o un duplicado, usa × en lugar de la baja.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "La baja se registra en la Matriz base." },
      { frame: F, antes: () => c.gen("matriz"), sel: "#view-matriz table", opcional: true, titulo: "Fecha de baja", texto: "En la columna Baja escribe el último día laborado. RRHH recibirá la baja para confirmarla. Si fue un error o un duplicado, elimina la línea con ×: no queda como baja." }] },
  { cat: "personal", perm: "mi_horario", accion: "Confirmar el personal que cargó RRHH", id: "confirmar-rrhh",
    kw: "rrhh confirmar precarga personal cargado duplicado incorporar vincular recursos humanos altas",
    texto: "Cuando RRHH carga a tu personal aparece un aviso en Mi horario. Toca Revisar y confirmar: cada persona se empareja con tu lista (por cédula o por nombre) para no duplicarla.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El aviso de personal aparece arriba del horario." },
      { sel: "#genPers", opcional: true, titulo: "Revisar y confirmar", texto: "Si RRHH cargó personal, aquí toca Revisar y confirmar. Para cada persona eliges vincular, crear nueva o ✕ eliminar la línea duplicada." }] },
  { cat: "personal", perm: "mi_horario", accion: "Cambiar el color de un agente", id: "color",
    kw: "color colores paleta cambiar color agente nombre azul rosado",
    texto: "En Matriz base toca el cuadro de color de la persona y elige uno de la paleta. Los colores no se repiten.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El color se cambia en la Matriz base." },
      { frame: F, antes: () => c.gen("matriz"), sel: ".swbtn", opcional: true, titulo: "Cuadro de color", texto: "Tócalo para abrir la paleta. RITMO sugiere azules o rosados según el nombre, pero puedes elegir cualquiera libre." }] },

  /* ---------- Planilla y entrega ---------- */
  { cat: "planilla", perm: "mi_horario", accion: "Entregar la quincena", id: "entregar", leccion: "entrega",
    kw: "entregar quincena enviar planilla publicar entrega fecha limite subir respaldo",
    texto: "Trabaja en Mi horario, ve a Entregar, toca Usar lo que tengo en Mi horario, confirma que validaste todo y toca Entregar quincena. Hazlo antes de la fecha límite." },
  { cat: "planilla", perm: "mi_horario", accion: "Exportar la planilla en Excel", id: "exportar-planilla",
    kw: "exportar descargar excel planilla xlsx formato bajar",
    texto: "En Mi horario › Planilla elige el mes y la quincena y toca Descargar planilla Excel. Antes completa cédula, nombre, ingreso y salario del personal.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "La planilla se prepara dentro del Generador." },
      { frame: F, antes: () => c.gen("planilla"), sel: "#plMes", opcional: true, titulo: "Período", texto: "Elige el mes y la quincena y marca las semanas de horas extra que se pagan." },
      { frame: F, sel: '[data-act="plxlsx"]', opcional: true, titulo: "Descargar planilla Excel", texto: "Con los datos completos, este botón genera el Excel con el formato de la planilla." }] },
  { cat: "planilla", perm: "mi_horario", accion: "Pedir que reabran una quincena cerrada", id: "reapertura",
    kw: "cerrada cerrado bloqueada bloqueado reabrir reapertura candado no puedo editar fecha pago gz abrir",
    texto: "Una quincena se cierra cuando tu GZ aprueba las horas extra o pasa la fecha de entrega. Solo tu GZ puede reabrirla: en Entregar toca Solicitar reapertura y explica el motivo.",
    pasos: c => [
      { antes: () => c.ir("mia"), sel: "#miaLock", opcional: true, titulo: "Quincena cerrada", texto: "Si la quincena está cerrada, aquí aparece el aviso y el botón Solicitar reapertura. Tu GZ la aprueba o la rechaza." },
      { sel: "#miaSt", titulo: "Estado de la entrega", texto: "Aquí ves si la entrega está a tiempo, tarde o cerrada." }] },

  /* ---------- Seguimiento y alertas ---------- */
  { cat: "seguimiento", perm: "seguimiento", accion: "Ver las tiendas que no cumplen", id: "alertas",
    kw: "alertas pendientes vencidas incumplimiento avisar jefe tiendas no entregaron atrasadas cumplimiento",
    texto: "En Seguimiento, la tarjeta de alertas lista las tiendas de tu alcance que no cumplen la fecha límite. Con ✉ Avisar abres tu correo con el mensaje listo.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: "#alJ", opcional: true, titulo: "Alertas de incumplimiento", texto: "Tiendas críticas, vencidas, por vencer o con entrega tardía. Avisa con un clic y marca Ya avisé para llevar el control." },
      { sel: "#tb", titulo: "Detalle por tienda", texto: "La tabla muestra el estado de cada tienda y el personal frente al presupuesto." }] },
  { cat: "seguimiento", perm: "seguimiento", accion: "Aprobar las horas extra de una tienda", id: "aprobar-he",
    kw: "aprobar horas extra he gz bloquear planilla aprobacion visto bueno",
    texto: "Si eres el GZ de la tienda, en Seguimiento toca ✔ Aprobar HE. La planilla de esa quincena queda bloqueada; la tienda solo podrá pedirte la reapertura.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: "#tb [data-he]", opcional: true, titulo: "✔ Aprobar HE", texto: "Aparece en las tiendas que ya entregaron y cuyo GZ eres tú. Al aprobar, la planilla se bloquea." },
      { sel: "#tb", titulo: "Tiendas de tu alcance", texto: "Usa 👁 Ver para revisar el horario y la planilla antes de aprobar." }] },
  { cat: "seguimiento", perm: "seguimiento", accion: "Abrir una quincena cerrada", id: "abrir-quincena",
    kw: "abrir reabrir quincena cerrada solicitud reapertura responder gz candado",
    texto: "En Seguimiento, 🔓 Abrir quincena reabre una tienda sin esperar solicitud, y ↩ Responder solicitud contesta lo que pide la tienda. Lo que publique después cuenta a tiempo.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: "#tb [data-ab], #tb [data-reab]", opcional: true, titulo: "Abrir o responder", texto: "Estos botones aparecen en las tiendas con la quincena cerrada, solo para su GZ." },
      { sel: "#tb", titulo: "Estado de cada tienda", texto: "El 🔒 indica si está cerrada por fecha o con horas extra aprobadas." }] },
  { cat: "seguimiento", perm: "descargas", accion: "Descargar la planilla de una tienda", id: "descargar-planilla",
    kw: "descargar planilla excel asistencia tienda bajar guardar",
    texto: "En Seguimiento, ⬇ Planilla Excel genera la planilla de la tienda; ⬇ Asistencia baja la hoja firmada. El 💾 la guarda en este navegador.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: "#tb [data-xl]", opcional: true, titulo: "⬇ Planilla Excel", texto: "Un clic descarga la planilla de la tienda con las horas extra de las semanas del calendario." },
      { sel: "#tb", titulo: "Tiendas asignadas", texto: "Solo ves las tiendas que te corresponden." }] },
  { cat: "seguimiento", perm: "calendario", accion: "Publicar el calendario de planilla", id: "calendario",
    kw: "calendario fecha limite semanas horas extra publicar alerta quincena fecha entrega planilla",
    texto: "En Calendario de planilla marca las semanas de horas extra que se pagan, la fecha límite y la fecha de entrega de planilla, y toca Guardar y publicar alerta. La fecha de entrega cierra la quincena sola.",
    pasos: c => [
      { antes: () => c.ir("cal"), sel: "#calW", titulo: "Semanas de horas extra", texto: "Marca las semanas ya ejecutadas que se pagan en esta planilla." },
      { sel: "#calL", titulo: "Fecha límite", texto: "Hasta cuándo pueden entregar las tiendas sin perder el pago de horas extra." },
      { sel: "#calP", titulo: "Fecha de entrega de planilla", texto: "Pasada esta fecha la quincena se cierra y solo el GZ puede reabrirla." },
      { sel: "#calS", titulo: "Guardar y publicar", texto: "Todos los usuarios verán la alerta con la cuenta regresiva." }] },

  /* ---------- Recursos Humanos ---------- */
  { cat: "rrhh", perm: "rrhh_cargar", accion: "Cargar las altas desde Excel", id: "cargar-altas",
    kw: "cargar altas excel personal subir archivo nuevos ingresos colaboradores importar",
    texto: "En Recursos Humanos › 1 elige el Excel de altas. Se leen nombre, cédula, cargo, tienda e ingreso, sin duplicar a nadie. Revisa los totales y toca Publicar altas.",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: "#dropH", titulo: "Archivo de altas", texto: "Se lee en tu navegador; el Excel no se sube. Solo se guardan los datos necesarios." },
      { sel: "#rhPub", titulo: "Publicar altas", texto: "Revisa los totales. Las personas nuevas quedan por confirmar hasta que cada gerente las revise." }] },
  { cat: "rrhh", perm: "rrhh_cargar", accion: "Registrar una baja", id: "registrar-baja",
    kw: "registrar baja salida renuncia despido tienda omitio rrhh fecha ultimo dia",
    texto: "En Recursos Humanos › 3 busca a la persona y toca Registrar baja con el último día laborado. La tienda deberá confirmarla. Si fue un error, usa ✕ Eliminar línea.",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: "#rhBuscaB", titulo: "Buscar a la persona", texto: "Escribe nombre, cédula o tienda (mínimo 3 letras)." },
      { sel: "#rhBajaRes", titulo: "Registrar baja", texto: "Elige la fecha del último día. Queda pendiente de la confirmación de la tienda." }] },
  { cat: "rrhh", perm: "rrhh_ver", accion: "Confirmar lo que registró la tienda", id: "control-cruzado",
    kw: "control cruzado confirmar pendiente tienda alta baja disputada atrasado confirmar altas bajas",
    texto: "En Recursos Humanos › 2 ves las altas y bajas que registró la tienda (y las tuyas pendientes de ella). Confirma las de la tienda; las que llevan más de 3 días salen como atrasadas.",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: "#rhPend", titulo: "Pendientes de confirmar", texto: "Lo que registra la tienda lo confirmas tú; lo que registras tú lo confirma la tienda. Una baja disputada se mantiene o se anula." }] },
  { cat: "rrhh", perm: "rrhh_eliminar", accion: "Eliminar una línea errónea o duplicada", id: "eliminar-linea",
    kw: "eliminar borrar linea duplicada error x equis quitar registro no baja",
    texto: "Usa ✕ en la lista de personal o en los pendientes: borra el registro por completo y no queda como una baja irreal.",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: "#rhTb [data-rhx], #rhPend [data-rhx]", opcional: true, titulo: "✕ Eliminar línea", texto: "Úsalo solo para errores o duplicados. Si la persona sí se fue, registra la baja." }] },

  /* ---------- Reclutamiento ---------- */
  { cat: "reclutamiento", perm: "aperturas", accion: "Abrir una tienda nueva", id: "nueva-tienda",
    kw: "tienda nueva apertura abrir sucursal crear tienda inauguracion",
    texto: "En Reclutamiento toca + Nueva tienda: número, nombre, zona, región, correos y plazas. Puede crear las vacantes y el código será AMPM más el número. Luego crea el usuario del gerente en Administración.",
    pasos: c => [
      { antes: () => c.ir("rec"), sel: "#rcNT", titulo: "+ Nueva tienda", texto: "Crea la ficha con su presupuesto de plazas y, si quieres, las vacantes de agentes y gerente." }] },
  { cat: "reclutamiento", perm: "aperturas", accion: "Agregar un puesto nuevo", id: "nuevo-puesto",
    kw: "puesto nuevo plaza vacante agregar posicion refuerzo reemplazo cargo",
    texto: "En Reclutamiento toca + Nuevo puesto: elige tienda, cargo y cantidad. Un puesto nuevo suma una plaza al presupuesto; reemplazo y refuerzo no lo cambian.",
    pasos: c => [
      { antes: () => c.ir("rec"), sel: "#rcNP", titulo: "+ Nuevo puesto", texto: "Crea las vacantes y, si es un puesto nuevo, suma la plaza al presupuesto de la tienda." }] },
  { cat: "reclutamiento", perm: "reclutamiento", accion: "Ver o cerrar vacantes", id: "cerrar-vacante",
    kw: "vacantes vacante cerrar cubierta cancelar abiertas plazas ver",
    texto: "En Reclutamiento ves las vacantes abiertas. ✔ Cubierta la cierra; se cierra sola cuando RRHH da de alta a alguien en esa tienda con ese cargo. Cancelarla es solo del Encargado.",
    pasos: c => [
      { antes: () => c.ir("rec"), sel: "#rcTb", titulo: "Vacantes", texto: "Las más antiguas aparecen primero; las que llevan 15 días o más se marcan en rojo." }] },

  /* ---------- Administración ---------- */
  { cat: "admin", perm: "administracion", accion: "Crear un rol nuevo", id: "crear-rol",
    kw: "crear rol nuevo permisos modulos acceso perfil",
    texto: "En Administración › Roles y permisos toca + Nuevo rol, escribe el nombre y marca los módulos que verá. Después asígnalo a los usuarios.",
    pasos: c => [
      { antes: () => c.ir("adm"), sel: "#rlNew", titulo: "+ Nuevo rol", texto: "Marca los módulos que verá. También puedes duplicar un rol existente y ajustarlo." },
      { sel: "#rlTb", titulo: "Todos los roles", texto: "Aquí ves cada rol, sus módulos y cuántos usuarios lo tienen." }] },
  { cat: "admin", perm: "administracion", accion: "Cambiar el rol de un usuario", id: "asignar-rol",
    kw: "asignar cambiar rol usuario permisos acceso persona",
    texto: "En Administración › Usuarios busca a la persona y toca Cambiar rol. Tendrá los módulos del nuevo rol la próxima vez que inicie sesión.",
    pasos: c => [
      { antes: () => c.ir("adm"), sel: "#usTb", titulo: "Usuarios", texto: "Busca a la persona y toca Cambiar rol." }] },
  { cat: "admin", perm: "administracion", accion: "Crear un usuario nuevo", id: "nuevo-usuario",
    kw: "usuario nuevo crear persona correo acceso gerente cuenta",
    texto: "En Administración › Usuarios toca + Nuevo usuario. Luego usa Crear accesos para enviarle el enlace donde define su contraseña.",
    pasos: c => [
      { antes: () => c.ir("adm"), sel: "#usNew", titulo: "+ Nuevo usuario", texto: "Crea la ficha con su rol. Si es gerente de tienda, elige su tienda." },
      { sel: "#acc", opcional: true, titulo: "Crear accesos", texto: "Envía el enlace para que defina su contraseña." }] },
  { cat: "admin", perm: "administracion", accion: "Importar roles y presupuesto", id: "importar",
    kw: "importar roles tiendas usuarios excel presupuesto plazas cargar archivo",
    texto: "Roles: Administración › 1 con el Excel de roles. Presupuesto: Administración › 3 con el Excel de presupuesto de plazas. Después crea los accesos.",
    pasos: c => [
      { antes: () => c.ir("adm"), sel: "#dropX", titulo: "Importar roles", texto: "Tiendas y usuarios desde el Excel de roles." },
      { sel: "#dropP", titulo: "Presupuesto de plazas", texto: "Las plazas presupuestadas por tienda, sin contar gerente." }] },

  /* ---------- Mi cuenta y ayuda ---------- */
  { cat: "cuenta", perm: "todos", accion: "Cambiar mi contraseña", id: "contrasena",
    kw: "contrasena clave password cambiar olvide seguridad 60 dias llave",
    texto: "Toca el botón 🔑 arriba. RITMO te pide cambiarla cada 60 días y te avisa 7 días antes. Si la olvidaste, usa ¿Olvidaste tu contraseña? en la pantalla de inicio.",
    pasos: c => [{ sel: "#pwB", titulo: "Cambiar contraseña", texto: "Desde aquí la cambias cuando quieras." }] },
  { cat: "cuenta", perm: "todos", accion: "Usar RITMO en el celular", id: "celular",
    kw: "celular telefono movil girar pantalla horizontal vertical rotar completa tablet",
    texto: "En el teléfono, Mi horario se abre a pantalla completa. En vertical verás un aviso para girar el teléfono y ver los 7 días completos; es solo una sugerencia, puedes tocar «Entendido» y seguir. El botón ⌂ Panel te devuelve al panel para entregar la quincena. En una computadora o tableta grande se ve todo junto.",
    pasos: c => [{ sel: "#tabs", titulo: "Módulos", texto: "Desde aquí entras a Mi horario; en el teléfono se abre a pantalla completa." }] },
  { cat: "cuenta", perm: "todos", accion: "Ver los tutoriales de mi rol", id: "tutoriales",
    kw: "tutorial tutoriales recorrido guia aprender ayuda curso como se usa",
    texto: "La pestaña Tutoriales tiene los recorridos de tu rol, con voz opcional. El botón ❓ de arriba te lleva allí.",
    pasos: c => [
      { sel: "#tutB", titulo: "Ayuda", texto: "Este botón abre los tutoriales." },
      { antes: () => c.ir("tut"), sel: "#tutL", titulo: "Tus recorridos", texto: "Cada lección te guía paso a paso en la pantalla." }] },
  { cat: "cuenta", perm: "todos", accion: "¿Qué significa el candado 🔒?", id: "candados",
    kw: "candado cerrado bloqueada bloqueo significa que es horas aprobadas fecha pago",
    texto: "🔒 HE aprobadas: tu GZ aprobó las horas extra y la planilla quedó bloqueada. 🔒 Cerrada por fecha: pasó la fecha de entrega de planilla. En ambos casos solo el GZ puede reabrir; pídele la reapertura en Entregar." }
];

/* ---------- Búsqueda por palabras clave (sin IA) ---------- */
const sinTildes = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const PARADAS = new Set("como que cual donde cuando para por con sin una uno los las del que hago hacer puedo quiero necesito saber ayuda favor esta este esto mis".split(" "));
export function buscar(consulta, visibles) {
  const toks = sinTildes(consulta).replace(/[^a-z0-9ñ ]/g, " ").split(/\s+/).filter(t => t.length > 2 && !PARADAS.has(t));
  if (!toks.length) return [];
  return visibles.map(e => {
    const kw = sinTildes(e.kw), ti = sinTildes(e.accion), tx = sinTildes(e.texto);
    let p = 0;
    for (const t of toks) {
      if (kw.split(" ").some(w => w === t)) p += 4; else if (kw.includes(t)) p += 3;
      if (ti.includes(t)) p += 2;
      if (tx.includes(t)) p += 1;
    }
    return { e, p };
  }).filter(x => x.p > 0).sort((a, b) => b.p - a.p).slice(0, 3).map(x => x.e);
}

/* ---------- Interfaz ---------- */
const CSS = `
.as-btn{position:fixed;right:16px;bottom:16px;z-index:9960;display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:11px 16px;background:#04003f;color:#fff;font:600 14px "IBM Plex Sans","Segoe UI",Arial,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(4,0,63,.4)}
.as-btn:hover,.as-btn:focus-visible{outline:3px solid #ff8300;outline-offset:2px}
.as-btn i{width:9px;height:9px;border-radius:50%;background:#22c55e}.as-btn.off i{background:#9aa6bd}
.as-pan{position:fixed;right:16px;bottom:72px;z-index:9961;width:min(370px,calc(100vw - 24px));max-height:min(560px,calc(100vh - 100px));display:flex;flex-direction:column;background:#fff;color:#0f1e36;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.4);overflow:hidden;font-family:"IBM Plex Sans","Segoe UI",Arial,sans-serif;animation:asEntra .22s ease both}
@keyframes asEntra{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.as-top{display:flex;align-items:center;gap:8px;padding:12px 14px;background:#04003f;color:#fff}
.as-top b{font-size:15px}.as-est{margin-left:auto;font-size:11.5px;font-weight:600;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.14)}
.as-est.off{background:#fff2d6;color:#8a5200}
.as-x{border:0;background:transparent;color:#fff;font-size:18px;cursor:pointer;border-radius:8px;width:30px;height:30px}
.as-x:hover,.as-x:focus-visible{background:rgba(255,255,255,.18);outline:2px solid #ff8300}
.as-msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:150px}
.as-m{max-width:92%;padding:9px 12px;border-radius:12px;font-size:14px;line-height:1.5;background:#eef2f8}
.as-m.yo{align-self:flex-end;background:#ffe3c2}
.as-ops{display:flex;flex-direction:column;gap:7px}
.as-op{text-align:left;border:1px solid #d6ddea;background:#fff;color:#04003f;border-radius:10px;padding:9px 12px;font:600 13.5px "IBM Plex Sans","Segoe UI",Arial,sans-serif;cursor:pointer}
.as-op:hover,.as-op:focus-visible{border-color:#ff8300;background:#fff8f0;outline:2px solid #ff8300;outline-offset:1px}
.as-op.pri{background:#ff8300;border-color:#ff8300;color:#1b0e00}
.as-op.sec{border-style:dashed;color:#56678a;font-weight:500}
.as-pie{display:flex;gap:6px;padding:10px 12px;border-top:1px solid #e3e8f2}
.as-pie input{flex:1;min-width:0;border:1px solid #d6ddea;border-radius:10px;padding:9px 11px;font:14px "IBM Plex Sans","Segoe UI",Arial,sans-serif;color:#0f1e36}
.as-pie input:focus{outline:2px solid #ff8300;outline-offset:1px}
.as-pie button{border:0;border-radius:10px;background:#04003f;color:#fff;padding:0 14px;font-size:15px;cursor:pointer}
.as-nota{padding:0 14px 8px;font-size:11.5px;color:#56678a}
@media (prefers-reduced-motion:reduce){.as-pan{animation:none}}
@media (max-width:520px){.as-btn span{display:none}.as-btn{padding:12px}}
`;
const el = (t, c, h) => { const x = document.createElement(t); if (c) x.className = c; if (h !== undefined) x.innerHTML = h; return x; };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * opts: {
 *   nombre(): primer nombre del usuario, puede(permiso): bool,
 *   ctx: { ir(tab), gen(tab) }, iniciarTour(pasos), lanzarLeccion(id), abrirTutoriales()
 * }
 */
export function iniciarAsistente(opts) {
  if (!document.getElementById("as-css")) { const s = el("style"); s.id = "as-css"; s.textContent = CSS; document.head.appendChild(s); }
  const visibles = () => AYUDA.filter(e => e.perm === "todos" || opts.puede(e.perm));
  const enLinea = () => navigator.onLine !== false;

  const btn = el("button", "as-btn", `<i></i><span>Ayuda</span>`);
  btn.type = "button"; btn.setAttribute("aria-haspopup", "dialog"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Abrir el asistente de ayuda");
  const pan = el("div", "as-pan"); pan.setAttribute("role", "dialog"); pan.setAttribute("aria-label", "Asistente de ayuda de RITMO"); pan.hidden = true;
  pan.innerHTML = `<div class="as-top"><b>Asistente RITMO</b><span class="as-est"></span><button class="as-x" type="button" aria-label="Cerrar el asistente">✕</button></div>
    <div class="as-msgs" aria-live="polite"></div>
    <div class="as-nota"></div>
    <form class="as-pie"><input type="text" placeholder="Escribe tu duda (ej. cómo registro una baja)" aria-label="Escribe tu duda" autocomplete="off"><button type="submit" aria-label="Buscar">➤</button></form>`;
  document.body.append(btn, pan);
  const msgs = pan.querySelector(".as-msgs"), est = pan.querySelector(".as-est"), nota = pan.querySelector(".as-nota"), inp = pan.querySelector("input");

  function estado() {
    const on = enLinea();
    btn.classList.toggle("off", !on);
    est.className = "as-est" + (on ? "" : " off"); est.textContent = on ? "En línea" : "Sin conexión";
    nota.textContent = on ? "Búsqueda por palabras clave. La IA conversacional llegará más adelante."
      : "Sin conexión: las guías guardadas en este navegador funcionan igual. Los datos de RITMO necesitan internet.";
  }
  addEventListener("online", estado); addEventListener("offline", estado);

  const baja = () => { msgs.scrollTop = msgs.scrollHeight; };
  const msg = (h, yo) => { const m = el("div", "as-m" + (yo ? " yo" : ""), h); msgs.appendChild(m); baja(); return m; };
  const ops = lista => { // lista: [{t, cls, fn}]
    const w = el("div", "as-ops");
    lista.forEach(o => { const b = el("button", "as-op " + (o.cls || ""), esc(o.t)); b.type = "button"; b.addEventListener("click", () => { w.querySelectorAll("button").forEach(x => x.disabled = true); o.fn(); }); w.appendChild(b); });
    msgs.appendChild(w); baja(); const p = w.querySelector("button"); if (p) p.focus({ preventScroll: true }); return w;
  };

  // Nivel 1
  function inicio(saludar = true) {
    if (saludar) { msgs.innerHTML = ""; const n = opts.nombre(); msg(`¡Hola${n ? ", " + esc(n) : ""}! 👋 ¿En qué te ayudo hoy?`); }
    const cats = CATEGORIAS.filter(c => visibles().some(e => e.cat === c.id));
    ops(cats.map(c => ({ t: `${c.i} ${c.t}`, fn: () => { msg(esc(c.t), true); nivel2(c); } })));
  }
  // Nivel 2
  function nivel2(c) {
    msg("¿Qué quieres hacer?");
    const l = visibles().filter(e => e.cat === c.id).map(e => ({ t: e.accion, fn: () => { msg(esc(e.accion), true); nivel3(e); } }));
    l.push({ t: "← Volver al inicio", cls: "sec", fn: () => inicio(false) });
    ops(l);
  }
  // Nivel 3: respuesta corta + acción
  function nivel3(e) {
    msg(esc(e.texto));
    const l = [];
    if (e.pasos || e.leccion) l.push({ t: "🚀 Iniciar recorrido visual", cls: "pri", fn: () => lanzar(e) });
    l.push({ t: "← Otras dudas", cls: "sec", fn: () => inicio(false) });
    l.push({ t: "Ver todos los tutoriales", cls: "sec", fn: () => { cerrar(); opts.abrirTutoriales(); } });
    ops(l);
  }
  function lanzar(e) {
    cerrar();
    // el recorrido se ejecuta en la pantalla actual: el chat se minimiza y el resto de la pantalla se oscurece
    setTimeout(() => { if (e.leccion) opts.lanzarLeccion(e.leccion); else opts.iniciarTour(e.pasos(opts.ctx)); }, 200);
  }

  // Búsqueda
  function consultar(q) {
    const t = q.trim(); if (!t) return;
    msg(esc(t), true);
    const r = buscar(t, visibles());
    if (!r.length) { msg("No encontré eso. Prueba con otras palabras (por ejemplo: <i>baja, horas extra, planilla, contraseña</i>) o elige una categoría."); inicio(false); return; }
    msg(r.length === 1 ? "Creo que buscas esto:" : "Esto puede ayudarte:");
    ops([...r.map(e => ({ t: e.accion, fn: () => { msg(esc(e.accion), true); nivel3(e); } })), { t: "← Ver categorías", cls: "sec", fn: () => inicio(false) }]);
  }
  pan.querySelector("form").addEventListener("submit", ev => { ev.preventDefault(); const v = inp.value; inp.value = ""; consultar(v); });

  function abrir() { pan.hidden = false; btn.setAttribute("aria-expanded", "true"); estado(); if (!msgs.children.length) inicio(); inp.focus({ preventScroll: true }); }
  function cerrar() { pan.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", () => (pan.hidden ? abrir() : cerrar()));
  pan.querySelector(".as-x").addEventListener("click", () => { cerrar(); btn.focus(); });
  pan.addEventListener("keydown", ev => { if (ev.key === "Escape") { ev.stopPropagation(); cerrar(); btn.focus(); } });
  estado();

  return { refrescar() { msgs.innerHTML = ""; if (!pan.hidden) inicio(); estado(); }, abrir, cerrar, consultar };
}
