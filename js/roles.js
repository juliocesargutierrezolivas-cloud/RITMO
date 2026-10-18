// RITMO · Roles y permisos por módulo.
// Un rol es un nombre más una lista de permisos (módulos que puede ver y acciones que puede hacer).
// Los roles de la lista PLANTILLAS vienen con RITMO; el superusuario puede crear otros desde Administración
// (se guardan en la colección `roles` de Firestore) y asignarlos a los usuarios.
// Cada usuario guarda una copia de sus permisos (campo `permisos`); `firestore.rules` usa esa copia.
// El permiso `administracion` no se puede conceder: es exclusivo del superusuario.

export const MODULOS = [
  { id: "mi_horario",    t: "Mi horario y Entregar",             d: "Arma el horario y entrega la planilla de su tienda." },
  { id: "seguimiento",   t: "Seguimiento",                       d: "Ve el cumplimiento de las tiendas de su alcance y recibe alertas." },
  { id: "calendario",    t: "Calendario de planilla",            d: "Publica la fecha de entrega y las semanas de horas extra de cada quincena." },
  { id: "descargas",     t: "Descargas de planilla",             d: "Descarga la planilla en Excel y la hoja de asistencia." },
  { id: "rrhh_ver",      t: "Personal: consultar",               d: "Ve el registro central de personal (datos personales)." },
  { id: "rrhh_cargar",   t: "Personal: cargar altas y bajas",    d: "Sube el Excel de altas, registra bajas y confirma lo que registra la tienda." },
  { id: "rrhh_eliminar", t: "Personal: eliminar líneas con ✕",   d: "Elimina un registro erróneo o duplicado para que no quede como baja." },
  { id: "reclutamiento", t: "Reclutamiento: ver vacantes",       d: "Consulta las vacantes y plazas abiertas por tienda." },
  { id: "aperturas",     t: "Reclutamiento: aperturas y puestos", d: "Abre tiendas nuevas, agrega puestos y cierra o cancela vacantes." }
];
export const IDS_MODULOS = MODULOS.map(m => m.id);

// Roles que trae RITMO. `sistema: true` = no se pueden borrar. Alcance = qué tiendas ve el rol.
export const PLANTILLAS = {
  "Superusuario": { permisos: [...IDS_MODULOS, "administracion"], alcance: "Todas", desc: "Control completo de RITMO.", sistema: true },
  "Editor": { permisos: ["mi_horario"], alcance: "Tienda", desc: "Gerente de tienda: Mi horario y entrega de planilla.", sistema: true },
  "Visualizar": { permisos: ["seguimiento"], alcance: "GZ / Región / Todas", desc: "GZ, distrito y operaciones: seguimiento en solo lectura.", sistema: true },
  "Descargar": { permisos: ["seguimiento", "calendario", "descargas"], alcance: "Asignadas / Todas", desc: "Planilla: seguimiento, descargas y calendario.", sistema: true },
  "RRHH": { permisos: ["rrhh_ver", "rrhh_cargar", "rrhh_eliminar", "reclutamiento"], alcance: "Todas", desc: "Recursos Humanos: altas, bajas y control cruzado con las tiendas.", sistema: true },
  "Encargado de Reclutamiento": { permisos: ["rrhh_ver", "rrhh_cargar", "rrhh_eliminar", "reclutamiento", "aperturas"], alcance: "Todas", desc: "Abre tiendas y puestos, cierra vacantes y elimina líneas con ✕.", sistema: true },
  "Auxiliar de Reclutamiento": { permisos: ["rrhh_ver", "rrhh_cargar", "reclutamiento"], alcance: "Todas", desc: "Carga altas, registra bajas y consulta vacantes.", sistema: true }
};

// Permisos efectivos de un usuario: los guardados en su ficha o, si no tiene, los de la plantilla de su rol.
export function permisosDe(rol, guardados) {
  if (rol === "Superusuario") return PLANTILLAS["Superusuario"].permisos;
  if (Array.isArray(guardados)) return guardados;
  return (PLANTILLAS[rol] && PLANTILLAS[rol].permisos) || [];
}
export const tiene = (u, permiso) => !!u && permisosDe(u.rol, u.permisos).includes(permiso);

// Un rol personalizado válido: nombre único y solo permisos conocidos (nunca `administracion`).
export function validarRol(nombre, permisos, existentes) {
  const n = String(nombre || "").trim().replace(/\s+/g, " ");
  if (n.length < 3) return "Escribe un nombre de al menos 3 letras.";
  if (n.length > 50) return "El nombre es demasiado largo.";
  if (existentes.some(x => x.toLowerCase() === n.toLowerCase())) return "Ya existe un rol con ese nombre.";
  if (!permisos.length) return "Marca al menos un módulo.";
  if (permisos.some(p => !IDS_MODULOS.includes(p))) return "Hay permisos no válidos.";
  return null;
}
export const limpiarPermisos = permisos => IDS_MODULOS.filter(p => permisos.includes(p));
