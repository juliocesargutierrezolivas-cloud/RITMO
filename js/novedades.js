// RITMO · Novedades del desarrollador
// Agregar cada mejora ARRIBA (la más reciente primero). id único y creciente.
// tipo: "Nuevo" | "Mejora" | "Corrección" · para: roles que lo ven ("Todos" o lista)
export const NOVEDADES = [
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
