// RITMO · Novedades del desarrollador
// Agregar cada mejora ARRIBA (la más reciente primero). id único y creciente.
// tipo: "Nuevo" | "Mejora" | "Corrección" · para: roles que lo ven ("Todos" o lista)
export const NOVEDADES = [
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
