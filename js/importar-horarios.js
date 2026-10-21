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
      const cells = cols.dias.map(i => String(row[i] ?? "").trim());
      if (!cells.some(Boolean)) continue; // fila sin nombres: nada que importar
      if (!caja) { avisos.push(`Fila ${r + 1}: la Caja "${row[cols.iC] ?? ""}" no es válida (Compra, MBK, Administración, Inducción, Conserjería, Seguridad Interna).`); continue }
      const turno = nz(row[cols.iT]);
      cur.filas.push({ key: caja + "|" + String(horario ?? "").trim(), label: `${caja} · ${String(horario ?? "").trim()}${turno ? " · " + turno : ""}`, cells, destino: resolverDestino(caja, horario), refuerzo: /REFUERZO/.test(turno) });
    }
    semanas.forEach(w => { const c = {}; w.filas.forEach(f => { c[f.key] = (c[f.key] || 0) + 1 }); const rep = Object.entries(c).filter(([, n]) => n > 3); if (rep.length) avisos.push(`La semana ${w.k} tiene ${rep[0][1]} filas con el mismo horario y caja (${rep[0][0].replace("|", " · ")}). ¿Falta la fecha del lunes en algún bloque?`) });
    return { formato: "Matriz RITMO", semanas: semanas.filter(s => s.filas.some(f => f.cells.some(Boolean))), avisos, manual: false };
  }

  /* ---------- Formato manual (Hoja1) ---------- */
  function parseManual(aoa) {
    const semanas = [], avisos = []; let cur = null, base = -1, c0 = -1, run = 0, ord = 0, clase = null;
    const esHdr = row => { const r = (row || []).map(nz); for (let c = 0; c < r.length - 6; c++) if (r[c] === "LUNES" && r[c + 1] === "MARTES" && r[c + 6] === "DOMINGO") return c; return -1 };
    for (let r = 0; r < aoa.length; r++) {
      const c = esHdr(aoa[r]);
      if (c >= 0) {
        c0 = c; base = r;
        const f = aFecha((aoa[r + 1] || [])[c], anioRef()) || aFecha((aoa[r][c]), anioRef());
        if (!f) { avisos.push(`Fila ${r + 1}: no encontré la fecha del lunes debajo de LUNES.`); cur = null; continue }
        const k = aLunes(f); if (f !== k) avisos.push(`La fecha ${f} no es lunes; se usó el lunes ${k}.`);
        cur = { k, filas: [] }; semanas.push(cur); run = 0; ord = 0; clase = null; continue;
      }
      if (!cur || r <= base + 1) continue;
      const row = aoa[r] || [], cells = [...Array(7)].map((_, d) => String(row[c0 + d] ?? "").trim()), label = c0 > 0 ? nz(row[c0 - 1]) : "";
      // Las semanas no siempre tienen las mismas filas, así que cada fila se identifica por su bloque (filas seguidas de 12 h, de 8 h o sin título)
      // y por su orden dentro del bloque, contando también las filas vacías.
      const cl = /12/.test(label) ? "12" : /8/.test(label) ? "8" : "0";
      if (cl !== clase) { run++; ord = 0; clase = cl }
      ord++;
      if (!cells.some(Boolean)) continue;
      cur.filas.push({ key: `r${run}.${ord}`, label: `Bloque ${run}, fila ${ord} · ${label || "(sin título)"}`, cells, destino: null, o: run * 100 + ord, run, ord });
    }
    return { formato: "Manual (Hoja1)", semanas: semanas.filter(s => s.filas.length), avisos, manual: true };
  }

  /* ---------- Personal: emparejar nombres con la Matriz base ---------- */
  function emparejar(nombre, semK) {
    const n = nz(nombre); if (!n) return { id: null, tipo: "vacio", cand: [] };
    const vig = S.agentes.filter(a => !semK || enSemana(a, semK)), pool = vig.length ? vig : S.agentes;
    const ex = pool.filter(a => nz(a.nombre) === n);
    if (ex.length === 1) return { id: ex[0].id, tipo: "exacto", cand: ex };
    if (ex.length > 1) return { id: null, tipo: "ambiguo", cand: ex };
    const pn = n.split(" ")[0];
    const pr = pool.filter(a => nz(a.nombre).split(" ")[0] === pn || nz(a.nombreCompleto || "").split(" ")[0] === pn);
    if (pr.length === 1) return { id: pr[0].id, tipo: "primer nombre", cand: pr };
    if (pr.length > 1) return { id: null, tipo: "ambiguo", cand: pr };
    return { id: null, tipo: "sin match", cand: [] };
  }

  /* ---------- Destinos (caja + horario) ---------- */
  function destinosDisponibles() {
    const out = [];
    for (const caja of Object.keys(CAJAS)) for (const [pid, p] of Object.entries(S.cfg.plantillas)) if (cajasDe(pid).includes(caja)) out.push({ v: caja + "|" + pid, t: `${caja} · ${p.nombre} (${p.ini}–${p.fin})` });
    return out;
  }
  function destinoPorDefecto(plan, mapa) {
    // Solo para el formato manual: 12 h antes de las filas de 8 h = día; después = noche. Las de 8 h se reparten por el cargo de quien las cubre.
    const claves = []; plan.semanas.forEach(s => s.filas.forEach(f => { if (!claves.includes(f.key)) claves.push(f.key) }));
    const num = k => { const m = /^r(\d+)\.(\d+)$/.exec(k); return m ? +m[1] * 100 + +m[2] : 0 };
    claves.sort((a, b) => num(a) - num(b));
    const etiqueta = {}; plan.semanas.forEach(s => s.filas.forEach(f => { if (!etiqueta[f.key]) etiqueta[f.key] = f.label }));
    const lab = k => String(etiqueta[k] || "").split("·").pop(); // sin el número de fila
    const hay8 = k => /8/.test(lab(k)) && !/12/.test(lab(k));
    const primer8 = claves.findIndex(hay8);
    const cargoDe = k => { const cont = {}; plan.semanas.forEach(s => s.filas.filter(f => f.key === k).forEach(f => f.cells.forEach(nm => { const a = agente(mapa[nm]); if (a) { const c = (a.cargos || [])[0]; cont[c] = (cont[c] || 0) + 1 } }))); return Object.entries(cont).sort((x, y) => y[1] - x[1])[0]?.[0] };
    const dest = {}; let mbk = 0;
    claves.forEach((k, i) => {
      const e = lab(k);
      if (/12/.test(e)) dest[k] = (primer8 >= 0 && i > primer8) ? "Compra|PM12" : "Compra|AM12";
      else if (/8/.test(e)) {
        const c = cargoDe(k);
        if (c === "Gerente de tienda" || c === "Gerente en entrenamiento") dest[k] = "Administración|ADM8";
        else if (c === "Conserje") dest[k] = "Conserjería|ADM8";
        else if (c === "Seguridad Interna") dest[k] = "Seguridad Interna|ADM8";
        else { dest[k] = mbk === 0 ? "MBK|AM8" : mbk === 1 ? "MBK|PM8" : ""; mbk++ }
      } else dest[k] = "";
    });
    return dest;
  }

  /* ---------- Interfaz ---------- */
  let PLAN = null, MAPA = {}, DEST = {}, EDIT = new Set();
  function abrir() {
    if (!window.XLSX) { toast("Conéctate a internet para leer el Excel."); return }
    const m = document.getElementById("modal"), sinP = !S.agentes.length;
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="iiT" style="width:min(580px,100%)"><header><h4 id="iiT">⬆ Importar horarios desde Excel</h4><p>Carga horarios que ya hiciste y RITMO los empareja con tu personal, sin armarlos celda por celda.</p></header>
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
      nombres.forEach(nm => { const e = emparejar(nm, semRef); MAPA[nm] = e.id; plan._tipos = plan._tipos || {}; plan._tipos[nm] = e });
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
    const optA = id => S.agentes.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).map(a => `<option value="${a.id}" ${a.id === id ? "selected" : ""}>${esc(a.nombre)}${a.nombreCompleto ? " · " + esc(a.nombreCompleto) : ""}</option>`).join("");
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ihT" style="width:min(1000px,100%);max-height:92vh;display:flex;flex-direction:column">
      <header><h4 id="ihT">⬆ Importar horarios desde Excel</h4><p>${esc(P.archivo)} · hoja <b>${esc(P.hoja)}</b> · formato <b>${esc(P.formato)}</b> · ${P.semanas.length} semana${P.semanas.length > 1 ? "s" : ""}: ${P.semanas.map(w => fmtRango(w.k)).join(" · ")}</p></header>
      <div class="pad" style="overflow:auto;flex:1">
      ${P.avisos.length ? `<div class="banner"><div>⚠️</div><div>${P.avisos.slice(0, 6).map(esc).join("<br>")}</div></div>` : ""}
      <h5 style="margin:10px 0 4px">1 · ¿A qué fila del horario va cada fila del Excel?</h5>
      <p class="note" style="margin:0 0 6px">${P.manual ? "El Excel manual solo dice 12 h u 8 h. Elige la caja y el horario de cada fila; ya dejé una propuesta. Aplica a todas las semanas." : "Tomé la Caja y el Horario de tu Excel. Revisa los que quedaron sin destino."}</p>
      <div class="scroll"><table class="formtable"><thead><tr><th>Fila del Excel</th><th>Ejemplo</th><th>Va a</th></tr></thead><tbody>
      ${claves.map(c => `<tr><td>${esc(c.label)}</td><td style="font-size:12px;color:var(--muted)">${esc(c.ej)}</td><td><select class="in" style="font-size:12px;min-width:230px" data-dest="${esc(c.key)}"><option value="">— No importar —</option>${dst.map(d => `<option value="${esc(d.v)}" ${DEST[c.key] === d.v ? "selected" : ""}>${esc(d.t)}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div>
      <h5 style="margin:14px 0 4px">2 · Personal: ${nombres.filter(n => MAPA[n]).length} de ${nombres.length} nombres coinciden con tu Matriz base</h5>
      <p class="note" style="margin:0 0 6px">Los que no coinciden se pueden emparejar a mano o ignorar.</p>
      <div class="scroll"><table class="formtable"><thead><tr><th>Nombre en el Excel</th><th>Coincidencia</th><th>Persona de tu Matriz base</th></tr></thead><tbody>
      ${nombres.map(n => { const e = P._tipos[n]; return `<tr><td><b>${esc(n)}</b></td><td style="font-size:12px;color:${MAPA[n] ? "var(--ok,#1d7f48)" : "var(--bad,#b3261e)"}">${MAPA[n] ? esc(e.tipo) : esc(e.tipo)}</td><td><select class="in" data-nom="${esc(n)}"><option value="">— Ignorar —</option>${optA(MAPA[n])}</select></td></tr>` }).join("")}</tbody></table></div>
      <label class="radio" style="margin-top:12px"><input type="checkbox" id="ihRep" ${existentes.length ? "" : "disabled"}><span><b>Reemplazar semanas que ya tienen horario</b><br><small>${existentes.length ? `Ya tienen asignaciones: ${existentes.map(w => fmtRango(w.k)).join(", ")}. Si no marcas esto, se omiten.` : "Ninguna de estas semanas tiene horario todavía."}</small></span></label>
      <p id="ihRes" class="note" style="margin-top:10px"></p></div>
      <footer><button class="btn" id="ihX">Cancelar</button><button class="btn primary" id="ihOK">Importar</button></footer></div>`;
    m.hidden = false;
    m.querySelectorAll("[data-dest]").forEach(s => s.onchange = () => { DEST[s.dataset.dest] = s.value; EDIT.add(s.dataset.dest); resumen() });
    m.querySelectorAll("[data-nom]").forEach(s => s.onchange = () => {
      MAPA[s.dataset.nom] = s.value || null;
      if (PLAN.manual) { // al emparejar a las personas, la propuesta de caja/horario mejora (gerente → Administración, etc.); no pisa lo que ya elegiste
        const nd = destinoPorDefecto(PLAN, MAPA);
        m.querySelectorAll("[data-dest]").forEach(x => { const k = x.dataset.dest; if (!EDIT.has(k) && nd[k] !== undefined) { DEST[k] = nd[k]; x.value = nd[k] } });
      }
      resumen();
    });
    document.getElementById("ihX").onclick = () => { cerrarModal(); PLAN = null };
    document.getElementById("ihOK").onclick = aplicar;
    resumen();
  }
  function conteo() {
    let n = 0, sin = 0, fuera = 0;
    PLAN.semanas.forEach(w => w.filas.forEach(f => { if (!DEST[f.key]) return; f.cells.forEach((c, d) => { if (!c || IGNORAR.has(nz(c))) return; const a = agente(MAPA[c]); if (!a) { sin++; return } if (!vigente(a, addDays(parse(w.k), d))) { fuera++; return } n++ }) }));
    return { n, sin, fuera };
  }
  function resumen() {
    const c = conteo(), el = document.getElementById("ihRes"); if (!el) return;
    el.innerHTML = `Se importarán <b>${c.n}</b> turnos.${c.sin ? ` <span style="color:var(--bad,#b3261e)">${c.sin} celdas se omiten por nombres sin emparejar.</span>` : ""}${c.fuera ? ` ${c.fuera} se omiten porque la persona no estaba vigente ese día (antes de su ingreso o después de su baja).` : ""}`;
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
      if (p.m === "doble") { const n = Object.keys(s.asig || {}).filter(x => x.endsWith("|" + p.d) && s.asig[x] === p.aid).length; if (n >= 2) { const a = agente(p.aid); out.push({ sev: "warn", txt: `${a ? a.nombre : "Una persona"} tiene ${n} turnos el ${diaTxt(k, p.d)} (${p.fids.map(f => filaTxt(s, f)).join(" y ")}). Deja solo uno.` }) } return }
      if (s.asig && s.asig[p.fid + "|" + p.d]) return;
      out.push({ sev: "bad", txt: p.m === "vig" ? `${diaTxt(k, p.d)} · ${filaTxt(s, p.fid)}: «${p.nom}» no estaba vigente ese día (revisa su fecha de alta o baja) y quedó vacío. Asigna a otra persona.` : `${diaTxt(k, p.d)} · ${filaTxt(s, p.fid)}: «${p.nom}» no está en tu Matriz base y quedó vacío. Dalo de alta en la Matriz base o asigna la celda a mano.` });
    });
    return out;
  }
  function bannerPend(k) {
    const L = pendActivos(k); if (!L.length) return "";
    return `<div class="banner"><div>📥</div><div><b>Importación de Excel: ${L.length} cosa${L.length > 1 ? "s" : ""} por corregir en esta semana.</b><br>${L.slice(0, 8).map(x => esc(x.txt)).join("<br>")}${L.length > 8 ? `<br>…y ${L.length - 8} más.` : ""}<br><small>Estos avisos se quitan solos cuando lo corriges.</small></div></div>`;
  }

  function aplicar() {
    const P = PLAN, rep = document.getElementById("ihRep").checked, hechas = [], omit = [], cerr = [], sinDest = [];
    let turnos = 0, vacias = 0;
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
          if (fila.dias && !fila.dias.includes(di)) fila.dias.push(di);
          s.asig[fila.id + "|" + di] = a.id; turnos++;
        });
      }
      // doble turno el mismo día (la misma persona en dos filas)
      for (let di = 0; di < 7; di++) { const por = {}; Object.keys(s.asig).filter(x => x.endsWith("|" + di)).forEach(x => (por[s.asig[x]] = por[s.asig[x]] || []).push(x.split("|")[0])); Object.entries(por).forEach(([aid, fids]) => { if (fids.length > 1) pend.push({ m: "doble", aid, d: di, fids }) }) }
      s.importPend = pend; s.extra = s.extra !== false; tocarSemana(k); hechas.push(k);
    }
    cerrarModal();
    if (hechas.length) { S.semana = hechas[0]; S.tab = "horario"; render() }
    informe({ turnos, hechas, omit, cerr, sinDest, vacias });
    PLAN = null;
  }
  function informe(R) {
    const m = document.getElementById("modal"), act = R.hechas.flatMap(k => pendActivos(k).map(x => ({ k, ...x })));
    const rangos = a => a.map(fmtRango).join(" · ");
    const sec = (tit, ok, items) => items.length ? `<div class="banner ${ok ? "info" : ""}"><div>${ok ? "ℹ️" : "⚠️"}</div><div><b>${tit}</b><br>${items.join("<br>")}</div></div>` : "";
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ifT" style="width:min(720px,100%);max-height:90vh;display:flex;flex-direction:column">
      <header><h4 id="ifT">${R.hechas.length ? "✅ Importación lista" : "No se importó nada"}</h4><p>${R.hechas.length ? `<b>${R.turnos}</b> turnos cargados en ${R.hechas.length} semana${R.hechas.length > 1 ? "s" : ""}: ${rangos(R.hechas)}.` : "Revisa los motivos de abajo."}</p></header>
      <div class="pad" style="overflow:auto;flex:1">
      ${sec(`Por corregir en la web (${act.length})`, false, act.slice(0, 14).map(x => esc(x.txt)).concat(act.length > 14 ? [`…y ${act.length - 14} más. Las verás como aviso en cada semana.`] : []))}
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
