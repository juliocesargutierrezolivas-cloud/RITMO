// RITMO · Recursos Humanos: lógica pura (sin Firebase ni pantalla).
// Registro central de personal con control cruzado tienda ↔ RRHH. Todo se identifica por cédula.
// Minimización de datos: del archivo de altas solo se conserva nombre, cédula, cargo, categoría, empresa, tienda e ingreso.
// No se guardan fecha de nacimiento, ciudad de origen, jefe ni salario.

/* ---------- Cédulas ---------- */
export const normCed = s => String(s ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "");
export const cedulaEstricta = n => /^\d{13}[A-Z]$/.test(n);
export const cedulaAceptable = n => /^\d{12,13}[A-Z]?$/.test(n);
export const fmtCed = s => { const n = normCed(s); return cedulaEstricta(n) ? `${n.slice(0, 3)}-${n.slice(3, 9)}-${n.slice(9)}` : n; };

// Identificador opaco del documento: así la cédula no queda en la dirección del registro.
export async function idPersonal(cedula) {
  const bytes = new TextEncoder().encode("ritmo|" + normCed(cedula));
  const h = await crypto.subtle.digest("SHA-256", bytes);
  return "p_" + [...new Uint8Array(h)].slice(0, 12).map(x => x.toString(16).padStart(2, "0")).join("");
}

/* ---------- Texto y fechas ---------- */
const sinTildes = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
export const normNombre = s => sinTildes(s).toLowerCase().replace(/[^a-zñ ]/g, " ").replace(/\s+/g, " ").trim();
export const limpiar = s => String(s ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
export const primerNombre = s => limpiar(s).split(" ")[0].toUpperCase();

export function aISO(v) {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  if (/^\d{5}(\.\d+)?$/.test(s)) { // número de serie de Excel
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(Number(s)) * 864e5);
    return d.toISOString().slice(0, 10);
  }
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/.exec(s);
  if (m) { let y = +m[3]; if (y < 100) y += y > 50 ? 1900 : 2000; return `${y}-${String(+m[2]).padStart(2, "0")}-${String(+m[1]).padStart(2, "0")}`; }
  return null;
}
export const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const diasDesde = f => { const d = f && f.toDate ? f.toDate() : (f ? new Date(f) : null); return d && !isNaN(d) ? Math.floor((Date.now() - d.getTime()) / 864e5) : 0; };

/* ---------- Cargos: del archivo de RRHH a los 6 cargos del Generador ---------- */
export function cargoGenerador(raw) {
  const t = sinTildes(raw).toLowerCase();
  if (/entrenamiento/.test(t)) return "Gerente en entrenamiento";
  if (/gerente/.test(t)) return "Gerente de tienda"; // incluye "Overstaff"
  if (/conserje/.test(t)) return "Conserje";
  if (/segur|guarda/.test(t)) return "Seguridad Interna";
  if (/mbk/.test(t)) return "Agente SAC MBK";
  return "Agente SAC";
}

/* ---------- Lectura del Excel de altas ---------- */
// aoa: filas del Excel como matriz (primera hoja). porNumero: Map(número de tienda → ficha de tienda).
export function parsearAltas(aoa, porNumero) {
  const err = { sinTienda: [], sinCedula: [], repetidas: [], repetidasDet: [], cedulaRevisar: [] };
  const hi = aoa.slice(0, 8).findIndex(r => r.some(c => /^nombre/i.test(limpiar(c))) && r.some(c => /^c[eé]dula/i.test(limpiar(c))));
  if (hi < 0) throw new Error('No encuentro las columnas "Nombre" y "Cédula" en las primeras filas');
  const cab = aoa[hi].map(c => sinTildes(limpiar(c)).toLowerCase());
  const col = pref => cab.findIndex(c => c.startsWith(pref));
  const cN = col("nombre"), cC = col("cargo"), cT = col("tienda"), cCe = col("cedula"), cI = col("fecha de ingreso"), cK = col("categoriz"), cP = col("planilla");
  if (cT < 0) throw new Error('Falta la columna "Tiendas"');
  const registros = [], vistos = new Map();
  aoa.slice(hi + 1).forEach((r, i) => {
    const fila = hi + 2 + i, nombre = limpiar(r[cN]);
    if (!nombre && !limpiar(r[cCe])) return; // fila vacía
    const ced = normCed(r[cCe]);
    if (!ced) { err.sinCedula.push(fila); return; }
    const m = /(\d+)\s*$/.exec(limpiar(r[cT])), t = m ? porNumero.get(Number(m[1])) : null;
    if (!t) { err.sinTienda.push(fila); return; }
    if (vistos.has(ced)) { const prev = vistos.get(ced); err.repetidas.push(fila); err.repetidasDet.push({ fila, nombre, con: prev.nombre, filaCon: prev.fila }); return; }
    vistos.set(ced, { nombre, fila });
    const revisar = !cedulaEstricta(ced);
    if (!cedulaAceptable(ced)) { err.cedulaRevisar.push(fila); return; }
    if (revisar) err.cedulaRevisar.push(fila);
    registros.push({
      cedula: ced, nombre, cargo: cargoGenerador(r[cC]), cargoOrigen: limpiar(r[cC]), categoria: limpiar(r[cK]),
      empresa: limpiar(r[cP]), tienda: t.codigo, ingreso: aISO(r[cI]), cedulaRevisar: revisar, fila
    });
  });
  return { registros, errores: err, total: registros.length + err.sinCedula.length + err.sinTienda.length + err.repetidas.length };
}

/* ---------- Emparejar el personal de RRHH con los agentes que ya tiene la tienda (sin duplicar) ---------- */
// Devuelve { tipo: "vinculado" | "posible" | "nuevo", agente?, candidatos? }
export function emparejar(p, agentes) {
  const c = normCed(p.cedula);
  const porCedula = c && agentes.find(a => normCed(a.cedula) === c);
  if (porCedula) return { tipo: "vinculado", agente: porCedula, por: "cédula" };
  const sinCed = agentes.filter(a => !normCed(a.cedula));
  const nn = normNombre(p.nombre);
  const mismos = sinCed.filter(a => a.nombreCompleto && normNombre(a.nombreCompleto) === nn);
  if (mismos.length === 1) return { tipo: "vinculado", agente: mismos[0], por: "nombre completo" };
  const pn = normNombre(primerNombre(p.nombre));
  const cand = sinCed.filter(a => { const an = normNombre(a.nombre); return an && (an === pn || an.split(" ")[0] === pn); });
  if (cand.length) return { tipo: "posible", candidatos: cand };
  return { tipo: "nuevo" };
}

// Nombre corto único para la matriz del Generador (usa el primer nombre; si ya existe, agrega la inicial del apellido).
export function nombreCorto(p, ocupados) {
  const toks = limpiar(p.nombre).split(" "), base = primerNombre(p.nombre);
  const ap = (toks.length >= 4 ? toks[2] : toks[1]) || "";
  let n = base;
  if (ocupados.has(n) && ap) n = `${base} ${ap[0].toUpperCase()}.`;
  for (let k = 2; ocupados.has(n); k++) n = `${base} ${k}`;
  ocupados.add(n);
  return n;
}

// Agente listo para el Generador. El color lo asigna el Generador al cargarlo (nunca repite).
export function agenteDesdePersonal(p, ocupados) {
  const ing = p.ingreso || null, reciente = ing && (Date.now() - new Date(ing + "T00:00").getTime()) < 14 * 864e5;
  return {
    id: "ag" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3),
    nombre: nombreCorto(p, ocupados), nombreCompleto: p.nombre, cedula: fmtCed(p.cedula),
    cargos: [p.cargo || "Agente SAC"], estudia: [], nuevo: !!reciente, salario: null, ingreso: ing, baja: null,
    categoria: p.categoria || "", empresa: p.empresa || ""
  };
}
// Lo que se completa en un agente que ya existía cuando se vincula con RRHH (no pisa lo que la tienda ya tiene).
export function datosVinculo(p, a) {
  const d = { cedula: fmtCed(p.cedula) };
  if (!a.nombreCompleto) d.nombreCompleto = p.nombre;
  if (!a.ingreso && p.ingreso) d.ingreso = p.ingreso;
  if (p.categoria) d.categoria = p.categoria;
  if (p.empresa) d.empresa = p.empresa;
  return d;
}

/* ---------- Control cruzado ---------- */
export const DIAS_ALERTA = 3; // días sin confirmar antes de marcarlo como atrasado
// Movimientos pendientes de confirmar: devuelve [{ tipo: "alta"|"baja", p, origen, dias, atrasado, disputada }]
export function pendientes(lista) {
  const out = [];
  for (const p of lista) {
    if (p.alta && p.alta.confirmada === false) { const d = diasDesde(p.alta.fecha); out.push({ tipo: "alta", p, origen: p.alta.origen, dias: d, atrasado: d >= DIAS_ALERTA }); }
    if (p.baja && p.baja.confirmada === false) { const d = diasDesde(p.baja.fechaRegistro); out.push({ tipo: "baja", p, origen: p.baja.origen, dias: d, atrasado: d >= DIAS_ALERTA, disputada: !!p.baja.disputada }); }
  }
  return out.sort((a, b) => b.dias - a.dias);
}
