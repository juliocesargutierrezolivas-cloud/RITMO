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
  { cat: "horarios", perm: "mi_horario", accion: "Cambiar la hora de entrada o salida de un turno", id: "config-horarios",
    kw: "configuracion plantillas turno horario entrada salida horas cambiar hora am pm 12 8 jornada confirmado por confirmar puesto",
    texto: "En Mi horario › Configuración, la tabla Plantillas de turno tiene una fila por horario (AM 12 h, PM 12 h, AM 8 h, PM 8 h, MBK 12 h, Admin 8 h). Cambia la entrada, la salida y las horas, marca en qué puestos se usa y activa Confirmado. Se aplica a las semanas nuevas y a Autollenar.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los horarios de turno se ajustan en la pestaña Configuración." },
      { frame: F, antes: () => c.gen("config"), sel: "#view-config table.formtable", opcional: true, titulo: "Plantillas de turno", texto: "Cambia entrada, salida y horas de cada horario. En Puesto marcas dónde se puede usar." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Crear un horario nuevo (ej. 7:00 a 3:00)", id: "horario-nuevo",
    kw: "crear nuevo horario anexar otro horario personalizado turno propio 7 3 refuerzo administrativo agregar plantilla",
    texto: "En Configuración toca «+ Anexar otro horario», ponle nombre, banda, puestos, entrada y salida. Después úsalo con «+ Refuerzo», «+ Turno MBK», «+ Administrativo» o cambiando el horario de una fila. Los creados por la importación de Excel («RITMO Turno 16 h») también se editan o borran aquí.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los horarios propios se crean en Configuración." },
      { frame: F, antes: () => c.gen("config"), sel: '#view-config [data-act="addpl"]', opcional: true, titulo: "+ Anexar otro horario", texto: "Crea el horario y luego úsalo en cualquier bloque del Horario." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Presupuesto de agentes y tope semanal", id: "presupuesto-tope",
    kw: "presupuesto agentes plantilla autorizada tope semanal 48 horas extra vacante falta agente gerente no cuenta",
    texto: "En Configuración escribe el presupuesto de agentes de tu sucursal (sin contar al gerente de tienda): cada agente que falte autoriza 48 h extra en la semana. El tope semanal (48 h por defecto) marca desde dónde todo es hora extra con pago doble.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Estas reglas están en Configuración." },
      { frame: F, antes: () => c.gen("config"), sel: "#view-config #pres", opcional: true, titulo: "Presupuesto de agentes", texto: "Cuántos agentes autoriza tu sucursal." },
      { frame: F, sel: "#view-config #tope", opcional: true, titulo: "Tope semanal", texto: "Horas a partir de las cuales todo es extra." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Días del MBK de 12 horas", id: "mbk-12",
    kw: "mbk 12 horas dias libres equipo mbk 8 am 8 pm configurar dia sabado viernes",
    texto: "En Configuración, «Días del MBK de 12 h» marca los días en que el MBK trabaja de 8:00 am a 8:00 pm para dar libres al equipo MBK. Esos días no hay MBK de 8 h. Se aplica a semanas nuevas y a Autollenar.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los días del MBK de 12 h se eligen en Configuración." },
      { frame: F, antes: () => c.gen("config"), sel: "#view-config .dayck", opcional: true, titulo: "Días del MBK de 12 h", texto: "Marca los días en que el MBK trabaja de 8:00 am a 8:00 pm." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Agregar la festividad local de mi sucursal", id: "festividad",
    kw: "festividad local fiesta patronal feriado sucursal dia doble pago agregar fecha",
    texto: "En Configuración, debajo de los feriados del año, toca «+ Agregar festividad local», escribe el nombre y la fecha (dd/mm). Quien trabaje ese día cobra pago doble, igual que un feriado nacional.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Las festividades se agregan en Configuración." },
      { frame: F, antes: () => c.gen("config"), sel: '#view-config [data-act="addfi"]', opcional: true, titulo: "+ Agregar festividad local", texto: "Escribe el nombre y la fecha (día/mes)." }] },
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
    kw: "viatico viaticos mbk transporte semanal monto cada persona gasta solicitud automatica publicar planilla solicitado transportarse presupuesto real diferencia lista aviso por dia cambio monto cambio actualizar aprobado volver a aprobar",
    texto: "En Planilla › Datos del personal escribe el viático por día MBK de cada agente (lo que se le paga por cada día que sale a las 8 pm o 10 pm, por ejemplo C$ 50). RITMO lo multiplica por sus días con salida. En Planilla MBK escribes el presupuesto semanal de la tienda y ves el presupuesto contra lo real, con su diferencia. Al publicar la planilla, el viático de las mismas semanas de pago se solicita solo y RITMO te avisa «Tu Planilla MBK está lista»; la tabla queda para observarla. Si después cambias un viático o el horario, el monto solicitado se actualiza solo en cada guardado; si tu GZ ya había aprobado otro monto, verá el aviso para aprobar de nuevo.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El viático MBK vive en el Generador." },
      { frame: F, antes: () => c.gen("planilla"), sel: '[data-pf="viatico"]', opcional: true, titulo: "Viático por día MBK", texto: "Escribe aquí lo que se le paga a cada persona por cada día con salida de 8 pm o 10 pm. Se deja en blanco a quien no lo necesite." },
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
    texto: "🔒 HE aprobadas: tu GZ aprobó las horas extra y la planilla quedó bloqueada. 🔒 Cerrada por fecha: pasó la fecha de entrega de planilla. En ambos casos solo el GZ puede reabrir; pídele la reapertura en Entregar." },

  /* ---------- Más ayudas del Editor: horario ---------- */
  { cat: "horarios", perm: "mi_horario", accion: "Agregar un turno de día o de noche (+ Turno)", id: "turno-nuevo",
    kw: "agregar turno nuevo horario dia noche am pm crear horario plantilla mas turno boton",
    texto: "En Horario, cada bloque (Compras, Horario de MBK y Turno Operativo Principal) tiene su botón «+ Turno», junto a Turno · Caja. Si el bloque tiene varios puestos, primero eliges el puesto; después eliges si es de día (AM) o de noche (PM) y el horario de la lista. Si no aparece, lo creas ahí mismo con su entrada y salida: queda guardado en Configuración y lo usas en todas las semanas.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El botón está en el encabezado de cada bloque." },
      { frame: F, antes: () => c.gen("horario"), sel: ".tnbtn", opcional: true, titulo: "+ Turno", texto: "Elige AM o PM, el horario y agrégalo." }] },
  { cat: "planilla", perm: "mi_horario", accion: "Pedir abrir una quincena que no está pagada", id: "solicitar-periodo",
    kw: "solicitar abrir periodo quincena no pagada cerrada cambio ultima hora pedir apertura gz aprobar pagada",
    texto: "En el botón «Información y solicitudes» tocas «Solicitar abrir un periodo», eliges la quincena y escribes el motivo. Tu GZ lo aprueba o lo rechaza; si lo aprueba, la quincena queda abierta para importar, cambiar y publicar.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#infoBtn', opcional: true, titulo: "Información y solicitudes", texto: "Desde aquí pides la solicitud y ves el estado de las que hiciste." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Duplicar la semana anterior", id: "duplicar-semana",
    kw: "duplicar copiar semana anterior repetir mismo horario partir de",
    texto: "En Horario toca «Duplicar semana anterior»: copia los turnos de la semana pasada a la que estás viendo, y desde ahí ajustas lo que cambió. Respeta las novedades y las altas y bajas de esta semana.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Colócate en la semana que quieres llenar." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="dup"]', opcional: true, titulo: "Duplicar semana anterior", texto: "Copia la semana anterior a esta. Luego mueve o quita lo que haga falta." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Limpiar una semana", id: "limpiar-semana",
    kw: "limpiar borrar vaciar semana empezar de nuevo quitar todos los turnos",
    texto: "En Horario toca «Limpiar» para vaciar todos los turnos de la semana que ves. Si te equivocas, «Deshacer» (o Ctrl+Z) lo revierte. Una semana cerrada no se puede limpiar.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Limpiar actúa solo sobre la semana que estás viendo." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="limpiar"]', opcional: true, titulo: "Limpiar", texto: "Vacía los turnos de esta semana. Después puedes usar Autollenar o importar desde Excel." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Deshacer un cambio", id: "deshacer",
    kw: "deshacer revertir error equivocado ctrl z volver atras ultimo cambio",
    texto: "El botón «Deshacer» (o Ctrl+Z) revierte tus últimos 3 movimientos en el horario: mover, intercambiar, quitar, Autollenar o importar. El número entre paréntesis dice cuántos puedes deshacer.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Deshacer está en la barra de acciones del Horario." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="undo"]', opcional: true, titulo: "Deshacer", texto: "Revierte el último cambio. Puedes repetirlo hasta 3 veces." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Enviar el horario por WhatsApp a cada persona", id: "mensaje-persona",
    kw: "whatsapp mensaje por persona enviar compartir horario cada colaborador copiar mensaje texto",
    texto: "En Horario toca «Mensaje por persona»: arma un mensaje con los turnos de cada colaborador. Con «Copiar mensaje» lo copias y lo pegas en WhatsApp.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los mensajes salen del horario de la semana." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="wa"]', opcional: true, titulo: "Mensaje por persona", texto: "Elige a la persona y copia su mensaje." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Copiar la imagen del horario", id: "copiar-imagen",
    kw: "imagen foto copiar horario compartir pegar whatsapp captura tabla",
    texto: "En Horario toca «Copiar imagen»: copia una imagen de la tabla de la semana, con el nombre de tu tienda, lista para pegarla en WhatsApp o en un correo.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "La imagen es de la semana que estás viendo." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="img"]', opcional: true, titulo: "Copiar imagen", texto: "Copia la tabla del horario como imagen." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Exportar el horario a Excel", id: "exportar-horario",
    kw: "exportar excel horario descargar xlsx tabla semana liquidacion alertas hoja",
    texto: "En Horario toca «Exportar Excel»: baja un archivo con tres hojas: Horario, Liquidación y Alertas de la semana. Es la misma tabla que luego puedes volver a importar.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Se exporta la semana que estás viendo." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="xlsx"]', opcional: true, titulo: "Exportar Excel", texto: "Descarga el horario, la liquidación y las alertas." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Desactivar una posición un día", id: "posicion-desactivar",
    kw: "desactivar posicion dia no aplica activar puesto cerrado no hay turno ese dia celda",
    texto: "Si un puesto no se cubre un día (por ejemplo, un administrativo en domingo), toca la celda y elige «No aplica este día». Para volver a usarla, elige «Activar esta posición». Las posiciones desactivadas no cuentan como vacías.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Las posiciones se desactivan en la tabla del horario." },
      { frame: F, antes: () => c.gen("horario"), sel: ".board", opcional: true, titulo: "Toca la celda", texto: "En el menú de la celda verás «No aplica este día» y «Activar esta posición»." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Agregar refuerzos, turno MBK o administrativo", id: "refuerzos",
    kw: "refuerzo agregar fila turno extra mbk administrativo induccion anexar puesto posicion mas personal",
    texto: "En cada bloque del Horario hay botones para sumar filas: «+ Refuerzo» (una persona más en Compras), «+ Turno MBK», «+ Administrativo» e «+ Inducción». Cada fila usa un horario de Configuración, que puedes cambiar desde la misma fila.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Las filas extra se agregan en el bloque donde las necesitas." },
      { frame: F, antes: () => c.gen("horario"), sel: ".blk .panel-h", opcional: true, titulo: "Botones del bloque", texto: "Arriba a la derecha de cada bloque están «+ Refuerzo», «+ Inducción» y los demás." }] },
  { cat: "horarios", perm: "mi_horario", accion: "Autollenar: generar base o solo llenar vacíos", id: "autollenar-opciones",
    kw: "autollenar generar horario base solo llenar vacios presupuesto horas extra opciones automatico",
    texto: "⚡ Autollenar te pide el presupuesto y si permites horas extra. «Generar horario base» arma la semana desde cero; «Solo llenar vacíos» respeta lo que ya pusiste y completa lo que falta. Siempre respeta la ley y las reglas de tu tienda y te dice qué no pudo cubrir.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Autollenar trabaja sobre la semana que ves." },
      { frame: F, antes: () => c.gen("horario"), sel: '[data-act="auto"]', opcional: true, titulo: "⚡ Autollenar", texto: "Elige entre generar el horario base o solo llenar vacíos." }] },

  /* ---------- Más ayudas del Editor: personal ---------- */
  { cat: "personal", perm: "mi_horario", accion: "Cargos por prioridad (Cargo 1, 2 y 3)", id: "cargos-prioridad",
    kw: "cargo cargos prioridad cargo 1 base cargo 2 cargo 3 cubrir puesto agente mbk gerente conserje seguridad matriz",
    texto: "En Matriz base, el Cargo 1 es el puesto base de la persona; los Cargos 2 y 3 son lo que también puede cubrir. Autollenar la asigna primero a su cargo base y, si hace falta, usa sus otros cargos. Una persona no puede ir en un puesto que su cargo no cubre.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los cargos se definen en la Matriz base." },
      { frame: F, antes: () => c.gen("matriz"), sel: '#view-matriz [data-f="cargo0"]', opcional: true, titulo: "Cargos por prioridad", texto: "Cargo 1 es el base; Cargos 2 y 3, lo que también cubre." }] },
  { cat: "personal", perm: "mi_horario", accion: "Marcar los días de clase de un estudiante", id: "dias-clase",
    kw: "estudia estudiante clase dias de clase universidad turno pm noche vispera estudios matriz",
    texto: "En Matriz base, marca los días de clase de quien estudia (L, M, X, J, V, S, D). Ese día solo puede trabajar turno PM y no amanece la víspera. En el horario se ve con la marca «CLASE».",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los días de clase están en la Matriz base." },
      { frame: F, antes: () => c.gen("matriz"), sel: "#view-matriz .dayck", opcional: true, titulo: "Días de clase", texto: "Marca las letras de los días en que estudia la persona." }] },
  { cat: "personal", perm: "mi_horario", accion: "Marcar a alguien como nuevo ingreso (Inducción)", id: "nuevo-ingreso",
    kw: "nuevo ingreso induccion capacitacion nuevo colaborador recien ingreso puesto induccion marcar",
    texto: "En Matriz base marca «Nuevo ingreso» a quien está en inducción. Solo ellos pueden ir en el puesto de Inducción; si no hay nuevos ingresos, ese puesto aparece como «sin nuevos ingresos». RRHH lo marca solo a quien ingresó hace menos de 14 días.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El nuevo ingreso se marca en la Matriz base." },
      { frame: F, antes: () => c.gen("matriz"), sel: '#view-matriz [data-f="nuevo"]', opcional: true, titulo: "Nuevo ingreso", texto: "Marca la casilla de quien está en inducción." }] },
  { cat: "personal", perm: "mi_horario", accion: "Empezar una tienda desde cero (Base cero)", id: "base-cero",
    kw: "base cero borrar todo empezar nueva tienda reiniciar matriz vaciar datos peligro",
    texto: "«Base cero» (en Matriz base o Configuración) borra tu matriz, horarios y configuración para empezar una tienda nueva. Pide confirmación. Antes de usarla, baja un respaldo en Configuración › Descargar respaldo.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Base cero está en Matriz base y en Configuración." },
      { frame: F, antes: () => c.gen("config"), sel: '[data-act="backup"]', opcional: true, titulo: "Primero un respaldo", texto: "Descarga un respaldo antes de borrar nada." }] },
  { cat: "personal", perm: "mi_horario", accion: "Descargar y restaurar un respaldo", id: "respaldo",
    kw: "respaldo backup restaurar descargar guardar copia seguridad archivo json otra computadora version nueva",
    texto: "En Configuración, «Descargar respaldo» guarda tu matriz, configuración e historial en un archivo; «Restaurar respaldo» los carga de nuevo, incluso en otra computadora. Como todo se guarda en RITMO, el respaldo es una copia extra de seguridad.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El respaldo está en Configuración." },
      { frame: F, antes: () => c.gen("config"), sel: '[data-act="backup"]', opcional: true, titulo: "Descargar respaldo", texto: "Baja el archivo con tus datos." }] },
  { cat: "personal", perm: "mi_horario", accion: "Ver el historial de semanas", id: "historial",
    kw: "historial semanas guardadas versiones cambios anteriores ver semana pasada eliminar semana cronologico",
    texto: "En la pestaña Historial ves, en orden cronológico, todas las semanas guardadas. Desde ahí puedes abrir una semana pasada. Cada cambio se guarda solo; no tienes que guardar nada.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El historial es una pestaña del Generador." },
      { frame: F, antes: () => c.gen("historial"), sel: "#view-historial", opcional: true, titulo: "Historial", texto: "Las semanas guardadas, de la más antigua a la más reciente." }] },

  /* ---------- Más ayudas del Editor: planilla ---------- */
  { cat: "planilla", perm: "mi_horario", accion: "Elegir la quincena de la planilla", id: "planilla-quincena",
    kw: "quincena mes periodo planilla elegir primera segunda 1ra 2da personalizada fecha cambiar periodo",
    texto: "En Planilla elige el mes y la quincena (1ra: del 1 al 15; 2da: del 16 al fin de mes) o un período personalizado con fechas. El panel ya te la deja en la quincena actual.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "La planilla es una pestaña del Generador." },
      { frame: F, antes: () => c.gen("planilla"), sel: "#plMes", opcional: true, titulo: "Mes y quincena", texto: "Elige el período de la planilla." }] },
  { cat: "planilla", perm: "mi_horario", accion: "Marcar las semanas de horas extra a pagar", id: "semanas-he",
    kw: "semanas horas extra pagar marcar pagadas bloqueada seleccion calendario doble pago semana cumplida",
    texto: "En Planilla, «Semanas de horas extra a pagar» lista las semanas cumplidas. Marca las que pagas en esta planilla. Una semana ya pagada en otra planilla queda bloqueada para no pagarla dos veces. Antes de pagar, ajusta en Horario lo que realmente se trabajó.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Las semanas de pago se marcan en la Planilla." },
      { frame: F, antes: () => c.gen("planilla"), sel: "#view-planilla [data-hesem]", opcional: true, titulo: "Semanas de horas extra", texto: "Marca la casilla de cada semana que se paga." }] },
  { cat: "planilla", perm: "mi_horario", accion: "Completar la cédula, el nombre y el salario en la planilla", id: "datos-planilla",
    kw: "datos personal planilla cedula nombre apellido salario ingreso cargo falta completar rrhh viatico",
    texto: "En Planilla › Datos del personal están la cédula, el nombre, el cargo, el ingreso, el salario y el viático MBK de cada persona. Cédula, nombre, cargo e ingreso ya vienen de RRHH al confirmar; normalmente solo escribes el salario. Un aviso te dice exactamente qué falta de cada persona.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Los datos del personal están en la Planilla." },
      { frame: F, antes: () => c.gen("planilla"), sel: '#view-planilla [data-pf="salario"]', opcional: true, titulo: "Salario", texto: "Escribe el salario mensual de cada persona." }] },
  { cat: "planilla", perm: "mi_horario", accion: "Agregar una nota a una persona en la planilla", id: "nota-planilla",
    kw: "nota adicional comentario planilla persona cubriendo otra tienda observacion escribir",
    texto: "En la tabla de la planilla, la columna «Nota adicional» te deja escribir una nota por persona (por ejemplo «cubriendo otra tienda»). Se une a los comentarios automáticos (horas extra, ingreso, baja) y sale en el Excel.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Las notas se escriben en la Planilla." },
      { frame: F, antes: () => c.gen("planilla"), sel: "#view-planilla [data-plnota]", opcional: true, titulo: "Nota adicional", texto: "Escribe aquí la nota de esa persona." }] },
  { cat: "planilla", perm: "mi_horario", accion: "Cambiar las reglas de pago (vacaciones, subsidio, séptimo día)", id: "reglas-planilla",
    kw: "reglas pago porcentaje vacaciones subsidio extraordinario septimo dia horas feriado dias quincena empresa descuento ausencia",
    texto: "Al final de Planilla puedes cambiar las horas por feriado trabajado, los días por quincena, el porcentaje que paga la empresa en vacaciones, subsidio y extraordinario, y si se descuenta el séptimo día por ausencia. Vienen con los valores de ley; cámbialos solo si tu empresa lo indica.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Las reglas de pago están al final de la Planilla." },
      { frame: F, antes: () => c.gen("planilla"), sel: "#plHF", opcional: true, titulo: "Reglas de pago", texto: "Horas por feriado, días por quincena y porcentajes." }] },
  { cat: "planilla", perm: "mi_horario", accion: "Publicar la planilla", id: "publicar-planilla",
    kw: "publicar planilla boton gris color entregar diferencia publicada cambios republicar",
    texto: "«Publicar planilla» (en la pestaña Planilla) entrega la planilla del Generador a RITMO. El botón queda en gris cuando está publicada y vuelve a color si haces cambios, para que la publiques de nuevo. Al publicar, tu viático MBK se solicita solo y RITMO te avisa que tu Planilla MBK está lista. «Entregar quincena» (en Entregar) completa la entrega con la hoja de asistencia y la validación.",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Primero se publica la planilla desde el Generador." },
      { frame: F, antes: () => c.gen("planilla"), sel: '[data-act="publicar"]', opcional: true, titulo: "Publicar planilla", texto: "Publica la planilla a RITMO." }] },
  { cat: "planilla", perm: "mi_horario", accion: "Copiar la imagen o el mensaje de la solicitud MBK", id: "solicitud-mbk-imagen",
    kw: "mbk solicitud imagen whatsapp mensaje detalle descargar excel transporte copiar viatico compartir firma recibido",
    texto: "En Planilla MBK hay cuatro botones: «Mensaje WhatsApp» (la solicitud en texto), «Copiar imagen de solicitud» (resumen para quien aprueba), «Copiar imagen del detalle» (a quién se paga y cuánto, con firma de recibido) y «Descargar Excel».",
    pasos: c => [
      { antes: () => c.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "La solicitud MBK sale de la Planilla MBK." },
      { frame: F, antes: () => c.gen("mbk"), sel: '[data-act="vtimgS"]', opcional: true, titulo: "Imagen de solicitud", texto: "Copia el resumen de la solicitud." },
      { frame: F, sel: '[data-act="vtimgD"]', opcional: true, titulo: "Imagen del detalle", texto: "Copia el detalle por persona, con firma de recibido." }] },

  /* ---------- Seguimiento ---------- */
  { cat: "seguimiento", perm: "seguimiento", accion: "Qué significa el semáforo de cada tienda", id: "semaforo",
    kw: "semaforo verde ambar rojo gris planilla horas extra mbk plazas tienda significado colores indicador",
    texto: "Cada tienda tiene un semáforo con cuatro puntos: Planilla, Horas extra, MBK y Plazas. Verde: bien. Ámbar: por revisar. Rojo: urgente (por ejemplo, entregó planilla y no solicitó MBK, o faltan 2 o más plazas). Gris: sin dato. Pasa el mouse sobre un punto para ver el detalle.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: '#tabs [data-k="seg"]', titulo: "Seguimiento", texto: "El semáforo está en la tabla Detalle por tienda." },
      { sel: "#tb", opcional: true, titulo: "Semáforo", texto: "Cuatro puntos por tienda: Planilla, Horas extra, MBK y Plazas." }] },
  { cat: "seguimiento", perm: "seguimiento", accion: "Enviar un recordatorio por WhatsApp a las tiendas pendientes", id: "recordatorio",
    kw: "recordatorio whatsapp mensaje tiendas pendientes sin entregar sin mbk sin horas extra avisar masivo",
    texto: "El botón «📋 Recordatorio» arma un mensaje con las tiendas a las que les falta algo: sin entregar planilla, sin horas extra o que entregaron y no solicitaron MBK. Eliges qué incluir y lo copias para WhatsApp.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: '#tabs [data-k="seg"]', titulo: "Seguimiento", texto: "El recordatorio sale de la lista de tiendas que ves." },
      { sel: "#recBtn", opcional: true, titulo: "📋 Recordatorio", texto: "Elige qué incluir y copia el mensaje." }] },
  { cat: "seguimiento", perm: "seguimiento", accion: "Filtrar las tiendas por zona, estado o nombre", id: "filtros-seguimiento",
    kw: "filtrar filtro buscar tienda zona estado entrega nombre codigo seguimiento lista",
    texto: "Arriba del Detalle por tienda puedes buscar por código o nombre y filtrar por zona o por estado de entrega. Los mismos filtros se aplican a la tabla de Planilla MBK, al Excel y al recordatorio.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: '#tabs [data-k="seg"]', titulo: "Seguimiento", texto: "Los filtros gobiernan todo lo que ves en esta pestaña." },
      { sel: "#fTxt", opcional: true, titulo: "Buscar y filtrar", texto: "Escribe una tienda o elige zona y estado." }] },
  { cat: "seguimiento", perm: "seguimiento", accion: "Descargar el Excel de seguimiento", id: "excel-seguimiento",
    kw: "excel descargar seguimiento tiendas horas extra plazas mbk exportar lo que veo",
    texto: "El botón «⬇ Excel» descarga lo que ves en pantalla, respetando los filtros: tiendas con horas extra y plazas, y el MBK de las semanas elegidas.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: '#tabs [data-k="seg"]', titulo: "Seguimiento", texto: "El Excel respeta los filtros activos." },
      { sel: "#xlsBtn", opcional: true, titulo: "⬇ Excel", texto: "Descarga la tabla con lo que ves." }] },
  { cat: "seguimiento", perm: "seguimiento", accion: "Aprobar el MBK de mi selección (GZ)", id: "aprobar-mbk",
    kw: "aprobar mbk viatico transporte gz seleccion semanas tienda monto cambio aprobado aprobar de nuevo imagen resumen",
    texto: "En Planilla MBK · resumen a solicitar, elige las semanas con el selector y toca «Aprobar mi selección»: el GZ aprueba de una vez todas las tiendas de su zona que solicitaron esas semanas (o marca tienda por tienda). Si una tienda cambia su monto después de aprobar, sale marcada para aprobar de nuevo. GD y GO solo consultan. «Descargar imagen» baja el resumen.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: '#tabs [data-k="seg"]', titulo: "Seguimiento", texto: "El MBK se aprueba en la segunda tabla." },
      { sel: "#mbkC", opcional: true, titulo: "Planilla MBK", texto: "Lo que pide cada tienda por semana." },
      { sel: "#mbkAp", opcional: true, titulo: "Aprobar mi selección", texto: "Aprueba las tiendas de tu zona con las semanas elegidas." }] },
  { cat: "seguimiento", perm: "seguimiento", accion: "Ver el horario de una tienda (solo lectura)", id: "ver-horario-tienda",
    kw: "ver horario tienda solo lectura visor ojo planilla mbk consultar revisar tienda detalle",
    texto: "En el Detalle por tienda, el botón «👁 Ver» abre el horario, la planilla y el MBK de esa tienda en solo lectura, para revisarlos sin tocar nada.",
    pasos: c => [
      { antes: () => c.ir("seg"), sel: '#tabs [data-k="seg"]', titulo: "Seguimiento", texto: "Cada fila de tienda tiene su botón Ver." },
      { sel: "#tb", opcional: true, titulo: "👁 Ver", texto: "Abre el horario de la tienda en solo lectura." }] },

  /* ---------- Recursos Humanos y Reclutamiento ---------- */
  { cat: "rrhh", perm: "rrhh_ver", accion: "Filtrar el personal por región, zona o tienda", id: "filtros-rrhh",
    kw: "filtrar personal region zona tienda tarjetas estado por tienda activos presupuesto dias sin completar excel",
    texto: "En Recursos Humanos filtra por región, zona o tienda. Las tarjetas de arriba filtran la lista al tocarlas, y «Estado por tienda» muestra activos frente al presupuesto y los días sin completar: toca una tienda para ver solo a su gente. «⬇ Excel» descarga lo que ves.",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: '#tabs [data-k="rrh"]', titulo: "Recursos Humanos", texto: "Los filtros están arriba." },
      { sel: "#rhFil", opcional: true, titulo: "Filtros", texto: "Región, zona y tienda." }] },
  { cat: "rrhh", perm: "rrhh_cargar", accion: "Publicar las altas para que las tiendas las confirmen", id: "publicar-altas",
    kw: "publicar altas confirmar tienda cargar excel altas pendiente enviar tiendas nuevo personal",
    texto: "Después de cargar el Excel de altas, «Publicar altas» las manda a las tiendas: cada gerente las ve en Mi horario y las confirma. Hasta que la tienda confirma, la alta queda como pendiente en el control cruzado.",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: '#tabs [data-k="rrh"]', titulo: "Recursos Humanos", texto: "Las altas se cargan y se publican aquí." },
      { sel: "#rhPub", opcional: true, titulo: "Publicar altas", texto: "Las manda a las tiendas para que las confirmen." }] },
  { cat: "rrhh", perm: "rrhh_cargar", accion: "Una alta no le aparece a la tienda (cédula repetida o de otra persona)", id: "alta-no-aparece",
    kw: "alta no aparece tienda gerente no ve persona cedula repetida duplicada misma cedula otra persona conflicto sin tienda omitida cargar altas no llego",
    texto: "Al cargar el Excel de altas, una persona no llega a la tienda si: (1) su cédula está repetida en el archivo (se omite la segunda), (2) su cédula ya está registrada a nombre de otra persona (no se actualiza para no sobrescribir), (3) la columna Tiendas no trae un número de tienda que exista en RITMO, o (4) falta la cédula. RITMO lo dice con nombres y número de fila: corrige esa cédula en el Excel y vuelve a cargar. Después, «Publicar altas».",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: '#tabs [data-k="rrh"]', titulo: "Recursos Humanos", texto: "El resumen de la carga aparece al leer el archivo." },
      { sel: "#rhCarga", opcional: true, titulo: "Cargar altas", texto: "Mira el resumen: «Repetidas en el archivo», «Cédula de otra persona» y «Sin tienda en RITMO» son las que no se publicarán. El mensaje de abajo dice quiénes son." }] },
  { cat: "rrhh", perm: "rrhh_ver", accion: "Ver la rotación y los motivos de baja", id: "rotacion",
    kw: "rotacion bajas motivo renuncia despido salida personal analisis indicadores tienda",
    texto: "«Rotación y bajas» muestra cuántas personas salen y por qué motivo, por tienda, zona o región, para detectar dónde hay más rotación. Al registrar una baja puedes indicar el motivo (con un segundo motivo si aplica).",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: '#tabs [data-k="rrh"]', titulo: "Recursos Humanos", texto: "La rotación está debajo de «Estado por tienda»." },
      { sel: "#rhRotB", opcional: true, titulo: "Rotación y bajas", texto: "Cantidad y motivo de las bajas." }] },
  { cat: "rrhh", perm: "rrhh_ver", accion: "Ver la ficha de una persona y las cédulas", id: "ficha-persona",
    kw: "ficha persona cedula mostrar cedulas buscar nombre personal registrado detalle datos",
    texto: "En «Personal registrado» busca por nombre o cédula y filtra por estado. Toca el nombre de una persona para abrir su ficha. Las cédulas están ocultas por privacidad: «Mostrar cédulas» las deja a la vista mientras trabajas.",
    pasos: c => [
      { antes: () => c.ir("rrh"), sel: '#tabs [data-k="rrh"]', titulo: "Recursos Humanos", texto: "El registro de personal está al final." },
      { sel: "#rhTxt", opcional: true, titulo: "Buscar personal", texto: "Por nombre o por cédula." }] },
  { cat: "reclutamiento", perm: "reclutamiento", accion: "Registrar un prospecto y contratarlo", id: "prospectos",
    kw: "prospecto candidato entrevista documentos aceptado contratar cedula ingreso etapas nuevo prospecto reclutar",
    texto: "En Reclutamiento › Prospectos toca «+ Nuevo prospecto» y llévalo por etapas: nuevo, entrevista, documentos y aceptado por la tienda. Los prospectos no guardan cédula. Al contratar se pide la cédula y la fecha de ingreso: se crea el alta en RRHH para que la tienda la confirme y se cierra la vacante abierta de ese cargo.",
    pasos: c => [
      { antes: () => c.ir("rec"), sel: '#tabs [data-k="rec"]', titulo: "Reclutamiento", texto: "Los prospectos están al final de la pestaña." },
      { sel: "#pcNew", opcional: true, titulo: "+ Nuevo prospecto", texto: "Registra al candidato y avánzalo por etapas." }] },
  { cat: "reclutamiento", perm: "aperturas", accion: "Abrir o quitar las vacantes de todas las tiendas", id: "abrir-vacantes",
    kw: "abrir vacantes todas tiendas quitar vacantes abiertas plazas presupuesto masivo",
    texto: "«Abrir vacantes de todas» crea una vacante por cada plaza que le falta a cada tienda contra su presupuesto. «Quitar vacantes abiertas» las cierra. También puedes ver «Dónde enfocarte» para saber qué tiendas tienen más plazas por cubrir.",
    pasos: c => [
      { antes: () => c.ir("rec"), sel: '#tabs [data-k="rec"]', titulo: "Reclutamiento", texto: "Las vacantes salen del presupuesto de plazas." },
      { sel: "#rcFoco", opcional: true, titulo: "Dónde enfocarte", texto: "Las tiendas con más plazas por cubrir." }] },

  /* ---------- Administración ---------- */
  { cat: "admin", perm: "administracion", accion: "Abrir o cerrar periodos (quincenas) de todas las tiendas", id: "periodos",
    kw: "periodos periodo abrir cerrar quincena quincenas septiembre octubre agosto tiendas checklist matriz cerrada abierta importar horarios atrasados abrir todas lote",
    texto: "En la pestaña Periodos (junto a Administración) hay una matriz con todas las tiendas y las últimas 6 quincenas. Casilla marcada = abierta: el gerente puede importar horarios, cambiar y publicar. Desmarcada = cerrada. «Abrir septiembre y octubre» (o la casilla «Todas» de cada columna) abre en un solo paso las tiendas que ves; después cada GZ cierra con «Aprobar HE». Para cerrar una quincena sin entrega, ya debe haber pasado su fecha de planilla.",
    pasos: c => [
      { antes: () => c.ir("per"), sel: '#tabs [data-k="per"]', titulo: "Periodos", texto: "La matriz de tiendas y quincenas está en esta pestaña." },
      { sel: "#perMes", opcional: true, titulo: "Abrir periodos atrasados", texto: "Abre de una vez el mes anterior y el actual para las tiendas que ves." },
      { sel: "#perB", opcional: true, titulo: "Casillas por tienda", texto: "Marca o desmarca una casilla para abrir o cerrar esa quincena en esa tienda." }] },
  { cat: "horarios", perm: "mi_horario", accion: "El importador omitió una semana porque está cerrada", id: "importar-semana-cerrada",
    kw: "importar semana cerrada no se importo omitio periodo cerrado quincena cerrada abrir periodo reabrir gz administrador no cargo horario septiembre",
    texto: "El importador no toca las semanas de una quincena cerrada (pasó la fecha de planilla o tu GZ aprobó las horas extra). El informe las lista como «Semanas cerradas». Pídele a tu GZ que abra la quincena (🔓 Abrir quincena) o al administrador de RITMO que la abra en Periodos, y vuelve a importar.",
    pasos: c => [
      { antes: () => c.ir("mia"), sel: '#tabs [data-k="mia"]', titulo: "Entregar", texto: "Aquí ves si tu quincena está cerrada y puedes solicitar la reapertura." }] },
  { cat: "admin", perm: "administracion", accion: "Consultar el registro de auditoría", id: "auditoria",
    kw: "auditoria registro quien aprobo horas extra mbk abrio reabrio quincena reinicio historial control",
    texto: "En Administración, «Registro de auditoría» muestra quién aprobó horas extra y MBK, y quién abrió o reabrió quincenas, con fecha y hora. Filtra por tipo (horas extra, MBK, aperturas, reaperturas, reinicios) o busca una tienda o persona.",
    pasos: c => [
      { antes: () => c.ir("adm"), sel: '#tabs [data-k="adm"]', titulo: "Administración", texto: "La auditoría está en esta pestaña." },
      { sel: "#audTb", opcional: true, titulo: "Registro de auditoría", texto: "Quién hizo qué y cuándo." }] },
  { cat: "admin", perm: "administracion", accion: "Descargar un respaldo y reiniciar datos", id: "respaldo-admin",
    kw: "respaldo descargar reiniciar reinicio borrar datos personal vacantes presupuesto emergencia restaurar",
    texto: "En Administración, «Descargar respaldo» guarda un archivo con lo que la app maneja. «Reiniciar…» borra, con confirmación, los datos que elijas (personal, vacantes o presupuesto de plazas) y queda registrado en la auditoría. Úsalo solo en emergencias y con respaldo.",
    pasos: c => [
      { antes: () => c.ir("adm"), sel: '#tabs [data-k="adm"]', titulo: "Administración", texto: "El respaldo y el reinicio están al final." },
      { sel: "#rspBaja", opcional: true, titulo: "Descargar respaldo", texto: "Guarda un archivo antes de cualquier reinicio." }] },
  { cat: "admin", perm: "administracion", accion: "Compartir RITMO con las tiendas (QR y mensaje)", id: "compartir-acceso",
    kw: "compartir invitar qr codigo mensaje whatsapp enlace url acceso tiendas dar acceso link",
    texto: "En Administración › Compartir RITMO hay un código QR descargable y un mensaje listo para copiar o enviar por WhatsApp, con el enlace para entrar.",
    pasos: c => [
      { antes: () => c.ir("adm"), sel: '#tabs [data-k="adm"]', titulo: "Administración", texto: "Compartir RITMO está a mitad de la pestaña." },
      { sel: "#qrBox", opcional: true, titulo: "Código QR", texto: "Descárgalo o copia el mensaje." }] },
  { cat: "admin", perm: "administracion", accion: "Crear los accesos de los usuarios", id: "crear-accesos",
    kw: "crear accesos usuarios correo contrasena enlace restablecer acceso masivo uno por uno tiendas publicar",
    texto: "En Administración › «2 · Crear accesos» eliges a un usuario o a todos y RITMO crea su acceso: cada persona recibe un enlace para crear su contraseña. Se hace después de importar y publicar los roles.",
    pasos: c => [
      { antes: () => c.ir("adm"), sel: '#tabs [data-k="adm"]', titulo: "Administración", texto: "Los accesos se crean después de importar los roles." },
      { sel: "#acc", opcional: true, titulo: "Crear accesos", texto: "Uno o todos los usuarios." }] },
  { cat: "admin", perm: "administracion", accion: "Ver RITMO como otro rol («Ver como»)", id: "ver-como",
    kw: "ver como otro rol simular probar usuario permisos gerente tienda gz perspectiva vista previa",
    texto: "La barra morada «Ver como» (arriba, solo para el superusuario) te deja ver RITMO exactamente como lo ve otro rol o una tienda, sin cambiar tus permisos reales. Sirve para probar permisos y para ver los tutoriales de otro rol.",
    pasos: c => [{ sel: "#vcSel", opcional: true, titulo: "Ver como", texto: "Elige el rol o la tienda que quieres ver." }] },

  /* ---------- Cuenta ---------- */
  { cat: "cuenta", perm: "todos", accion: "La campanita: qué avisos me llegan", id: "campanita",
    kw: "campanita avisos notificaciones bandeja pendientes leido marcar todo por hacer alertas automaticas",
    texto: "La campanita 🔔 de arriba reúne lo que te falta por hacer según tu rol: entregas pendientes, aprobaciones, altas y bajas por confirmar, vacantes, conflictos de la importación y más. Los avisos se calculan solos; cada uno trae un botón para ir a resolverlo y puedes «Marcar todo como leído».",
    pasos: c => [{ sel: "#bellB", titulo: "La campanita", texto: "Toca para ver tus avisos pendientes." }] },
  { cat: "cuenta", perm: "todos", accion: "Cambiar el tamaño de letra, el tema o la luz nocturna", id: "accesibilidad",
    kw: "accesibilidad tamano letra tema oscuro claro luz nocturna contraste aa leer mejor vista cansada",
    texto: "El botón «Aa» de arriba abre Accesibilidad: elige tema claro u oscuro, el tamaño de la letra y la luz nocturna. Se recuerda en tu navegador. «Restablecer» deja todo como venía.",
    pasos: c => [{ sel: "#a11yB", titulo: "Accesibilidad", texto: "Tema, tamaño de letra y luz nocturna." }] },
  { cat: "cuenta", perm: "todos", accion: "«Guardados aquí»: copias en este navegador", id: "guardados-aqui",
    kw: "guardados aqui copias navegador local disquete borrar todo privacidad computadora compartida datos personal",
    texto: "La pestaña «Guardados aquí» lista las copias que guardaste con el botón de disquete: quedan solo en este navegador, no en la nube. Úsalas únicamente en tu computadora y bórralas si es compartida, porque contienen datos del personal.",
    pasos: c => [
      { antes: () => c.ir("loc"), sel: '#tabs [data-k="loc"]', titulo: "Guardados aquí", texto: "Las copias de este navegador." },
      { sel: "#locDel", opcional: true, titulo: "Borrar todo", texto: "Elimina las copias guardadas aquí." }] }
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
