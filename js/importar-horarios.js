/* RITMO · Importar horarios desde Excel (Generador).
   Lee dos formatos y los empareja con el personal que ya está precargado en la Matriz base:
   1) "Matriz RITMO": la misma tabla que baja Exportar Excel (Turno, Caja, Horario, Horas, Lunes…Domingo) más una columna Semana.
   2) "Manual": la hoja de planilla de toda la vida (Hoja1): bloques semanales con LUNES…DOMINGO, fechas debajo y filas TURNO 12HRS / TURNO 8HRS con nombres.
   Usa los globales del Generador (S, agente, semanaDe, tocarSemana, render, toast, semanaCerrada, cajasDe, CAJAS, DIAS…). */
const ImportarHorarios = (() => {
  const sinT = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const nz = s => sinT(s).toUpperCase().replace(/[^A-ZÑ0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const DN = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
  const IGNORAR = new Set(["", "-", "X", "L", "LIBRE", "OFF", "DESC", "DESCANSO", "N A", "NA", "VAC", "VACACIONES", "SUB", "SUBSIDIO", "INCAP", "INCAPACIDAD", "PERMISO", "AUSENTE"]);
  const CAJA_ALIAS = { COMPRA: "Compra", COMPRAS: "Compra", MBK: "MBK", "MI BAN KITO": "MBK", ADMINISTRACION: "Administración", ADMIN: "Administración", INDUCCION: "Inducción", CONSERJERIA: "Conserjería", CONSERJE: "Conserjería", "SEGURIDAD INTERNA": "Seguridad Interna", SEGURIDAD: "Seguridad Interna" };
  const pad2 = n => String(n).padStart(2, "0");
  // "Paola 16hrs", "Mery 8am": se quita la anotación y queda el nombre
  // La anotación sí dice algo: "Paola 16hrs" = esa persona trabajó 16 h ese día (no el turno normal). Se guarda aparte para crear el horario.
  const horasNota = s => { const m = /(\d{1,2}(?:[.,]\d)?)\s*(?:HRS?|H|HORAS)\b/i.exec(String(s ?? "")); const h = m ? +m[1].replace(",", ".") : 0; return h > 0 && h <= 24 ? h : 0 };
  const limpiar = s => { const t = String(s ?? "").trim(); const w = t.split(/\s+/).filter(x => !/\d/.test(x) && !/^(AM|PM|HRS?|H|HORAS)$/i.test(sinT(x))); return w.join(" ") || t };

  /* ---------- Fechas ---------- */
  function aFecha(v, anioRef) {
    if (v === null || v === undefined || v === "") return null;
    if (v instanceof Date && !isNaN(v)) { const d = new Date(v.getTime() + 12 * 3600e3); return ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate())) }
    if (typeof v === "number" && v > 30000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 864e5) + 12 * 3600e3); return ymd(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())) }
    const t = String(v).trim();
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t); if (m) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
    m = /(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?/.exec(t);
    if (m) { let y = m[3] ? +m[3] : anioRef; if (y < 100) y += 2000; return `${y}-${pad2(m[2])}-${pad2(m[1])}` }
    return null;
  }
  const aLunes = k => { const d = lunes(parse(k)); return ymd(d) };
  const anioRef = () => { const k = S.semana || ymd(new Date()); return +k.slice(0, 4) };

  /* ---------- Formato Matriz RITMO ---------- */
  function resolverDestino(caja, horario) {
    if (!caja) return null;
    const m = /(\d{1,2})(?::?(\d{2}))?\s*(?:-|–|a|A|\/)\s*(\d{1,2})(?::?(\d{2}))?/.exec(String(horario || "")); if (!m) return null;
    const ini = pad2(m[1]) + ":" + (m[2] || "00"), fin = pad2(m[3]) + ":" + (m[4] || "00");
    const ps = Object.entries(S.cfg.plantillas).filter(([, p]) => p.ini === ini && p.fin === fin).sort((a, b) => (a[1].custom ? 1 : 0) - (b[1].custom ? 1 : 0)); // primero los horarios estándar
    const ok = ps.find(([id]) => cajasDe(id).includes(caja)) || ps[0];
    return ok ? caja + "|" + ok[0] : null;
  }
  function parseMatriz(aoa) {
    let h = -1;
    for (let r = 0; r < Math.min(aoa.length, 40); r++) { const row = (aoa[r] || []).map(nz); if (row.includes("TURNO") && row.includes("CAJA")) { h = r; break } }
    if (h < 0) return null;
    const semanas = [], avisos = []; let cols = null, cur = null, kSem = null;
    const leerCols = r => {
      const row = (aoa[r] || []).map(nz), iC = row.indexOf("CAJA"), iT = row.indexOf("TURNO"), iS = row.findIndex(x => x.startsWith("SEMANA")), iH = row.findIndex(x => x.startsWith("HORARIO"));
      const dias = DN.map((n, d) => row.findIndex((x, i) => i > iC && x.startsWith(n.slice(0, 3))));
      return dias.every(i => i >= 0) && iC >= 0 && iH >= 0 ? { iC, iT, iS, iH, dias, hdr: aoa[r] } : null;
    };
    cols = leerCols(h); if (!cols) return null;
    // Si no hay columna Semana, la fecha sale del encabezado del lunes ("Lunes 12/10")
    if (cols.iS < 0) { const f = aFecha(String(cols.hdr[cols.dias[0]]).replace(/^[^\d]*/, ""), anioRef()); if (f) { kSem = aLunes(f); cur = { k: kSem, filas: [] }; semanas.push(cur) } else avisos.push("No encontré la fecha de la semana: agrega una columna Semana con la fecha del lunes.") }
    for (let r = h + 1; r < aoa.length; r++) {
      const row = aoa[r] || [];
      const nc = leerCols(r); if (nc) { cols = nc; continue }
      if (cols.iS >= 0) { const f = aFecha(row[cols.iS], anioRef()); if (f) { const k = aLunes(f); if (f !== k) avisos.push(`La fecha ${f} no es lunes; se usó el lunes ${k}.`); if (!cur || cur.k !== k) { cur = semanas.find(x => x.k === k) || { k, filas: [] }; if (!semanas.includes(cur)) semanas.push(cur) } } }
      if (!cur) continue;
      const cajaRaw = nz(row[cols.iC]), caja = CAJA_ALIAS[cajaRaw] || null, horario = row[cols.iH];
      const cells = cols.dias.map(i => limpiar(row[i])), hrs = cols.dias.map(i => horasNota(row[i]));
      if (!cells.some(Boolean)) continue; // fila sin nombres: nada que importar
      if (!caja) { avisos.push(`Fila ${r + 1}: la Caja "${row[cols.iC] ?? ""}" no es válida (Compra, MBK, Administración, Inducción, Conserjería, Seguridad Interna).`); continue }
      const turno = nz(row[cols.iT]);
      cur.filas.push({ key: caja + "|" + String(horario ?? "").trim(), label: `${caja} · ${String(horario ?? "").trim()}${turno ? " · " + turno : ""}`, cells, hrs, destino: resolverDestino(caja, horario), refuerzo: /REFUERZO/.test(turno) });
    }
    semanas.forEach(w => { const c = {}; w.filas.forEach(f => { c[f.key] = (c[f.key] || 0) + 1 }); const rep = Object.entries(c).filter(([, n]) => n > 3); if (rep.length) avisos.push(`La semana ${w.k} tiene ${rep[0][1]} filas con el mismo horario y caja (${rep[0][0].replace("|", " · ")}). ¿Falta la fecha del lunes en algún bloque?`) });
    return { formato: "Matriz RITMO", semanas: semanas.filter(s => s.filas.some(f => f.cells.some(Boolean))), avisos, manual: false };
  }

  /* ---------- Formato manual (Hoja1) ---------- */
  function parseManual(aoa) {
    const semanas = [], avisos = []; let cur = null, base = -1, c0 = -1, run = 0, ord = 0, clase = null, ultSem = null, ultTit = ""; const ordSem = {};
    const semTitulo = L => {
      const mbk = /\bMBK\b|\bMB\b/.test(L), t = L.replace(/\bHRS?\b/g, " ");
      const h24 = (h, ap) => (+h % 12) + (ap === "PM" ? 12 : 0);
      const rg = /(\d{1,2}) ?(AM|PM)? ?(\d{1,2}) ?(AM|PM)\b/.exec(t);
      let dur = null, turno = null;
      if (rg) { const a = h24(rg[1], rg[2] || rg[4]), b = h24(rg[3], rg[4]); dur = (b - a + 24) % 24; turno = a < 12 ? "AM" : "PM" }
      else { const d = /\b(12|9|8)\b/.exec(t); if (d) dur = +d[1]; const ap = /\b(AM|PM)\b/.exec(t); if (ap) turno = ap[1] }
      if (dur === 9 || dur === 8 || dur === 12) { if (dur === 9) return { key: "s:9", dur, turno, mbk, txt: "9 h" }; if (turno) return { key: `s:${dur}${turno}${mbk ? "M" : ""}`, dur, turno, mbk, txt: `${dur} h ${turno}${mbk ? " MBK" : ""}` } }
      return { key: null };
    };
    // Tabla lateral del Excel (NOMBRE · TURNOS · H.E · FERIADO) que está a la derecha de cada bloque semanal
    const sideCols = (row, c0) => { const r = (row || []).map(nz); let n = -1, t = -1, he = -1, fe = -1; for (let c = c0 + 7; c < r.length; c++) { if (n < 0 && r[c].startsWith("NOMBRE")) n = c; else if (n >= 0) { if (t < 0 && r[c].startsWith("TURNO")) t = c; else if (he < 0 && /^(H E|HE|EXTRAS?|HORAS EXTRAS?)$/.test(r[c])) he = c; else if (fe < 0 && r[c].startsWith("FERIADO")) fe = c } } return n >= 0 && t >= 0 ? { n, t, he, fe } : null };
    const esHdr = row => { const r = (row || []).map(nz); for (let c = 0; c < r.length - 6; c++) if (r[c] === "LUNES" && r[c + 1] === "MARTES" && r[c + 6] === "DOMINGO") return c; return -1 };
    for (let r = 0; r < aoa.length; r++) {
      const c = esHdr(aoa[r]);
      if (c >= 0) {
        c0 = c; base = r;
        const f = aFecha((aoa[r + 1] || [])[c], anioRef()) || aFecha((aoa[r][c]), anioRef());
        if (!f) { avisos.push(`Fila ${r + 1}: no encontré la fecha del lunes debajo de LUNES.`); cur = null; continue }
        let k = aLunes(f); const ant = semanas.length ? semanas[semanas.length - 1].k : null, esp = ant ? ymd(addDays(parse(ant), 7)) : null;
        if (esp && k !== esp && (f !== k || k < esp)) { avisos.push(`La fecha ${f} del bloque ${semanas.length + 1} no sigue a la semana anterior (${ant}); se usó el lunes ${esp}. Revísala.`); k = esp }
        else if (f !== k) avisos.push(`La fecha ${f} no es lunes; se usó el lunes ${k}.`);
        cur = { k, filas: [], resumen: {}, side: sideCols(aoa[r], c) }; semanas.push(cur); run = 0; ord = 0; clase = null; ultSem = null; continue;
      }
      if (cur && cur.side && r > base) { const rw = aoa[r] || [], nm = limpiar(rw[cur.side.n]), tv = rw[cur.side.t]; if (nm && typeof tv === "number") cur.resumen[nm] = { turnos: tv, he: cur.side.he >= 0 ? rw[cur.side.he] : null, fer: cur.side.fe >= 0 ? rw[cur.side.fe] : null } }
      if (!cur || r <= base + 1) continue;
      const row = aoa[r] || [], hrs = [...Array(7)].map((_, d) => horasNota(row[c0 + d])), cells = [...Array(7)].map((_, d) => limpiar(row[c0 + d])), label = c0 > 0 ? nz(row[c0 - 1]) : "";
      // Las semanas no siempre tienen las mismas filas, así que cada fila se identifica por su bloque (filas seguidas de 12 h, de 8 h o sin título)
      // y por su orden dentro del bloque, contando también las filas vacías.
      // Si el título dice la jornada completa ("12 hrs PM", "Turno MBK 6am-2pm", "Turno 8 hrs AM") la fila se identifica por lo que dice, no por su posición.
      // Una fila sin título justo debajo de una de esas es otra persona en el mismo turno.
      let sm = semTitulo(label), tit = label;
      if (!label && ultSem) { sm = ultSem; tit = ultTit + " (sigue)" } else if (label) { ultSem = sm.key ? sm : null; ultTit = label }
      if (sm.key) {
        if (!cells.some(Boolean)) continue;
        if (!(sm.key in ordSem)) ordSem[sm.key] = Object.keys(ordSem).length;
        cur.filas.push({ key: sm.key, label: `${tit} (${sm.txt})`, cells, hrs, destino: null, o: 9000 + ordSem[sm.key], sem: sm });
        continue;
      }
      const cl = /12/.test(label) ? "12" : /8/.test(label) ? "8" : "0";
      if (cl !== clase) { run++; ord = 0; clase = cl }
      ord++;
      if (!cells.some(Boolean)) continue;
      cur.filas.push({ key: `r${run}.${ord}`, label: `Bloque ${run}, fila ${ord} · ${label || "(sin título)"}`, cells, hrs, destino: null, o: run * 100 + ord, run, ord });
    }
    return { formato: "Manual (Hoja1)", semanas: semanas.filter(s => s.filas.length), avisos, manual: true };
  }

  /* ---------- Personal: emparejar nombres con la Matriz base ---------- */
  const lev = (a, b) => { const d = [...Array(a.length + 1)].map((_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length] };
  const cedN = s => String(s || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  const umbral = n => (n.length <= 4 ? 1 : 2); // letras de diferencia que se toleran en un nombre mal escrito (Jeferson ≈ Jefferson)

  /* Si el mismo Excel trae la hoja PLANILLA (cédula, nombre completo), sirve de puente: nombre del horario → persona de la planilla → cédula → personal de RRHH */
  function parsePlanilla(wb) {
    for (const n of wb.SheetNames) {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: null });
      for (let r = 0; r < Math.min(aoa.length, 20); r++) {
        const row = (aoa[r] || []).map(nz), iC = row.findIndex(x => x.startsWith("CEDULA")), iN = row.findIndex(x => x.startsWith("NOMBRE Y APELLIDO") || x === "NOMBRE");
        if (iC < 0 || iN < 0) continue;
        const iI = row.findIndex(x => x.startsWith("INGRESO")), iS = row.findIndex(x => x.startsWith("SALARIO")), out = [];
        for (let q = r + 1; q < aoa.length; q++) {
          const w = aoa[q] || [], nom = String(w[iN] ?? "").trim(), ced = cedN(w[iC]); if (!nom || ced.length < 8) continue;
          const sal = iS >= 0 ? Number(String(w[iS] ?? "").replace(/[^0-9.]/g, "")) : 0;
          out.push({ nombre: nom, ced, cedula: String(w[iC]).trim().toUpperCase(), ingreso: iI >= 0 ? aFecha(w[iI], anioRef()) : null, salario: sal > 0 ? sal : null });
        }
        if (out.length) return out;
      }
    }
    return [];
  }
  const palabras = s => nz(s).split(" ").filter(w => w.length >= 3);
  function porPlanilla(n, ctx) {
    if (!ctx || !ctx.planilla || !ctx.planilla.length) return null;
    const pn = n.split(" ")[0], pri = p => nz(p.nombre).split(" ")[0];
    let c = ctx.planilla.filter(p => pri(p) === pn);
    if (!c.length) c = ctx.planilla.filter(p => palabras(p.nombre).includes(pn)); // "Michael" de "Elmer Michael Pérez"
    if (!c.length) { const d = ctx.planilla.map(p => ({ p, d: lev(pri(p), pn) })).filter(x => x.d <= umbral(pn)); if (d.length) { const mn = Math.min(...d.map(x => x.d)); c = d.filter(x => x.d === mn).map(x => x.p) } }
    if (c.length !== 1) return null;
    const p = c[0], a = S.agentes.find(x => x.cedula && cedN(x.cedula) === p.ced) || S.agentes.find(x => x.nombreCompleto && nz(x.nombreCompleto) === nz(p.nombre));
    return a ? { a, p } : null;
  }
  // La persona de tu Matriz base que corresponde a una línea de la hoja PLANILLA: por cédula, por nombre completo o por un nombre que solo encaje con una
  function agenteDePlanilla(p) {
    const porC = S.agentes.find(a => a.cedula && cedN(a.cedula) === p.ced) || S.agentes.find(a => a.nombreCompleto && nz(a.nombreCompleto) === nz(p.nombre));
    if (porC) return porC;
    const pri = nz(p.nombre).split(" ")[0], u = S.agentes.filter(a => nz(a.nombre) === pri);
    if (u.length === 1) return u[0];
    const w = palabras(p.nombre), v = S.agentes.filter(a => w.includes(nz(a.nombre)));
    return v.length === 1 ? v[0] : null;
  }
  // Datos de planilla que ya trae tu Excel y a tu personal le faltan (solo campos vacíos: nunca se pisa lo que ya está cargado)
  function datosPlanilla() {
    const out = [], vistos = new Set();
    (PLAN.planilla || []).forEach(p => {
      const a = agenteDePlanilla(p); if (!a || vistos.has(a.id)) return; vistos.add(a.id);
      const d = {};
      if (!a.cedula && p.cedula) d.cedula = p.cedula;
      if (!a.nombreCompleto) d.nombreCompleto = p.nombre;
      if (!a.ingreso && p.ingreso) d.ingreso = p.ingreso;
      if (!(Number(a.salario) > 0) && p.salario) d.salario = p.salario;
      if (Object.keys(d).length) out.push({ a, d });
    });
    return out;
  }
  function emparejar(nombre, semK, ctx) {
    const n = nz(nombre); if (!n) return { id: null, tipo: "vacio", cand: [] };
    const vig = S.agentes.filter(a => !semK || enSemana(a, semK)), pool = vig.length ? vig : S.agentes;
    const mem = ctx && ctx.memoria && ctx.memoria[n]; if (mem && agente(mem)) return { id: mem, tipo: "recordado", cand: [agente(mem)] };
    const ex = pool.filter(a => nz(a.nombre) === n);
    if (ex.length === 1) return { id: ex[0].id, tipo: "exacto", cand: ex };
    if (ex.length > 1) return { id: null, tipo: "ambiguo", cand: ex };
    const pp = porPlanilla(n, ctx); if (pp) return { id: pp.a.id, tipo: "cédula", nota: pp.p.nombre, cand: [pp.a] };
    const pn = n.split(" ")[0];
    const pr = pool.filter(a => nz(a.nombre).split(" ")[0] === pn || nz(a.nombreCompleto || "").split(" ")[0] === pn);
    if (pr.length === 1) return { id: pr[0].id, tipo: "primer nombre", cand: pr };
    if (pr.length > 1) return { id: null, tipo: "ambiguo", cand: pr };
    const tk = pool.filter(a => palabras((a.nombreCompleto || "") + " " + a.nombre).includes(pn));
    if (tk.length === 1) return { id: tk[0].id, tipo: "otro nombre de la persona", cand: tk };
    if (tk.length > 1) return { id: null, tipo: "ambiguo", cand: tk };
    const d = pool.map(a => ({ a, d: Math.min(lev(nz(a.nombre).split(" ")[0], pn), lev(nz(a.nombreCompleto || "x").split(" ")[0], pn)) })).filter(x => x.d <= umbral(pn));
    if (d.length) { const mn = Math.min(...d.map(x => x.d)), c = d.filter(x => x.d === mn).map(x => x.a); if (c.length === 1) return { id: c[0].id, tipo: "parecido", cand: c }; return { id: null, tipo: "ambiguo", cand: c } }
    return { id: null, tipo: "sin match", cand: [] };
  }

  const cargoP = a => (a.cargos || [])[0] || "sin cargo"; // el cargo que va primero es el de mayor prioridad
  const esGerente = a => /gerente/i.test(cargoP(a));
  // AM 12 h + PM 12 h el mismo día = turno de 24 h por falta de personal: es válido, no un error
  const es24 = (s, fids) => { const fs = fids.map(f => s.filas.find(x => x.id === f)); return fs.length === 2 && fs.every(f => f && pl(f.plantilla) && pl(f.plantilla).horas === 12) && new Set(fs.map(f => pl(f.plantilla).turno)).size === 2 };

  /* ---------- Destinos (caja + horario) ---------- */
  function destinosDisponibles() {
    const out = [];
    for (const caja of Object.keys(CAJAS)) for (const [pid, p] of Object.entries(S.cfg.plantillas)) if (cajasDe(pid).includes(caja)) out.push({ v: caja + "|" + pid, t: `${caja} · ${p.nombre} (${p.ini}–${p.fin})` });
    return out;
  }
  function destinoPorDefecto(plan, mapa) {
    // Solo para el formato manual: 12 h antes de las filas de 8 h = día; después = noche. Las de 8 h se reparten por el cargo de quien las cubre.
    const todas = []; plan.semanas.forEach(s => s.filas.forEach(f => { if (!todas.includes(f.key)) todas.push(f.key) }));
    const claves = todas.filter(k => !k.startsWith("s:")), dest = {};
    const cargoSem = k => { const cont = {}; plan.semanas.forEach(s => s.filas.filter(f => f.key === k).forEach(f => f.cells.forEach(nm => { const a = agente(mapa[nm]); if (a) { const c = (a.cargos || [])[0]; cont[c] = (cont[c] || 0) + 1 } }))); return Object.entries(cont).sort((x, y) => y[1] - x[1])[0]?.[0] };
    todas.filter(k => k.startsWith("s:")).forEach(k => {
      const m = /^s:(\d+)(AM|PM)?(M)?$/.exec(k), dur = +m[1], t = m[2], mb = !!m[3], g = cargoSem(k);
      if (dur === 12) dest[k] = mb ? "MBK|MBK12" : "Compra|" + t + "12";
      else if (dur === 9 || g === "Gerente de tienda" || g === "Gerente en entrenamiento") dest[k] = "Administración|ADM8";
      else if (g === "Conserje") dest[k] = "Conserjería|ADM8";
      else if (g === "Seguridad Interna") dest[k] = "Seguridad Interna|ADM8";
      else dest[k] = "MBK|" + t + "8";
    });
    const num = k => { const m = /^r(\d+)\.(\d+)$/.exec(k); return m ? +m[1] * 100 + +m[2] : 0 };
    claves.sort((a, b) => num(a) - num(b));
    const etiqueta = {}; plan.semanas.forEach(s => s.filas.forEach(f => { if (!etiqueta[f.key]) etiqueta[f.key] = f.label }));
    const lab = k => String(etiqueta[k] || "").split("·").pop(); // sin el número de fila
    const cls = k => (/12/.test(lab(k)) ? "12" : /8/.test(lab(k)) ? "8" : "0");
    const i8 = claves.map((k, i) => (cls(k) === "8" ? i : -1)).filter(i => i >= 0), primer8 = i8[0] ?? -1, ultimo8 = i8[i8.length - 1] ?? -1;
    const cargoDe = k => { const cont = {}; plan.semanas.forEach(s => s.filas.filter(f => f.key === k).forEach(f => f.cells.forEach(nm => { const a = agente(mapa[nm]); if (a) { const c = (a.cargos || [])[0]; cont[c] = (cont[c] || 0) + 1 } }))); return Object.entries(cont).sort((x, y) => y[1] - x[1])[0]?.[0] };
    let mbk = 0;
    claves.forEach((k, i) => {
      const c = cls(k);
      if (c === "12") dest[k] = primer8 < 0 || i < primer8 ? "Compra|AM12" : i > ultimo8 ? "Compra|PM12" : "MBK|MBK12"; // 12 h entre filas de 8 h = el MBK de 12 h
      else if (c === "8") {
        const g = cargoDe(k);
        if (g === "Gerente de tienda" || g === "Gerente en entrenamiento") dest[k] = "Administración|ADM8";
        else if (g === "Conserje") dest[k] = "Conserjería|ADM8";
        else if (g === "Seguridad Interna") dest[k] = "Seguridad Interna|ADM8";
        else dest[k] = (mbk++ % 2 === 0) ? "MBK|AM8" : "MBK|PM8"; // MBK de 8 h: la mañana y la tarde se alternan
      } else dest[k] = "";
    });
    // fila sin título con nombres: es un refuerzo de la fila de 12 h que tiene al lado (la de abajo, o la de arriba)
    claves.forEach((k, i) => { if (cls(k) === "0") { const sig = claves.slice(i + 1).find(x => cls(x) !== "0"), ant = claves.slice(0, i).reverse().find(x => cls(x) !== "0"); dest[k] = (sig && cls(sig) === "12" && dest[sig]) || (ant && cls(ant) === "12" && dest[ant]) || "" } });
    // Filas de 8 h sin AM/PM y filas sin título: la mañana o la tarde se decide mirando a las personas. Gana el turno que no choca con
    // otro turno de la misma persona el mismo día y que sigue su rutina (AM tras AM, PM tras PM); si no hay pistas, se queda la propuesta.
    const turnoDeDest = d => { const p = d && pl(d.split("|")[1]); return p ? p.turno : null };
    const idDe = c => (c && !IGNORAR.has(nz(c)) ? mapa[c] : null);
    const puntaje = (k, cand) => {
      let tot = 0; const t = turnoDeDest(cand);
      plan.semanas.forEach(w => { const f = w.filas.find(x => x.key === k); if (!f) return;
        f.cells.forEach((c, di) => { const id = idDe(c); if (!id) return;
          w.filas.forEach(g => { if (g.key === k || !dest[g.key]) return; const tg = turnoDeDest(dest[g.key]);
            if (idDe(g.cells[di]) === id) tot += 2;
            if (di > 0 && idDe(g.cells[di - 1]) === id) tot += tg === t ? -0.3 : (t === "AM" && tg === "PM" ? 1.5 : 0.5);
            if (di < 6 && idDe(g.cells[di + 1]) === id) tot += tg === t ? -0.3 : (t === "PM" && tg === "AM" ? 1.5 : 0.5) }) }) });
      return tot;
    };
    const mejorDe = (k, cands, ini) => { let mej = ini || cands[0], pm = puntaje(k, mej); cands.forEach(c => { const p = puntaje(k, c); if (p < pm - 0.01) { pm = p; mej = c } }); return mej };
    for (let vuelta = 0; vuelta < 2; vuelta++) claves.forEach(k => {
      if (/^MBK\|(AM|PM)8$/.test(dest[k] || "") && cls(k) === "8") dest[k] = mejorDe(k, ["MBK|AM8", "MBK|PM8"], dest[k]);
      else if (cls(k) === "0") dest[k] = mejorDe(k, ["Compra|AM12", "Compra|PM12"], dest[k] || "");
    });
    // lo que el usuario ya confirmó en una importación anterior manda sobre la propuesta
    const rec = (S.cfg && S.cfg.importDest) || {};
    todas.forEach(k => { const mk = k + "|" + nz(lab(k)); if (rec[mk]) dest[k] = rec[mk] });
    return dest;
  }

  /* ---------- Interfaz ---------- */
  let PLAN = null, MAPA = {}, DEST = {}, EDIT = new Set(), MANUAL = new Set(), AVISO = false;
  function abrir() {
    if (!window.XLSX) { toast("Conéctate a internet para leer el Excel."); return }
    const m = document.getElementById("modal"), sinP = !S.agentes.length;
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="iiT" style="width:min(580px,calc(100vw - 16px))"><header><h4 id="iiT">⬆ Importar horarios desde Excel</h4><p>Carga horarios que ya hiciste y RITMO los empareja con tu personal, sin armarlos celda por celda.</p></header>
      <div class="pad">
      ${sinP ? '<div class="banner"><div>⚠️</div><div><b>Aún no hay personal en tu Matriz base.</b> Primero confirma a las personas que RRHH cargó en tu tienda (o dalas de alta en la Matriz base) para que RITMO pueda emparejar los nombres.</div></div>' : ""}
      <p style="margin:0 0 6px"><b>Puedes importar:</b></p>
      <ul style="margin:0 0 10px 18px;padding:0"><li><b>La plantilla de RITMO</b>: Semana, Turno, Caja, Horario y los 7 días (la misma tabla que baja «Exportar Excel»).</li><li><b>Tu hoja manual de siempre</b>: bloques con LUNES … DOMINGO, la fecha debajo y filas TURNO 12HRS / TURNO 8HRS. Tú confirmas una vez a qué caja va cada fila.</li></ul>
      <p class="note" style="margin:0">¿Primera vez? Baja la plantilla: ya trae a tu personal y las próximas 4 semanas con sus fechas. Lo que ya tengas armado en esas semanas también viene escrito.</p></div>
      <footer><button class="btn" id="iiP" ${sinP ? "disabled" : ""}>⬇ Descargar plantilla con mi personal</button><button class="btn" id="iiX">Cancelar</button><button class="btn primary" id="iiF" ${sinP ? "disabled" : ""}>Elegir archivo…</button></footer></div>`;
    m.hidden = false;
    document.getElementById("iiX").onclick = cerrarModal;
    document.getElementById("iiP").onclick = plantilla;
    document.getElementById("iiF").onclick = elegir;
  }
  function elegir() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".xlsx,.xls"; inp.hidden = true; document.body.appendChild(inp);
    inp.onchange = async () => { const f = inp.files[0]; inp.remove(); if (f) await leer(f) };
    inp.click();
  }
  /* Plantilla con el personal de la tienda y las próximas 4 semanas (si ya hay horario guardado, viene escrito) */
  async function plantilla() {
    const turnoPM = f => (pl(f.plantilla).turno === "PM" ? 1 : 0);
    const hoy = lunes(new Date()), ref = Object.keys(S.semanas).filter(x => !S.semanas[x]._draft).sort().pop();
    const base = (ref ? S.semanas[ref].filas.filter(f => !f.refuerzo) : clone(DEF_FILAS)).sort((a, b) => turnoPM(a) - turnoPM(b));
    const aoa = [["RITMO · Matriz para importar horarios"], ["Escribe la fecha del lunes en la primera fila de cada semana y un nombre por celda. Impórtala en Mi horario con «⬆ Importar Excel»."], [], ["Semana (lunes)", "Turno", "Caja", "Horario", "Horas", ...DIAS, "Revisión"]];
    for (let w = 0; w < 4; w++) {
      const k = ymd(addDays(hoy, 7 * w)), s = S.semanas[k] && !S.semanas[k]._draft ? S.semanas[k] : null, filas = s ? s.filas.slice().sort((a, b) => turnoPM(a) - turnoPM(b)) : base;
      filas.forEach((f, i) => {
        const p = pl(f.plantilla), r = aoa.length + 1, cnt = `SUMPRODUCT((F${r}:L${r}<>"")*(COUNTIF(Personal!$A$2:$A$300,F${r}:L${r})=0))`;
        aoa.push([i === 0 ? { t: "d", v: parse(k), z: "dd/mm/yyyy" } : "", p.turno, f.caja, p.ini + "-" + p.fin, p.horas,
          ...[0, 1, 2, 3, 4, 5, 6].map(d => { const a = s && agente(s.asig[f.id + "|" + d]); return a ? a.nombre : "" }),
          { t: "s", v: "", f: `IF(COUNTA(F${r}:L${r})=0,"",IF(${cnt}=0,"OK",${cnt}&" sin personal"))` }]);
      });
    }
    const per = [["Nombre corto (como sale en el horario)", "Nombre completo", "Cargo"], ...S.agentes.filter(a => !a.baja || a.baja >= ymd(new Date())).sort((a, b) => a.nombre.localeCompare(b.nombre)).map(a => [a.nombre, a.nombreCompleto || "", (a.cargos || [])[0] || ""])];
    const wb = XLSX.utils.book_new(), w1 = XLSX.utils.aoa_to_sheet(aoa, { cellDates: true }), w2 = XLSX.utils.aoa_to_sheet(per);
    w1["!cols"] = [16, 8, 18, 14, 8, 12, 12, 12, 12, 12, 12, 12, 16].map(wch => ({ wch })); w2["!cols"] = [34, 38, 24].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(wb, w1, "Horarios"); XLSX.utils.book_append_sheet(wb, w2, "Personal");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array", cellDates: true }), fn = "Matriz_Importar_Horarios_" + (S.cfg.tienda || "RITMO").replace(/[^\w\-]+/g, "_").slice(0, 30) + ".xlsx";
    if (typeof DL !== "undefined" && DL) { try { await DL.save({ filename: fn, data: new Uint8Array(buf) }); toast("Plantilla lista.") } catch (e) { if (e && e.code !== "declined") toast("No se pudo guardar (" + (e.code || "error") + ").") } return }
    const url = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })), l = document.createElement("a");
    l.href = url; l.download = fn; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); toast("Plantilla descargada.");
  }
  async function leer(file) {
    if (!S.agentes.length) { toast("Primero carga el personal en la Matriz base."); return }
    try {
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      let plan = null, hoja = "";
      const orden = [...wb.SheetNames].sort((a, b) => (/horario|hoja1/i.test(b) ? 1 : 0) - (/horario|hoja1/i.test(a) ? 1 : 0));
      for (const n of orden) {
        const aoa = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: null });
        const p = parseMatriz(aoa) || parseManual(aoa);
        if (p && p.semanas.length) { plan = p; hoja = n; break }
      }
      if (!plan) { toast("No reconocí el formato. Usa la plantilla de RITMO o la hoja manual con LUNES … DOMINGO."); return }
      plan.hoja = hoja; plan.archivo = file.name; PLAN = plan; EDIT = new Set();
      // nombres → personal
      MAPA = {}; const nombres = new Set();
      plan.semanas.forEach(s => s.filas.forEach(f => f.cells.forEach(c => { if (!IGNORAR.has(nz(c)) && c) nombres.add(c) })));
      const semRef = plan.semanas[0].k;
      plan.planilla = parsePlanilla(wb); MANUAL = new Set(); AVISO = false;
      const ctx = plan.ctx = { planilla: plan.planilla, memoria: (S.cfg && S.cfg.importMapa) || {} };
      nombres.forEach(nm => { const e = emparejar(nm, semRef, ctx); MAPA[nm] = e.id; plan._tipos = plan._tipos || {}; plan._tipos[nm] = e });
      // destinos
      DEST = {};
      if (plan.manual) DEST = destinoPorDefecto(plan, MAPA);
      else plan.semanas.forEach(s => s.filas.forEach(f => { if (DEST[f.key] === undefined) DEST[f.key] = f.destino || "" }));
      mostrar();
    } catch (e) { console.error(e); toast("No se pudo leer el Excel: " + (e.message || e)) }
  }
  function mostrar() {
    const m = document.getElementById("modal"), P = PLAN, dst = destinosDisponibles();
    const claves = []; P.semanas.forEach(s => s.filas.forEach(f => { if (!claves.some(c => c.key === f.key)) claves.push({ key: f.key, label: f.label, o: f.o, ej: f.cells.filter(Boolean).slice(0, 3).join(", ") }) }));
    if (P.manual) claves.sort((a, b) => a.o - b.o);
    const nombres = Object.keys(MAPA).sort((a, b) => (MAPA[a] ? 1 : 0) - (MAPA[b] ? 1 : 0) || a.localeCompare(b));
    const total = P.semanas.reduce((s, w) => s + w.filas.reduce((x, f) => x + f.cells.filter(c => c && MAPA[c] !== undefined).length, 0), 0);
    const existentes = P.semanas.filter(w => S.semanas[w.k] && !S.semanas[w.k]._draft && Object.keys(S.semanas[w.k].asig || {}).length);
    const optA = id => S.agentes.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).map(a => `<option value="${a.id}" ${a.id === id ? "selected" : ""}>${esc(a.nombre)} (${esc(cargoP(a))})</option>`).join(""); // solo el primer nombre y su cargo principal
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ihT" style="width:min(1000px,calc(100vw - 16px));max-height:92vh;display:flex;flex-direction:column">
      <header><h4 id="ihT">⬆ Importar horarios desde Excel</h4><p>${esc(P.archivo)} · hoja <b>${esc(P.hoja)}</b> · formato <b>${esc(P.formato)}</b> · ${P.semanas.length} semana${P.semanas.length > 1 ? "s" : ""}: ${P.semanas.map(w => fmtRango(w.k)).join(" · ")}</p></header>
      <div class="pad" style="overflow:auto;flex:1">
      ${P.avisos.length ? `<div class="banner"><div>⚠️</div><div>${P.avisos.slice(0, 6).map(esc).join("<br>")}</div></div>` : ""}
      <h5 style="margin:10px 0 4px">1 · ¿A qué fila del horario va cada fila del Excel?</h5>
      <p class="note" style="margin:0 0 6px">${P.manual ? "El Excel manual solo dice 12 h u 8 h. Elige la caja y el horario de cada fila; ya dejé una propuesta. Aplica a todas las semanas." : "Tomé la Caja y el Horario de tu Excel. Revisa los que quedaron sin destino."}</p>
      <div class="scroll"><table class="formtable ih-t"><thead><tr><th>Fila del Excel</th><th>Ejemplo</th><th>Va a</th></tr></thead><tbody>
      ${claves.map(c => `<tr><td>${esc(c.label)}</td><td style="font-size:12px;color:var(--muted)">${esc(c.ej)}</td><td><select class="in" style="font-size:12px;min-width:230px" data-dest="${esc(c.key)}"><option value="">— No importar —</option>${dst.map(d => `<option value="${esc(d.v)}" ${DEST[c.key] === d.v ? "selected" : ""}>${esc(d.t)}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div>
      <h5 style="margin:14px 0 4px">2 · Personal: <span id="ihVinc"></span></h5>
      <p class="note" style="margin:0 0 6px">RITMO compara cada nombre del Excel con el personal que RRHH cargó y tú ya tienes en tu Matriz base${P.planilla && P.planilla.length ? ` y con la hoja PLANILLA de tu archivo (${P.planilla.length} personas con cédula)` : ""}. <b>El horario es lo que alimenta la planilla:</b> quien no quede vinculado no tendrá turnos en el horario y la planilla no le contará horas extra, feriados ni novedades.</p>
      <div class="scroll"><table class="formtable ih-t"><thead><tr><th>Nombre en el Excel</th><th>Estado</th><th>Persona de tu personal</th></tr></thead><tbody>
      ${nombres.map(n => `<tr><td><b>${esc(n)}</b></td><td style="font-size:12px;white-space:normal;min-width:200px;max-width:340px" data-est="${esc(n)}"></td><td><select class="in" style="min-width:200px" data-nom="${esc(n)}"><option value="">— Ignorar —</option>${optA(MAPA[n])}</select></td></tr>`).join("")}</tbody></table></div>
      <h5 style="margin:14px 0 4px">3 · Tu personal frente al horario</h5>
      <div id="ihSin"></div>
      ${P.semanas.some(w => Object.keys(w.resumen || {}).length) ? `<h5 style="margin:14px 0 4px">4 · Control contra la tabla NOMBRE · TURNOS de tu Excel</h5><div id="ihCtl"></div>` : ""}
      ${(() => { const dp = datosPlanilla(); if (!dp.length) return ""; const c = k => dp.filter(x => x.d[k] !== undefined).length, partes = [["salario", "salario"], ["cedula", "cédula"], ["nombreCompleto", "nombre completo"], ["ingreso", "fecha de ingreso"]].filter(([k]) => c(k)).map(([k, t]) => `${t} de ${c(k)}`);
        return `<h5 style="margin:14px 0 4px">5 · Datos de planilla que ya trae tu Excel</h5><label class="radio"><input type="checkbox" id="ihDatCk" checked><span><b>Completar mi Matriz base y mi Planilla con la hoja PLANILLA de este Excel</b><br><small>Se agregaría: ${partes.join(" · ")}. Solo se llenan los campos vacíos; lo que ya tienes cargado no se toca. Después puedes corregirlo en Matriz base o en Planilla.</small></span></label>` })()}
      <label class="radio" style="margin-top:12px"><input type="checkbox" id="ihRep" ${existentes.length ? "" : "disabled"}><span><b>Reemplazar semanas que ya tienen horario</b><br><small>${existentes.length ? `Ya tienen asignaciones: ${existentes.map(w => fmtRango(w.k)).join(", ")}. Si no marcas esto, se omiten.` : "Ninguna de estas semanas tiene horario todavía."}</small></span></label>
      <p id="ihRes" class="note" style="margin-top:10px"></p></div>
      <footer><button class="btn" id="ihX">Cancelar</button><button class="btn primary" id="ihOK">Importar</button></footer></div>`;
    m.hidden = false;
    m.querySelectorAll("[data-dest]").forEach(s => s.onchange = () => { DEST[s.dataset.dest] = s.value; EDIT.add(s.dataset.dest); resumen() });
    m.querySelectorAll("[data-nom]").forEach(s => s.onchange = () => {
      MAPA[s.dataset.nom] = s.value || null; MANUAL.add(s.dataset.nom); AVISO = false;
      if (PLAN.manual) { // al emparejar a las personas, la propuesta de caja/horario mejora (gerente → Administración, etc.); no pisa lo que ya elegiste
        const nd = destinoPorDefecto(PLAN, MAPA);
        m.querySelectorAll("[data-dest]").forEach(x => { const k = x.dataset.dest; if (!EDIT.has(k) && nd[k] !== undefined) { DEST[k] = nd[k]; x.value = nd[k] } });
      }
      resumen();
    });
    document.getElementById("ihX").onclick = () => { cerrarModal(); PLAN = null };
    document.getElementById("ihOK").onclick = () => {
      const c = conteo(), st = sinTurnos();
      if ((c.sin || st.length) && !AVISO) { AVISO = true; resumen(); return } // primera vez: avisa qué quedará sin vincular
      aplicar();
    };
    resumen();
  }
  function conteo() {
    let n = 0, sin = 0, fuera = 0;
    PLAN.semanas.forEach(w => w.filas.forEach(f => { if (!DEST[f.key]) return; f.cells.forEach((c, d) => { if (!c || IGNORAR.has(nz(c))) return; const a = agente(MAPA[c]); if (!a) { sin++; return } if (!vigente(a, addDays(parse(w.k), d))) { fuera++; return } n++ }) }));
    return { n, sin, fuera };
  }
  // personal vigente en alguna semana del archivo que no queda con ningún turno (sin turnos: la planilla no le contaría horas extra, feriados ni novedades)
  function sinTurnos() {
    const con = new Set();
    PLAN.semanas.forEach(w => w.filas.forEach(f => { if (!DEST[f.key]) return; f.cells.forEach(c => { if (c && MAPA[c]) con.add(MAPA[c]) }) }));
    return S.agentes.filter(a => !con.has(a.id) && PLAN.semanas.some(w => [0, 1, 2, 3, 4, 5, 6].some(d => vigente(a, addDays(parse(w.k), d)))));
  }
  // Compara la tabla NOMBRE · TURNOS que trae el Excel con lo que RITMO va a cargar (turnos o días trabajados, lo que coincida)
  function controlHTML() {
    const filas = []; let tot = 0, ok = 0;
    PLAN.semanas.forEach(w => {
      const R = w.resumen || {}; if (!Object.keys(R).length) return;
      const cel = {}, dias = {}, hor = {};
      w.filas.forEach(f => { const dp = DEST[f.key]; if (!dp) return; const hp = (pl(dp.split("|")[1]) || {}).horas || 0; f.cells.forEach((c, d) => { const id = c && !IGNORAR.has(nz(c)) ? MAPA[c] : null; if (!id) return; cel[id] = (cel[id] || 0) + 1; hor[id] = (hor[id] || 0) + ((f.hrs && f.hrs[d]) || hp); (dias[id] = dias[id] || new Set()).add(d) }) });
      Object.entries(R).forEach(([nm, v]) => {
        const id = MAPA[nm] !== undefined ? MAPA[nm] : emparejar(nm, w.k, PLAN.ctx).id, c = id ? cel[id] || 0 : 0, dd = id ? (dias[id] ? dias[id].size : 0) : 0, hh = id ? hor[id] || 0 : 0;
        // El «TURNOS» de muchos Excel no son días: son turnos pagados (horas ÷ 12, o ÷ 8 en los de 8 h). Cualquiera de las lecturas que coincida vale.
        tot++; if (v.turnos === c || v.turnos === dd || Math.abs(v.turnos - hh / 12) <= 0.26 || Math.abs(v.turnos - hh / 8) <= 0.26) ok++;
        else {
          const sinD = id ? w.filas.reduce((x, f) => x + (DEST[f.key] ? 0 : f.cells.filter(z => z && MAPA[z] === id).length), 0) : 0;
          filas.push({ k: w.k, nm, xl: v.turnos, ri: dd, causa: !id ? "Su nombre no está vinculado a tu personal" : sinD ? `Tiene ${sinD} celda${sinD > 1 ? "s" : ""} en filas sin destino (arriba, sección 1)` : !c ? "No aparece en el horario esa semana (¿subsidio, vacaciones o baja?)" : "El horario de tu Excel no suma lo que dice su propia tabla: revísalo" });
        }
      });
    });
    if (!tot) return "";
    const cab = `<p class="note" style="margin:0 0 6px">Tu Excel trae una tabla de turnos por persona al lado de cada semana. RITMO la usa para revisar su carga: <b style="color:var(--ok,#1d7f48)">✔ ${ok} de ${tot}</b> coinciden${filas.length ? ` · <b style="color:var(--bad,#b3261e)">${filas.length} no coinciden</b>` : ""}.</p>`;
    if (!filas.length) return cab;
    return cab + `<div class="scroll"><table class="formtable"><thead><tr><th>Semana</th><th>Persona</th><th>Tu Excel dice</th><th>RITMO cargará</th><th>Posible causa</th></tr></thead><tbody>${filas.slice(0, 14).map(x => `<tr><td>${esc(fmtCorta(parse(x.k)))}</td><td><b>${esc(x.nm)}</b></td><td>${x.xl}</td><td style="color:var(--bad,#b3261e)"><b>${x.ri}</b></td><td style="font-size:12px">${esc(x.causa)}</td></tr>`).join("")}</tbody></table></div>${filas.length > 14 ? `<p class="note">…y ${filas.length - 14} más.</p>` : ""}`;
  }
  function resumen() {
    const c = conteo(), el = document.getElementById("ihRes"); if (!el) return;
    const nombres = Object.keys(MAPA), sinV = nombres.filter(n => !MAPA[n]), st = sinTurnos();
    document.querySelectorAll("[data-est]").forEach(td => {
      const n = td.dataset.est, e = PLAN._tipos[n], ok = !!MAPA[n];
      const via = MANUAL.has(n) ? "emparejado a mano" : (e ? e.tipo : "");
      td.innerHTML = ok ? `<span style="color:var(--ok,#1d7f48)">✔ Vinculado</span> · ${esc(via)}` : `<span style="color:var(--bad,#b3261e)"><b>✖ Sin vincular.</b> No coincidió con el personal que cargó RRHH${e && e.tipo === "ambiguo" ? " (hay varias personas parecidas)" : ""}. Sin turnos, la planilla no le contará horas extra, feriados ni novedades.</span>`;
    });
    const vi = document.getElementById("ihVinc"); if (vi) vi.innerHTML = `${nombres.length - sinV.length} de ${nombres.length} vinculados${sinV.length ? ` · <span style="color:var(--bad,#b3261e)">${sinV.length} sin vincular</span>` : ""}`;
    const sn = document.getElementById("ihSin");
    if (sn) sn.innerHTML = st.length ? `<div class="banner"><div>⚠️</div><div><b>${st.length} persona${st.length > 1 ? "s" : ""} de tu Matriz base no aparece${st.length > 1 ? "n" : ""} en ningún turno del Excel:</b> ${st.map(a => esc(a.nombre)).join(", ")}.<br><small>Si trabajaron esas semanas, empareja su nombre arriba; de lo contrario quedarán sin turnos y la planilla no les contará horas extra, feriados ni novedades.${st.some(esGerente) ? " El gerente también debe aparecer en el horario de RITMO, aunque firme la planilla." : ""}</small></div></div>` : `<p class="note">✔ Todo tu personal vigente tiene turnos en el archivo.</p>`;
    el.innerHTML = `Se importarán <b>${c.n}</b> turnos.${c.sin ? ` <span style="color:var(--bad,#b3261e)">${c.sin} celdas se omiten por nombres sin emparejar.</span>` : ""}${c.fuera ? ` ${c.fuera} se omiten porque la persona no estaba vigente ese día (antes de su ingreso o después de su baja).` : ""}${AVISO && (c.sin || st.length) ? `<br><b style="color:var(--bad,#b3261e)">Hay personas sin vincular o sin turnos: no alimentarán la planilla. Pulsa «Importar» otra vez para continuar de todos modos y corregirlo después en la web, o empareja arriba.</b>` : ""}`;
    const ct = document.getElementById("ihCtl"); if (ct) ct.innerHTML = controlHTML();
    const es = especiales(); if (es.n) el.innerHTML += `<br>🕒 ${es.n} celda${es.n > 1 ? "s" : ""} traen horas anotadas (${es.hs.map(h => h + " h").join(", ")}), como «Paola 16hrs». RITMO las toma como horas trabajadas y crea el horario <b>«RITMO Turno ${es.hs[0]} h»</b> en tu tienda para registrarlas.`;
    document.getElementById("ihOK").disabled = !c.n;
  }
  /* ---------- Alertas de conflictos de la carga ----------
     Cada semana importada guarda `importPend`: celdas que no se pudieron cargar y dobles turnos. Siguen avisando en el horario
     hasta que el usuario las corrige (la alerta se quita sola cuando la celda queda asignada o el doble turno desaparece). */
  const diaTxt = (k, d) => `${DIAS[d]} ${fmtCorta(addDays(parse(k), d))}`;
  function filaTxt(s, fid) { const f = s.filas.find(x => x.id === fid); return f ? `${f.caja} · ${pl(f.plantilla).nombre}` : "una fila" }
  function pendActivos(k, s) {
    s = s || S.semanas[k]; const out = []; if (!s || !Array.isArray(s.importPend)) return out;
    s.importPend.forEach(p => {
      if (p.m === "turnos0") { if (!Object.values(s.asig || {}).includes(p.aid)) { const a = agente(p.aid); if (a) out.push({ sev: "warn", txt: esGerente(a) ? `${a.nombre} (${cargoP(a)}) no está en el horario de esta semana. En RITMO el gerente también debe aparecer en el horario, aunque firme la planilla: sin turnos la planilla no le contará horas extra, feriados ni novedades.` : `${a.nombre} no tiene ningún turno en esta semana. Sin turnos, la planilla no le contará horas extra, feriados ni novedades. Si trabajó, asígnalo en el horario (o revisa que su nombre del Excel coincida con RRHH).` }) } return }
      if (p.m === "doble") {
        if (es24(s, p.fids)) return; const n = Object.keys(s.asig || {}).filter(x => x.endsWith("|" + p.d) && s.asig[x] === p.aid).length; if (n >= 2) { const a = agente(p.aid); out.push({ sev: "warn", txt: `${a ? a.nombre : "Una persona"} tiene ${n} turnos el ${diaTxt(k, p.d)} (${p.fids.map(f => filaTxt(s, f)).join(" y ")}). Deja solo uno.` }) } return }
      if (s.asig && s.asig[p.fid + "|" + p.d]) return;
      out.push({ sev: "bad", txt: p.m === "vig" ? `${diaTxt(k, p.d)} · ${filaTxt(s, p.fid)}: «${p.nom}» no estaba vigente ese día (revisa su fecha de alta o baja) y quedó vacío. Asigna a otra persona.` : `${diaTxt(k, p.d)} · ${filaTxt(s, p.fid)}: «${p.nom}» no coincidió con el personal de RRHH y quedó vacío: esa persona no sumará turnos, horas extra ni feriados en la planilla. Asigna la celda a su persona en la Matriz base.` });
    });
    return out;
  }
  function bannerPend(k) {
    const L = pendActivos(k); if (!L.length) return "";
    return `<div class="banner"><div>📥</div><div><b>Importación de Excel: ${L.length} cosa${L.length > 1 ? "s" : ""} por corregir en esta semana.</b><br>${L.slice(0, 8).map(x => esc(x.txt)).join("<br>")}${L.length > 8 ? `<br>…y ${L.length - 8} más.` : ""}<br><small>Estos avisos se quitan solos cuando lo corriges.</small></div></div>`;
  }

  // Crea (una sola vez) el horario «RITMO Turno N h» en los horarios de la tienda; nace del Excel y se puede editar o borrar en Administración.
  function horarioRitmo(h, pid, reg) {
    const b = pl(pid), id = "RITMO" + String(h).replace(".", "_") + b.turno;
    if (!S.cfg.plantillas[id]) {
      const [hh, mm] = b.ini.split(":").map(Number), f = (hh * 60 + mm + Math.round(h * 60)) % 1440;
      S.cfg.plantillas[id] = { nombre: `RITMO Turno ${h} h · ${b.turno}`, turno: b.turno, ini: b.ini, fin: pad2(Math.floor(f / 60)) + ":" + pad2(f % 60), horas: h, confirmado: true, custom: true, ritmo: true, cajas: Object.keys(CAJAS) };
    }
    if (reg && !reg[id]) reg[id] = { nombre: S.cfg.plantillas[id].nombre, n: 0 };
    return id;
  }
  // celdas con horas anotadas que no son las del horario elegido (vista previa para el diálogo)
  function especiales() {
    let n = 0; const hs = new Set();
    PLAN.semanas.forEach(w => w.filas.forEach(f => { const d = DEST[f.key]; if (!d || !f.hrs) return; const bp = pl(d.split("|")[1]); f.hrs.forEach((h, i) => { if (h && bp && f.cells[i] && Math.abs(h - bp.horas) > 0.01 && MAPA[f.cells[i]]) { n++; hs.add(h) } }) }));
    return { n, hs: [...hs].sort((a, b) => a - b) };
  }
  function aplicar() {
    const P = PLAN, rep = document.getElementById("ihRep").checked, hechas = [], omit = [], cerr = [], sinDest = [];
    let turnos = 0, vacias = 0; const ritmo = {}, d24 = [];
    for (const w of P.semanas) {
      const k = w.k, ex = S.semanas[k] && !S.semanas[k]._draft && Object.keys(S.semanas[k].asig || {}).length;
      if (semanaCerrada(k)) { cerr.push(k); continue }
      if (ex && !rep) { omit.push(k); continue }
      if (S.semanas[k]) SNAP[k] = clone(S.semanas[k]);
      const s = semanaDe(k, true); s.asig = {}; const usadas = {}, pend = [];
      if (ex) s.filas = s.filas.filter(x => !x.refuerzo); // al reemplazar, se quitan los refuerzos de la importación anterior
      for (const f of w.filas) {
        const d = DEST[f.key];
        if (!d) { const n = f.cells.filter(c => c && !IGNORAR.has(nz(c))).length; if (n) sinDest.push({ k, label: f.label, n }); continue }
        const [caja, pid] = d.split("|"), i = usadas[d] || 0; usadas[d] = i + 1;
        const cand = s.filas.filter(x => x.caja === caja && x.plantilla === pid && !x.refuerzo);
        let fila = cand[i];
        if (!fila) { fila = { id: "i" + Math.random().toString(36).slice(2, 8), caja, plantilla: pid, refuerzo: true }; s.filas.push(fila) }
        f.cells.forEach((c, di) => {
          if (!c || IGNORAR.has(nz(c))) return;
          const a = agente(MAPA[c]);
          if (!a) { pend.push({ m: "sin", fid: fila.id, d: di, nom: c }); vacias++; return }
          if (!vigente(a, addDays(parse(k), di))) { pend.push({ m: "vig", fid: fila.id, d: di, nom: c }); vacias++; return }
          const hh = f.hrs && f.hrs[di], bp = pl(pid);
          if (hh && bp && Math.abs(hh - bp.horas) > 0.01) { // "Paola 16hrs": trabajó otras horas, se asigna a un horario propio «RITMO Turno 16 h»
            const nid = horarioRitmo(hh, pid, ritmo);
            let fx = s.filas.find(x => x.caja === caja && x.plantilla === nid && !s.asig[x.id + "|" + di]);
            if (!fx) { fx = { id: "i" + Math.random().toString(36).slice(2, 8), caja, plantilla: nid, refuerzo: true }; s.filas.push(fx) }
            s.asig[fx.id + "|" + di] = a.id; turnos++; ritmo[nid].n++; return;
          }
          if (fila.dias && !fila.dias.includes(di)) fila.dias.push(di);
          s.asig[fila.id + "|" + di] = a.id; turnos++;
        });
      }
      // doble turno el mismo día (la misma persona en dos filas)
      for (let di = 0; di < 7; di++) { const por = {}; Object.keys(s.asig).filter(x => x.endsWith("|" + di)).forEach(x => (por[s.asig[x]] = por[s.asig[x]] || []).push(x.split("|")[0])); Object.entries(por).forEach(([aid, fids]) => { if (fids.length > 1) { if (es24(s, fids)) d24.push({ aid, k, d: di }); else pend.push({ m: "doble", aid, d: di, fids }) } }) }
      S.agentes.forEach(a => { if (!Object.values(s.asig).includes(a.id) && [0, 1, 2, 3, 4, 5, 6].some(d => vigente(a, addDays(parse(k), d)))) pend.push({ m: "turnos0", aid: a.id }) });
      s.importPend = pend; s.extra = s.extra !== false; tocarSemana(k); hechas.push(k);
    }
    // memoria: los emparejamientos hechos a mano se recuerdan para la próxima importación
    if (MANUAL.size && S.cfg) { S.cfg.importMapa = S.cfg.importMapa || {}; MANUAL.forEach(n => { if (MAPA[n]) S.cfg.importMapa[nz(n)] = MAPA[n] }); try { persist("base/config") } catch (e) { } }
    const ck = document.getElementById("ihDatCk"), datos = ck && ck.checked ? datosPlanilla() : [];
    if (datos.length) { datos.forEach(x => Object.assign(x.a, x.d)); try { persist("base/agentes") } catch (e) { } }
    if (Object.keys(ritmo).length) { try { persist("base/config") } catch (e) { } }
    cerrarModal();
    if (hechas.length) { S.semana = hechas[0]; S.tab = "horario"; render() }
    informe({ turnos, hechas, omit, cerr, sinDest, vacias, ritmo, d24, datos });
    PLAN = null;
  }
  function informe(R) {
    const m = document.getElementById("modal"), act = R.hechas.flatMap(k => pendActivos(k).map(x => ({ k, ...x })));
    const rangos = a => a.map(fmtRango).join(" · ");
    const sec = (tit, ok, items) => items.length ? `<div class="banner ${ok ? "info" : ""}"><div>${ok ? "ℹ️" : "⚠️"}</div><div><b>${tit}</b><br>${items.join("<br>")}</div></div>` : "";
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ifT" style="width:min(720px,calc(100vw - 16px));max-height:90vh;display:flex;flex-direction:column">
      <header><h4 id="ifT">${R.hechas.length ? "✅ Importación lista" : "No se importó nada"}</h4><p>${R.hechas.length ? `<b>${R.turnos}</b> turnos cargados en ${R.hechas.length} semana${R.hechas.length > 1 ? "s" : ""}: ${rangos(R.hechas)}.` : "Revisa los motivos de abajo."}</p></header>
      <div class="pad" style="overflow:auto;flex:1">
      ${sec(`Por corregir en la web (${act.length})`, false, act.slice(0, 14).map(x => esc(x.txt)).concat(act.length > 14 ? [`…y ${act.length - 14} más. Las verás como aviso en cada semana.`] : []))}
      ${sec("Horarios que RITMO creó a partir de las horas anotadas en tu Excel", true, Object.values(R.ritmo || {}).map(x => `«${esc(x.nombre)}»: ${x.n} turno${x.n > 1 ? "s" : ""}. Lo ves y puedes editarlo en Administración › Horarios.`))}
      ${sec("¡Turno de 24 hrs! (AM 12 h + PM 12 h el mismo día) se cargaron tal cual; el generador nunca los propone, confirma que el GT los autorizó", false, (() => { const g = {}; (R.d24 || []).forEach(x => (g[x.aid] = g[x.aid] || []).push(diaTxt(x.k, x.d))); return Object.entries(g).map(([aid, ds]) => `${esc((agente(aid) || {}).nombre || "?")}: ${ds.length} día${ds.length > 1 ? "s" : ""} (${ds.slice(0, 4).join(", ")}${ds.length > 4 ? "…" : ""})`) })())}
      ${sec("Datos de planilla completados desde tu Excel", true, (R.datos || []).length ? [`${R.datos.length} persona${R.datos.length > 1 ? "s" : ""} con datos nuevos (${[["salario", "salario"], ["cedula", "cédula"], ["nombreCompleto", "nombre completo"], ["ingreso", "ingreso"]].filter(([k]) => R.datos.some(x => x.d[k] !== undefined)).map(([k, t]) => `${t}: ${R.datos.filter(x => x.d[k] !== undefined).length}`).join(", ")}). Revísalos en Matriz base y Planilla.`] : [])}
      ${sec("Filas del Excel sin destino (no se importaron)", false, R.sinDest.map(x => `${esc(fmtRango(x.k))} · ${esc(x.label)}: ${x.n} nombre${x.n > 1 ? "s" : ""}`))}
      ${sec("Semanas que ya tenían horario y se omitieron", true, R.omit.length ? [rangos(R.omit) + ". Vuelve a importar marcando «Reemplazar» si quieres sobrescribirlas."] : [])}
      ${sec("Semanas cerradas (no se tocaron)", false, R.cerr.length ? [rangos(R.cerr) + ". Solo tu GZ puede reabrirlas."] : [])}
      ${!act.length && !R.sinDest.length && !R.omit.length && !R.cerr.length ? '<div class="banner info"><div>✔️</div><div>No hay conflictos de carga. Revisa las alertas normales del horario (descansos, horas y cobertura) antes de entregar.</div></div>' : ""}
      <p class="note">Los avisos de la carga se quedan en el horario hasta que los corrijas, y la ayuda de siempre (bloqueos, horas extra, cobertura) sigue funcionando sobre lo importado.</p></div>
      <footer><button class="btn primary" id="ifOK">Ver el horario</button></footer></div>`;
    m.hidden = false; document.getElementById("ifOK").onclick = cerrarModal;
  }
  return { abrir, leer, alertas: pendActivos, banner: bannerPend, _aFecha: aFecha, _parseManual: parseManual, _parseMatriz: parseMatriz, _emparejar: emparejar };
})();
