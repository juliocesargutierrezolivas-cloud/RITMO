// RITMO · Recorrido guiado (product tour) y lecciones por rol.
// Sin librerías externas. Un paso apunta a un elemento (del panel o del Generador dentro de su iframe),
// oscurece el resto de la pantalla, lo resalta con un anillo animado y lo explica en un globo, con narración opcional.
// Agregar o cambiar lecciones: editar LECCIONES al final de este archivo. No hay que tocar el motor.

/* ---------- Almacenamiento (por correo; si el navegador lo bloquea, simplemente no se recuerda) ---------- */
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } };
const kVisto = (c, id) => `ritmo-tour-visto:${String(c || "").toLowerCase()}:${id}`;
export const esVisto = (correo, id) => lsGet(kVisto(correo, id)) === "1";
export const marcarVisto = (correo, id) => lsSet(kVisto(correo, id), "1");

/* ---------- Voz del navegador ---------- */
export const vozDisponible = () => "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
export const vozActiva = () => lsGet("ritmo-tour-voz") !== "0";
export const setVoz = on => { lsSet("ritmo-tour-voz", on ? "1" : "0"); if (!on) callar(); };
function callar() { try { if (vozDisponible()) speechSynthesis.cancel(); } catch (e) { /* nada */ } }
function hablar(texto) {
  if (!vozDisponible() || !vozActiva()) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-MX";
    const v = speechSynthesis.getVoices().find(x => /^es[-_]/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { /* nada */ }
}

/* ---------- Estilos del recorrido ---------- */
const CSS = `
.tr-raiz{position:fixed;inset:0;z-index:9990;font-family:"IBM Plex Sans","Segoe UI",Arial,sans-serif}
.tr-bloq{position:fixed;inset:0;z-index:9991;background:transparent}
.tr-foco{position:fixed;z-index:9992;border-radius:10px;pointer-events:none;box-shadow:0 0 0 9999px rgba(4,0,63,.74);transition:top .28s ease,left .28s ease,width .28s ease,height .28s ease}
.tr-foco::after{content:"";position:absolute;inset:-4px;border-radius:13px;border:3px solid #ff8300;animation:trPulso 1.5s ease-out infinite}
.tr-foco.vacio::after{display:none}
@keyframes trPulso{0%{opacity:1;transform:scale(1)}70%{opacity:.15;transform:scale(1.08)}100%{opacity:0;transform:scale(1.1)}}
.tr-tip{position:fixed;z-index:9993;width:min(360px,calc(100vw - 24px));background:#fff;color:#0f1e36;border-radius:14px;padding:14px 16px 12px;box-shadow:0 18px 50px rgba(0,0,0,.45);animation:trEntra .25s ease both}
@keyframes trEntra{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.tr-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.tr-n{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#56678a;margin-right:auto}
.tr-ic{border:0;background:#eef2f8;color:#04003f;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px}
.tr-ic:hover,.tr-ic:focus-visible{background:#ffe3c2;outline:2px solid #ff8300}
.tr-ic[aria-pressed="false"]{opacity:.5}
.tr-tip h4{margin:2px 0 4px;font-size:16px;color:#04003f}
.tr-tip p{margin:0;font-size:14px;line-height:1.5;color:#2b3a55}
.tr-bar{display:flex;align-items:center;gap:10px;margin-top:12px}
.tr-pts{display:flex;gap:4px;flex-wrap:wrap;margin-right:auto;max-width:150px}
.tr-pts i{width:7px;height:7px;border-radius:50%;background:#d6ddea}.tr-pts i.on{background:#ff8300}.tr-pts i.hecho{background:#04003f}
.tr-b{border:1px solid #d6ddea;background:#fff;color:#04003f;border-radius:9px;padding:8px 13px;font:600 13.5px "IBM Plex Sans","Segoe UI",Arial,sans-serif;cursor:pointer}
.tr-b.pri{background:#ff8300;border-color:#ff8300;color:#1b0e00}
.tr-b:hover,.tr-b:focus-visible{outline:2px solid #04003f;outline-offset:1px}
.tr-b[disabled]{opacity:.4;cursor:default}
.tr-omitir{display:block;margin:8px auto 0;border:0;background:none;color:#56678a;font-size:12px;cursor:pointer;text-decoration:underline}
.tr-flecha{position:absolute;left:var(--fx,50%);width:14px;height:14px;background:#fff;transform:translateX(-50%) rotate(45deg);animation:trRebote 1s ease-in-out infinite}
.tr-flecha.abajo{top:-7px}.tr-flecha.arriba{bottom:-7px}
@keyframes trRebote{0%,100%{margin-top:0}50%{margin-top:-5px}}
.tr-oferta{position:fixed;right:16px;bottom:16px;z-index:9980;max-width:330px;background:#04003f;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 14px 40px rgba(0,0,0,.4);animation:trEntra .3s ease both}
.tr-oferta b{display:block;font-size:15px;margin-bottom:4px}.tr-oferta p{margin:0 0 10px;font-size:13.5px;color:#d6ddea}
.tr-oferta .tr-b{padding:7px 12px}
@media (prefers-reduced-motion:reduce){.tr-foco,.tr-tip,.tr-oferta{transition:none;animation:none}.tr-foco::after,.tr-flecha{animation:none}}
`;
function estilos() {
  if (document.getElementById("tr-css")) return;
  const s = document.createElement("style"); s.id = "tr-css"; s.textContent = CSS; document.head.appendChild(s);
}

/* ---------- Búsqueda del elemento de un paso ---------- */
// paso.sel: selector. paso.frame: selector del iframe donde vive el elemento (mismo origen).
function resolver(p) {
  if (!p.sel) return null;
  let doc = document, dx = 0, dy = 0;
  if (p.frame) {
    const f = document.querySelector(p.frame);
    if (!f || f.hidden || !f.contentDocument || !f.contentDocument.body) return null;
    doc = f.contentDocument;
  }
  const el = doc.querySelector(p.sel);
  if (!el) return null;
  const visible = el.getClientRects().length > 0;
  if (!visible) return null;
  return { el, doc, frame: p.frame ? document.querySelector(p.frame) : null };
}
function rectDe(r) {
  const b = r.el.getBoundingClientRect();
  let x = b.left, y = b.top;
  if (r.frame) { const fb = r.frame.getBoundingClientRect(); x += fb.left; y += fb.top; }
  return { x, y, w: b.width, h: b.height };
}

/* ---------- Motor ---------- */
let activo = null;
export const tourActivo = () => !!activo;
export function detenerTour() {
  if (!activo) return;
  const a = activo; activo = null;
  clearInterval(a.reloj);
  removeEventListener("resize", a.reponer); removeEventListener("scroll", a.reponer, true);
  document.removeEventListener("keydown", a.teclas, true);
  a.raiz.remove(); callar();
  if (a.foco) { try { a.foco.focus(); } catch (e) { /* nada */ } }
}

/**
 * Inicia un recorrido.
 * pasos: [{ sel, frame?, titulo, texto, antes?(), opcional?, pos? }]
 *   - opcional: si el elemento no existe o no se ve, el paso se omite.
 *   - sin sel (o elemento ausente sin "opcional"): el globo se muestra centrado, sin resaltar nada.
 * opts: { onFin(completado:boolean) }
 */
export async function iniciarTour(pasos, opts = {}) {
  detenerTour(); estilos();
  const lista = pasos.slice();
  let i = 0, vivo = true, objetivo = null;
  const foco = document.activeElement;

  const raiz = document.createElement("div"); raiz.className = "tr-raiz";
  raiz.innerHTML = `<div class="tr-bloq"></div><div class="tr-foco vacio"></div>
    <div class="tr-tip" role="dialog" aria-modal="true" aria-labelledby="tr-t" aria-describedby="tr-x">
      <span class="tr-flecha abajo"></span>
      <div class="tr-top"><span class="tr-n"></span>
        ${vozDisponible() ? `<button class="tr-ic" data-a="voz" type="button" title="Narración con voz" aria-label="Narración con voz" aria-pressed="${vozActiva()}">🔊</button>` : ""}
        <button class="tr-ic" data-a="fin" type="button" title="Cerrar" aria-label="Cerrar el recorrido">✕</button></div>
      <h4 id="tr-t"></h4><p id="tr-x"></p>
      <div class="tr-bar"><div class="tr-pts"></div>
        <button class="tr-b" data-a="prev" type="button">Atrás</button>
        <button class="tr-b pri" data-a="next" type="button">Siguiente</button></div>
      <button class="tr-omitir" data-a="fin" type="button">Omitir recorrido</button>
    </div>`;
  document.body.appendChild(raiz);
  const $f = raiz.querySelector(".tr-foco"), $t = raiz.querySelector(".tr-tip"), $fl = raiz.querySelector(".tr-flecha");

  function colocar() {
    if (!vivo) return;
    const vw = innerWidth, vh = innerHeight, m = 12;
    if (objetivo) {
      const r = rectDe(objetivo), pad = 6;
      Object.assign($f.style, { left: r.x - pad + "px", top: r.y - pad + "px", width: r.w + pad * 2 + "px", height: r.h + pad * 2 + "px" });
      $f.classList.remove("vacio");
      const th = $t.offsetHeight, tw = $t.offsetWidth;
      const abajo = vh - (r.y + r.h + pad) - m, arriba = r.y - pad - m;
      let top, lado = "abajo";
      if (abajo >= th + 10) top = r.y + r.h + pad + 12;
      else if (arriba >= th + 10) { top = r.y - pad - th - 12; lado = "arriba"; }
      else { top = Math.max(m, Math.min(vh - th - m, r.y + r.h / 2 - th / 2)); lado = ""; }
      let left = r.x + r.w / 2 - tw / 2; left = Math.max(m, Math.min(vw - tw - m, left));
      if (!lado) { // sin espacio arriba ni abajo: al costado
        left = r.x + r.w + pad + 12 + tw <= vw - m ? r.x + r.w + pad + 12 : Math.max(m, r.x - pad - tw - 12);
      }
      $t.style.top = top + "px"; $t.style.left = left + "px";
      $fl.style.display = lado ? "" : "none";
      $fl.className = "tr-flecha " + (lado || "abajo");
      $fl.style.setProperty("--fx", Math.max(24, Math.min(tw - 24, r.x + r.w / 2 - left)) + "px");
    } else {
      Object.assign($f.style, { left: vw / 2 + "px", top: vh / 2 + "px", width: "0px", height: "0px" });
      $f.classList.add("vacio");
      const th = $t.offsetHeight, tw = $t.offsetWidth;
      $t.style.top = Math.max(m, (vh - th) / 2) + "px"; $t.style.left = Math.max(m, (vw - tw) / 2) + "px";
      $fl.style.display = "none";
    }
  }
  const reponer = () => requestAnimationFrame(colocar);

  async function mostrar(n, dir) {
    // avanza saltando pasos opcionales cuyo elemento no existe
    while (n >= 0 && n < lista.length) {
      const p = lista[n];
      if (p.antes) { try { await p.antes(); } catch (e) { /* un paso fallido no rompe el recorrido */ } await new Promise(r => setTimeout(r, 220)); }
      if (!vivo) return;
      const r = resolver(p);
      if (r || !p.opcional) { objetivo = r; i = n; break; }
      n += dir;
    }
    if (n < 0) { i = 0; return mostrar(0, 1); }
    if (n >= lista.length) return terminar(true);
    const p = lista[i];
    if (objetivo) { try { objetivo.el.scrollIntoView({ block: "center", inline: "nearest" }); } catch (e) { /* nada */ } }
    raiz.querySelector(".tr-n").textContent = `Paso ${i + 1} de ${lista.length}`;
    raiz.querySelector("#tr-t").textContent = p.titulo || "";
    raiz.querySelector("#tr-x").textContent = p.texto || "";
    raiz.querySelector(".tr-pts").innerHTML = lista.map((_, k) => `<i class="${k < i ? "hecho" : k === i ? "on" : ""}"></i>`).join("");
    raiz.querySelector('[data-a="prev"]').disabled = i === 0;
    const sig = raiz.querySelector('[data-a="next"]'); sig.textContent = i === lista.length - 1 ? "Terminar" : "Siguiente";
    $t.style.animation = "none"; void $t.offsetWidth; $t.style.animation = "";
    colocar(); setTimeout(colocar, 60); sig.focus({ preventScroll: true });
    hablar((p.titulo ? p.titulo + ". " : "") + (p.texto || ""));
  }
  function terminar(ok) {
    if (!vivo) return; vivo = false;
    const a = activo; detenerTour();
    if (!a) return;
    if (opts.onFin) { try { opts.onFin(!!ok); } catch (e) { /* nada */ } }
  }

  raiz.addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const a = b.dataset.a;
    if (a === "next") mostrar(i + 1, 1);
    else if (a === "prev") mostrar(i - 1, -1);
    else if (a === "fin") terminar(false);
    else if (a === "voz") { const on = !vozActiva(); setVoz(on); b.setAttribute("aria-pressed", String(on)); if (on) hablar((lista[i].titulo || "") + ". " + (lista[i].texto || "")); }
  });
  const teclas = e => {
    if (e.key === "Escape") { e.preventDefault(); terminar(false); }
    else if (e.key === "ArrowRight") { e.preventDefault(); mostrar(i + 1, 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); mostrar(i - 1, -1); }
    else if (e.key === "Tab") { // el foco se queda dentro del globo
      const f = [...$t.querySelectorAll("button:not([disabled])")]; if (!f.length) return;
      const k = f.indexOf(document.activeElement);
      if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && k === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  document.addEventListener("keydown", teclas, true);
  addEventListener("resize", reponer); addEventListener("scroll", reponer, true);
  const reloj = setInterval(colocar, 500); // sigue al elemento si la pantalla cambia sola
  activo = { raiz, reponer, teclas, reloj, foco };
  await mostrar(0, 1);
}

/* ---------- Invitación de primer uso ---------- */
export function ofrecerRecorrido({ correo, id, titulo, texto, onEmpezar }) {
  const kOf = `ritmo-tour-oferta:${String(correo || "").toLowerCase()}:${id}`;
  if (lsGet(kOf) === "1" || esVisto(correo, id) || document.querySelector(".tr-oferta")) return;
  estilos();
  const d = document.createElement("div"); d.className = "tr-oferta"; d.setAttribute("role", "region"); d.setAttribute("aria-label", "Recorrido guiado");
  d.innerHTML = `<b>👋 ${titulo}</b><p>${texto}</p><div style="display:flex;gap:8px"><button class="tr-b pri" data-a="si" type="button">Empezar</button><button class="tr-b" data-a="no" type="button">Ahora no</button></div>`;
  d.addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    lsSet(kOf, "1"); d.remove();
    if (b.dataset.a === "si") onEmpezar();
  });
  document.body.appendChild(d);
}

/* =====================================================================================
   LECCIONES POR ROL
   ctx = { ir(k): abre una pestaña del panel, gen(tab): abre una pestaña del Generador }
   Para escribir una lección nueva basta con agregar un objeto a la lista del rol.
   ===================================================================================== */
const F = "#genF"; // iframe del Generador

const L_PANEL = {
  id: "panel", icono: "🧭", titulo: "Conoce tu panel",
  desc: "Un vistazo de 1 minuto a lo que hay en pantalla: tu sesión, la quincena, las alertas y tus módulos.",
  pasos: () => [
    { sel: "header .ritmo", titulo: "Bienvenido a RITMO", texto: "Tu tienda, a su ritmo. Aquí se manejan los horarios y la planilla de las sucursales AMPM. Te muestro lo esencial en un minuto." },
    { sel: "#net", titulo: "Conexión segura", texto: "La luz verde confirma que estás en línea con conexión segura. Si se pierde internet se pone en rojo." },
    { sel: "header .who", titulo: "Tu sesión", texto: "Aquí aparece tu nombre y tu rol. Tu rol define lo que puedes ver y hacer en RITMO." },
    { sel: "#pwB", titulo: "Tu contraseña", texto: "Desde aquí puedes cambiar tu contraseña cuando quieras. Por seguridad, RITMO te la pedirá cambiar cada 60 días." },
    { sel: "#alerta", opcional: true, titulo: "Alerta de entrega", texto: "Cuando hay una quincena por entregar, esta alerta te dice la fecha límite y cuánto falta. Desaparece cuando ya cumpliste." },
    { sel: "#qSel", titulo: "La quincena", texto: "Elige qué quincena quieres ver. Por defecto aparece la actual." },
    { sel: "#tabs", titulo: "Tus módulos", texto: "Estas pestañas son tus módulos. Solo ves los que corresponden a tu rol. En Novedades encuentras las mejoras nuevas de RITMO." },
    { sel: "#out", titulo: "Cerrar sesión", texto: "Cuando termines, sal con este botón, sobre todo si usas una computadora compartida." },
    { sel: "#tutB", opcional: true, titulo: "Repite este recorrido cuando quieras", texto: "El botón de ayuda y la pestaña Tutoriales guardan todas las lecciones de tu rol." }
  ]
};

const L_EDITOR_HORARIO = {
  id: "horario", icono: "🗓", titulo: "Mi horario: arma tu horario y tu planilla",
  desc: "Recorre el Generador: matriz base del personal, horario semanal, novedades, hoja de asistencia y planilla.",
  pasos: ctx => [
    { antes: () => ctx.ir("gen"), sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Aquí vive el Generador de Horarios dentro de RITMO. Todo lo que haces se guarda solo en la nube; ya no manejas archivos." },
    { sel: "#genIni", opcional: true, titulo: "Empieza una sola vez", texto: "La primera vez traes tu respaldo del Generador o empiezas desde cero. Después trabajas siempre aquí." },
    { frame: F, sel: "header .tabs", opcional: true, titulo: "Las pestañas del Generador", texto: "Horario, Matriz base, Planilla, Planilla MBK, Historial y Configuración. Vamos paso a paso." },
    { frame: F, antes: () => ctx.gen("matriz"), sel: '[data-act="addag"]', opcional: true, titulo: "1. Matriz base: tu personal", texto: "Empieza dando de alta a tus agentes con este botón. Cada persona lleva su cargo base, los cargos que también cubre, sus días de clase y su fecha de alta." },
    { frame: F, sel: "#view-matriz table", opcional: true, titulo: "Nombre, fechas y color", texto: "Escribe el nombre corto del agente. Toca el cuadro de color para elegir uno de la paleta; RITMO sugiere azules o rosados según el nombre y nunca repite colores." },
    { frame: F, antes: () => ctx.gen("horario"), sel: '[data-act="auto"]', opcional: true, titulo: "2. Horario: autollenar", texto: "Con la matriz lista, este botón arma la semana respetando la ley y las reglas de la tienda. Luego puedes arrastrar, intercambiar o quitar turnos a mano." },
    { frame: F, sel: ".toolbar .switch", opcional: true, titulo: "Horas extra", texto: "Activa las horas extra solo cuando la semana lo necesite. Si está apagado, nadie pasa del tope de horas." },
    { frame: F, sel: "table.nov", opcional: true, titulo: "Novedades del personal", texto: "Toca una celda para marcar vacaciones, subsidio, extraordinario o ausencia. Si alguien cumple años esa semana verás un 🎂." },
    { frame: F, sel: '[data-act="asis"]', opcional: true, titulo: "Hoja de asistencia", texto: "Imprime la semana en tamaño carta, con el turno de cada colaborador y espacio para su firma." },
    { frame: F, sel: '[data-act="impxlsx"]', opcional: true, titulo: "Importar tu horario desde Excel", texto: "Si ya armaste tus semanas en tu hoja manual, súbelas aquí en vez de escribirlas. La lección «Importar horarios desde Excel» te lo muestra paso a paso." },
    { frame: F, sel: "aside.side", opcional: true, titulo: "Liquidación semana y alertas", texto: "A la par del horario ves una tabla como la de tu Excel: Nombre, Turnos, Horas, H.E. y Feriado de cada persona, con el total. Debajo van las alertas de reglas: bloqueos en rojo y avisos en amarillo. Un «¡Turno de 24 hrs!» solo aparece cuando tú lo asignas a mano. Revisa todo antes de entregar." },
    { frame: F, antes: () => ctx.gen("planilla"), sel: "#plMes", opcional: true, titulo: "3. Planilla", texto: "Elige el mes y la quincena y marca las semanas de horas extra que se pagan. Completa cédula, nombre, ingreso y salario una sola vez." },
    { frame: F, sel: '[data-act="publicar"]', opcional: true, titulo: "Publicar planilla", texto: "Este botón entrega la planilla a RITMO. Queda en gris cuando está publicada y vuelve a color si haces cambios." },
    { frame: F, antes: () => ctx.gen("horario"), sel: ".save", opcional: true, titulo: "Se guarda solo", texto: "Este indicador muestra que tus cambios se están guardando. No necesitas guardar nada a mano." }
  ]
};

const L_EDITOR_IMPORTAR = {
  id: "importar", icono: "⬆", titulo: "Importar horarios desde Excel",
  desc: "Sube tu hoja manual (o la plantilla de RITMO), vincula a tu personal y corrige lo que RITMO te avise.",
  pasos: ctx => [
    { antes: () => { ctx.ir("gen"); ctx.gen("horario"); }, sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "Importar sirve para no volver a escribir a mano las semanas que ya armaste. RITMO lee tu archivo y arma el horario por ti. Para vincular nombres, tu personal ya debe estar en la Matriz base (lo cargó RRHH y tú lo confirmaste)." },
    { frame: F, antes: async () => { ctx.genAct("impxlsx"); await new Promise(r => setTimeout(r, 500)); }, sel: "#iiP", opcional: true, titulo: "Plantilla con tu personal", texto: "¿Primera vez? Baja la plantilla: ya trae a tu personal y las próximas semanas con sus fechas. También puedes subir tu hoja de siempre (LUNES a DOMINGO con las filas de 12 y 8 horas)." },
    { frame: F, sel: "#iiF", opcional: true, titulo: "Elegir archivo", texto: "Aquí eliges el Excel. Funciona con la hoja manual completa: no hace falta quitarle las tablas de planilla ni de turnos. RITMO usa la hoja PLANILLA (cédulas) para reconocer a cada persona." },
    { antes: () => ctx.genCerrar(), titulo: "1 · ¿A qué fila va cada fila?", texto: "RITMO propone la caja y el horario de cada fila según su título («12 hrs PM», «Turno MBK 6am-2pm»…) y según las personas que la cubren. Revisa la propuesta y corrígela si hace falta; la recordará la próxima vez." },
    { titulo: "2 · Personal: vinculado o sin vincular", texto: "Cada nombre del Excel aparece como «Vinculado» (con la cédula, el nombre exacto o uno parecido) o «Sin vincular». Quien quede sin vincular no tendrá turnos en el horario, y la planilla no le contará horas extra, feriados ni novedades (sus días se calculan desde su ingreso): empareja su nombre a mano con el selector. Si hay un «Paola 16hrs», RITMO crea el horario «RITMO Turno 16 h» para registrar esas horas." },
    { titulo: "3 y 4 · Tu personal y el control", texto: "RITMO te avisa qué personas de tu Matriz base no aparecen en ningún turno (el gerente también debe estar en el horario, aunque firme la planilla) y compara la tabla NOMBRE · TURNOS de tu Excel con lo que va a cargar. Si algo no cuadra, te dice la posible causa." },
    { titulo: "5 · Datos de planilla", texto: "Si tu Excel trae la hoja PLANILLA, RITMO puede completar en tu Matriz base y en tu Planilla la cédula, el nombre completo, la fecha de ingreso y el salario que te falten (solo campos vacíos; nunca pisa lo que ya cargaste). Lo único que te queda a mano en la Matriz base son los días que estudia cada persona." },
    { titulo: "Después de importar", texto: "El informe lista lo que debes corregir en la web. Esos avisos quedan en la semana y en la campanita, y se quitan solos cuando lo arreglas. Un turno de 24 horas (AM 12 h + PM 12 h el mismo día) se carga como lo escribiste y queda con el aviso «¡Turno de 24 hrs!»: el generador nunca lo propone, solo tú a mano." }
  ]
};

const L_EDITOR_CONFIG = {
  id: "config", icono: "⚙️", titulo: "Configuración: horarios y reglas de tu tienda",
  desc: "Cambia las horas de cada turno, crea horarios propios y fija el presupuesto de agentes, el tope semanal, el MBK de 12 h y las festividades.",
  pasos: ctx => [
    { antes: () => { ctx.ir("gen"); ctx.gen("config"); }, sel: '#tabs [data-k="gen"]', titulo: "Mi horario › Configuración", texto: "Aquí se ajusta cómo arma RITMO los horarios de tu tienda. Lo que cambies se aplica a las semanas nuevas y a Autollenar." },
    { frame: F, sel: "#view-config table.formtable", opcional: true, titulo: "1 · Plantillas de turno", texto: "Cada fila es un horario: AM 12 h, PM 12 h, AM 8 h, PM 8 h, MBK 12 h y Admin 8 h. Cambia la entrada, la salida y las horas si tu tienda trabaja distinto. La columna Jornada te dice si es diurna, mixta o nocturna." },
    { frame: F, sel: "#view-config .chkgrp", opcional: true, titulo: "2 · Puesto", texto: "Marca en qué puestos puede usarse cada horario (Compras, MBK, Administración, Inducción, Conserjería, Seguridad Interna). Un horario solo se ofrece en los puestos marcados." },
    { frame: F, sel: '#view-config [data-f="confirmado"]', opcional: true, titulo: "3 · Confirmado", texto: "Marca Confirmado cuando ya verificaste las horas. Mientras un horario no esté confirmado, el Horario te avisa que está «por confirmar»." },
    { frame: F, sel: '#view-config [data-act="addpl"]', opcional: true, titulo: "4 · Anexar otro horario", texto: "Crea un horario propio (por ejemplo 7:00 am a 3:00 pm) y úsalo con «+ Refuerzo», «+ Turno MBK», «+ Administrativo» o cambiando el horario de una fila. Los horarios que crea la importación de Excel («RITMO Turno 16 h») también aparecen aquí; puedes renombrarlos o borrarlos." },
    { frame: F, sel: "#view-config #pres", opcional: true, titulo: "5 · Presupuesto de agentes", texto: "Escribe cuántos agentes autoriza tu sucursal (sin contar al gerente de tienda). Cada agente que falte contra el presupuesto autoriza 48 h extra en la semana." },
    { frame: F, sel: "#view-config #tope", opcional: true, titulo: "6 · Tope semanal", texto: "Después de estas horas (48 por defecto) todo es hora extra con pago doble. Cámbialo solo si tu tienda trabaja con otro tope." },
    { frame: F, sel: "#view-config .dayck", opcional: true, titulo: "7 · Días del MBK de 12 h", texto: "Marca los días en que el MBK trabaja de 8:00 am a 8:00 pm para dar libres al equipo MBK. Esos días no hay MBK de 8 h." },
    { frame: F, sel: '#view-config [data-act="addfi"]', opcional: true, titulo: "8 · Feriados y festividad local", texto: "Los feriados nacionales ya vienen cargados y pagan doble si se trabajan. Aquí agregas la festividad local de tu sucursal (día y mes)." },
    { frame: F, sel: '#view-config [data-act="backup"]', opcional: true, titulo: "9 · Respaldo", texto: "Descargar respaldo guarda tu matriz, configuración e historial en un archivo. Restaurar respaldo los carga de nuevo. Base cero borra todo y es solo para empezar una tienda nueva." }
  ]
};

const L_EDITOR_MBK = {
  id: "mbk", icono: "🚌", titulo: "Planilla MBK: viático por persona",
  desc: "Escribe el viático por día de cada agente MBK, compara el presupuesto con lo real y entiende qué pasa al publicar tu planilla.",
  pasos: ctx => [
    { antes: () => { ctx.ir("gen"); ctx.gen("planilla"); }, sel: '#tabs [data-k="gen"]', titulo: "Mi horario", texto: "El viático MBK se prepara en el Generador y se solicita solo cuando publicas tu planilla." },
    { frame: F, sel: '[data-pf="viatico"]', opcional: true, titulo: "1 · Viático por día MBK", texto: "En Planilla › Datos del personal, escribe lo que se le paga a cada persona por cada día que sale a las 8 pm o 10 pm (por ejemplo, C$ 50). Déjalo en blanco a quien no lo necesite. RITMO lo multiplica por sus días con salida." },
    { frame: F, antes: () => ctx.gen("mbk"), sel: "#vtPres", opcional: true, titulo: "2 · El presupuesto semanal", texto: "Escribe aquí lo que la tienda debería gastar en transporte por semana. Es el presupuesto con el que se compara lo real. Quien no tiene viático propio comparte este presupuesto ÷ 7." },
    { frame: F, sel: "#view-mbk .kpis", opcional: true, titulo: "3 · Presupuesto contra real", texto: "Arriba ves el presupuesto, los días con salida, lo real a solicitar y la diferencia: en verde si estás por debajo del presupuesto y en rojo si la pasas." },
    { frame: F, sel: "#view-mbk table.vt", opcional: true, titulo: "4 · Detalle por persona", texto: "Aquí está a quién se paga, cuánto y por qué día. Imprímelo o copia la imagen para la firma de recibido." },
    { frame: F, sel: "#view-mbk .panel:last-child", opcional: true, titulo: "5 · Resumen para solicitud", texto: "Queda para observar cada semana: presupuesto, real, diferencia y estado. Ya no tienes que marcarla a mano: al publicar tu planilla, RITMO solicita el viático de las mismas semanas de pago." },
    { titulo: "Al publicar tu planilla", texto: "Cuando publicas, RITMO te avisa «Tu Planilla MBK está lista» con las semanas y el total, y puedes revisarla desde ahí. Si falta el viático de alguien, te dice quién. Si la planilla no se pudo publicar, el viático no queda solicitado. Si luego cambias un viático o el horario, el monto solicitado se actualiza solo y tu GZ verá el aviso para aprobar de nuevo." }
  ]
};

const L_EDITOR_MATRIZ = {
  id: "matriz", icono: "👥", titulo: "Matriz base: tu personal",
  desc: "Da de alta a cada persona, define sus cargos por prioridad, días de clase y nuevo ingreso, y confirma lo que cargó RRHH.",
  pasos: ctx => [
    { antes: () => { ctx.ir("gen"); ctx.gen("matriz"); }, sel: '#tabs [data-k="gen"]', titulo: "Mi horario › Matriz base", texto: "La Matriz base es la lista de las personas de tu tienda. RITMO arma el horario con ella, así que lo primero es tenerla al día." },
    { sel: "#genPers", opcional: true, titulo: "Lo que cargó RRHH", texto: "Cuando RRHH carga a alguien de tu tienda, aquí te avisa. Revísalo y confírmalo: RITMO trae su cédula, nombre completo, cargo e ingreso y no duplica a nadie." },
    { frame: F, sel: '[data-act="addag"]', opcional: true, titulo: "1 · Dar de alta", texto: "Si alguien todavía no está, agrégalo a mano con este botón. Escribe su nombre corto (el primer nombre)." },
    { frame: F, sel: '#view-matriz [data-f="cargo0"]', opcional: true, titulo: "2 · Cargos por prioridad", texto: "Cargo 1 es su puesto base. Los Cargos 2 y 3 son lo que también puede cubrir cuando haga falta. Autollenar los usa en ese orden." },
    { frame: F, sel: "#view-matriz .dayck", opcional: true, titulo: "3 · Días de clase", texto: "Si la persona estudia, marca sus días de clase: ese día solo puede trabajar turno PM y no puede amanecer la víspera." },
    { frame: F, sel: '#view-matriz [data-f="nuevo"]', opcional: true, titulo: "4 · Nuevo ingreso", texto: "Marca a quien está en inducción. Solo los nuevos ingresos pueden ir en el puesto de Inducción." },
    { frame: F, sel: '#view-matriz [data-f="ingreso"]', opcional: true, titulo: "5 · Fecha de alta y baja", texto: "Antes de su fecha de alta o después de su baja, RITMO no programa a la persona. Quien tiene baja se conserva en el historial, sin color y en negrita." },
    { frame: F, sel: '#view-matriz [data-f="salario"]', opcional: true, titulo: "6 · Salario", texto: "El salario se usa para calcular la planilla y el costo de horas extra. Si el Excel que importaste trae la hoja PLANILLA, RITMO puede completarlo por ti." },
    { frame: F, sel: "#view-matriz .swbtn", opcional: true, titulo: "7 · Color", texto: "Toca el cuadro de color para cambiarlo. RITMO sugiere azules o rosados según el nombre y nunca repite colores." }
  ]
};

const L_EDITOR_PLANILLA = {
  id: "planilla", icono: "🧾", titulo: "Planilla: de tu horario al pago",
  desc: "Elige la quincena, marca las semanas de horas extra a pagar, completa los datos y publica la planilla.",
  pasos: ctx => [
    { antes: () => { ctx.ir("gen"); ctx.gen("planilla"); }, sel: '#tabs [data-k="gen"]', titulo: "Mi horario › Planilla", texto: "La Planilla se calcula sola desde los horarios que guardaste: días, horas extra, feriados y novedades." },
    { frame: F, sel: "#plMes", opcional: true, titulo: "1 · Mes y quincena", texto: "Elige el mes y la quincena (1ra: 1 al 15, 2da: 16 al fin de mes) o un período personalizado. El panel ya te la deja en la quincena actual." },
    { frame: F, sel: "#view-planilla table.pltable", opcional: true, titulo: "2 · La tabla de la planilla", texto: "Una fila por persona: cédula, nombre, cargo, ingreso, días, salario, quincenal, horas extra, feriado y comentarios. Quien ingresa en la semana del corte se paga en la quincena siguiente." },
    { frame: F, sel: '#view-planilla [data-hesem]', opcional: true, titulo: "3 · Semanas de horas extra", texto: "Marca las semanas ya cumplidas cuyas horas extra pagas en esta planilla. Una semana pagada en otra planilla queda bloqueada para no pagarla dos veces. Antes de pagar, ajusta en Horario lo que realmente se trabajó." },
    { frame: F, sel: '#view-planilla [data-plnota]', opcional: true, titulo: "4 · Nota adicional", texto: "Escribe una nota por persona (por ejemplo «cubriendo otra tienda»). Sale en la columna de comentarios del Excel." },
    { frame: F, sel: '#view-planilla [data-pf="salario"]', opcional: true, titulo: "5 · Datos del personal", texto: "Cédula, nombre, ingreso y cargo ya vienen de RRHH. Lo único que sueles escribir aquí es el salario. Si falta algo, un aviso te dice exactamente qué." },
    { frame: F, sel: "#plHF", opcional: true, titulo: "6 · Reglas de pago", texto: "Horas por feriado trabajado, días por quincena y el porcentaje que paga la empresa en vacaciones, subsidio y extraordinario. También puedes descontar el séptimo día por ausencia." },
    { frame: F, sel: '[data-act="plxlsx"]', opcional: true, titulo: "7 · Descargar planilla Excel", texto: "Baja la planilla con el formato oficial, lista para revisar." },
    { frame: F, sel: '[data-act="publicar"]', opcional: true, titulo: "8 · Publicar planilla", texto: "Publica la planilla a RITMO. Queda en gris cuando está publicada y vuelve a color si haces cambios. Al publicar, tu viático MBK se solicita solo y RITMO te avisa que tu Planilla MBK está lista." }
  ]
};

const L_SEGUIMIENTO = {
  id: "seguimiento", icono: "📊", titulo: "Seguimiento de tus tiendas",
  desc: "Qué tiendas entregaron, el semáforo de cada una, horas extra, MBK y cómo avisar a quien le falta algo.",
  pasos: ctx => [
    { antes: () => ctx.ir("seg"), sel: '#tabs [data-k="seg"]', titulo: "Seguimiento", texto: "Aquí ves, en solo lectura, cómo va cada tienda de tu alcance. Un punto en la pestaña te avisa si hay tiendas con incumplimiento." },
    { sel: "#alJ", opcional: true, titulo: "1 · Alertas de incumplimiento", texto: "Las tiendas que no cumplen la fecha límite: críticas, vencidas, por vencer, entregas tardías y solicitudes de reapertura. Con «Avisar» abres tu correo con el mensaje listo." },
    { sel: "#kHES", opcional: true, titulo: "2 · Tarjeta de horas extra", texto: "El total de horas extra y feriadas de las semanas marcadas para pago en la quincena, sumando las tiendas que ves." },
    { sel: "#fTxt", opcional: true, titulo: "3 · Filtros", texto: "Busca por tienda y filtra por zona o por estado de entrega. Los filtros gobiernan las dos tablas: Detalle por tienda y Planilla MBK." },
    { sel: "#tb", opcional: true, titulo: "4 · Detalle por tienda y semáforo", texto: "Una fila por tienda: personal contra plazas, horas extra y feriadas, estado y fecha de entrega. El semáforo resume Planilla, Horas extra, MBK y Plazas: verde bien, ámbar por revisar, rojo urgente, gris sin dato." },
    { sel: "#recBtn", opcional: true, titulo: "5 · Recordatorio", texto: "Arma un mensaje de WhatsApp con las tiendas a las que les falta algo (sin entregar, sin horas extra, sin solicitar MBK). Eliges qué incluir antes de copiarlo." },
    { sel: "#xlsBtn", opcional: true, titulo: "6 · Excel", texto: "Descarga lo que ves en pantalla, respetando los filtros, con el MBK de las semanas elegidas." },
    { sel: "#mbkC", opcional: true, titulo: "7 · Planilla MBK: resumen a solicitar", texto: "Lo que pide cada tienda por semana. El gerente alimenta y el GZ aprueba; GD y GO solo consultan. Elige las semanas con el selector y aprueba toda tu selección de una vez." },
    { sel: "#mbkAp", opcional: true, titulo: "8 · Aprobar mi selección", texto: "Solo el GZ de la tienda (o el superusuario) aprueba. Si una tienda cambia su monto después de aprobar, sale marcada para aprobar de nuevo." },
    { sel: "#mbkI", opcional: true, titulo: "9 · Descargar imagen", texto: "Baja una imagen del resumen MBK con lo aprobado, lista para compartir." }
  ]
};

const L_CALENDARIO = {
  id: "calendario", icono: "🗓", titulo: "Calendario de planilla",
  desc: "Publica la fecha límite, las semanas de horas extra a pagar y los requisitos de cada entrega.",
  pasos: ctx => [
    { antes: () => ctx.ir("cal"), sel: '#tabs [data-k="cal"]', titulo: "Calendario de planilla", texto: "Aquí defines, para cada quincena, cuándo se entrega y qué semanas de horas extra se pagan. Las tiendas lo ven en su panel." },
    { sel: "#calL", opcional: true, titulo: "1 · Fecha límite", texto: "Elige la fecha y hora límite de entrega. Pasada la fecha, la entrega se marca como tarde y no se toma en cuenta el pago de horas extra." },
    { sel: "#calP", opcional: true, titulo: "2 · Fecha de planilla", texto: "La fecha en que se entrega la planilla." },
    { sel: "#calW", opcional: true, titulo: "3 · Semanas de horas extra", texto: "Marca las semanas cuyas horas extra se pagan en esta quincena. Son las mismas que usan las tiendas y el MBK." },
    { sel: "#rqA", opcional: true, titulo: "4 · Requisitos", texto: "Pide la hoja de asistencia, la validación del gerente y avisa que entregar tarde pierde el pago de horas extra." },
    { sel: "#calN", opcional: true, titulo: "5 · Nota", texto: "Un mensaje para las tiendas, por ejemplo «incluir subsidios del período»." },
    { sel: "#calS", opcional: true, titulo: "6 · Guardar y publicar alerta", texto: "Publica el calendario: cada tienda verá su alerta de entrega con la cuenta regresiva." }
  ]
};

const L_RRHH = {
  id: "rrhh", icono: "🧑‍💼", titulo: "Recursos Humanos: altas, bajas y control cruzado",
  desc: "Filtra el personal, carga altas, confirma lo que registran las tiendas y registra bajas.",
  pasos: ctx => [
    { antes: () => ctx.ir("rrh"), sel: '#tabs [data-k="rrh"]', titulo: "Recursos Humanos", texto: "El registro central del personal de todas las tiendas: cédula, nombre, cargo, tienda e ingreso. No guarda salario ni fecha de nacimiento." },
    { sel: "#rhFil", opcional: true, titulo: "1 · Filtros", texto: "Filtra por región, zona o tienda. Las tarjetas de arriba también filtran la lista al tocarlas." },
    { sel: "#rhTT", opcional: true, titulo: "2 · Estado por tienda", texto: "Activos frente al presupuesto y los días sin completar. Toca una tienda para ver solo a su gente." },
    { sel: "#rhRotB", opcional: true, titulo: "3 · Rotación y bajas", texto: "Cuántas personas salen y por qué motivo, para detectar dónde hay más rotación." },
    { sel: "#rhCarga", opcional: true, titulo: "4 · Cargar altas", texto: "Sube el Excel de altas. RITMO revisa cédulas y tiendas y te dice qué filas corregir. Después, «Publicar altas» las manda a las tiendas para que las confirmen." },
    { sel: "#rhPend", opcional: true, titulo: "5 · Control cruzado", texto: "Lo que registró la tienda (altas y bajas) lo confirmas tú, y lo que registras tú lo confirma la tienda. Cada pendiente indica cuántos días lleva sin confirmar." },
    { sel: "#rhBuscaB", opcional: true, titulo: "6 · Registrar una baja", texto: "Busca a la persona, elige la fecha y el motivo. La tienda debe confirmarla o disputarla; solo entonces se aplica en su horario." },
    { sel: "#rhTb", opcional: true, titulo: "7 · Personal registrado", texto: "Busca por nombre o cédula y filtra por estado. Toca el nombre de una persona para abrir su ficha. «Mostrar cédulas» las deja a la vista." },
    { sel: "#rhXls", opcional: true, titulo: "8 · Excel", texto: "Descarga el personal que ves, respetando los filtros." }
  ]
};

const L_RECLUTAMIENTO = {
  id: "reclutamiento", icono: "🔎", titulo: "Reclutamiento: vacantes y prospectos",
  desc: "Dónde enfocarte, vacantes por tienda y el camino de un prospecto hasta la contratación.",
  pasos: ctx => [
    { antes: () => ctx.ir("rec"), sel: '#tabs [data-k="rec"]', titulo: "Reclutamiento", texto: "Las plazas por cubrir de todas las tiendas y los candidatos para llenarlas." },
    { sel: "#rcFoco", opcional: true, titulo: "1 · Dónde enfocarte", texto: "Las tiendas con más plazas por cubrir, para que sepas por dónde empezar." },
    { sel: "#rcTxt", opcional: true, titulo: "2 · Vacantes", texto: "Busca por tienda o puesto y filtra por estado. Las vacantes salen del presupuesto de plazas y del personal activo." },
    { sel: "#rcNT", opcional: true, titulo: "3 · Nueva tienda y nuevo puesto", texto: "El encargado abre tiendas nuevas y agrega puestos. También puede abrir las vacantes de todas las tiendas o quitar las abiertas." },
    { sel: "#pcNew", opcional: true, titulo: "4 · Prospectos", texto: "Registra a un candidato y llévalo por etapas: nuevo, entrevista, documentos y aceptado por la tienda. Los prospectos no guardan cédula hasta que se contratan." },
    { sel: "#pcTb", opcional: true, titulo: "5 · Contratar", texto: "Al contratar se pide la cédula y la fecha de ingreso: se crea el alta en RRHH para que la tienda la confirme y se cierra la vacante abierta de ese cargo." }
  ]
};

const L_ADMIN = {
  id: "admin", icono: "⚙️", titulo: "Administración de RITMO",
  desc: "Roles, usuarios, accesos, presupuesto de plazas, auditoría y respaldo.",
  pasos: ctx => [
    { antes: () => ctx.ir("adm"), sel: '#tabs [data-k="adm"]', titulo: "Administración", texto: "Solo el superusuario ve esta pestaña. Aquí se configura quién entra a RITMO y qué puede hacer." },
    { sel: "#admEst", opcional: true, titulo: "1 · Estado de roles y accesos", texto: "Un resumen de cuántos usuarios, roles y tiendas hay cargados y publicados." },
    { sel: "#rlNew", opcional: true, titulo: "2 · Roles y permisos", texto: "Los roles de RITMO vienen creados; aquí puedes crear otros y elegir sus permisos y alcance." },
    { sel: "#usNew", opcional: true, titulo: "3 · Usuarios", texto: "Crea un usuario o cambia su rol. Cada persona entra con su correo y recibe un enlace para crear su contraseña." },
    { sel: "#qrBox", opcional: true, titulo: "4 · Compartir RITMO", texto: "El código QR y el mensaje de WhatsApp para invitar a las tiendas." },
    { sel: "#pub", opcional: true, titulo: "5 · Importar y publicar", texto: "Carga el Excel de roles, publica tiendas y usuarios, crea los accesos y publica el presupuesto de plazas. Se cargan una vez y alimentan a todos los usuarios." },
    { sel: "#audTb", opcional: true, titulo: "6 · Registro de auditoría", texto: "Quién aprobó horas extra y MBK y quién abrió o reabrió quincenas. Filtra por tipo o busca una tienda." },
    { sel: "#rspBaja", opcional: true, titulo: "7 · Respaldo y reinicio", texto: "Descarga un respaldo de lo que la app guarda. El reinicio borra datos con confirmación y es solo para emergencias." }
  ]
};

const L_EDITOR_ENTREGA = {
  id: "entrega", icono: "📤", titulo: "Entregar tu quincena",
  desc: "Los pasos para entregar a tiempo: horario y planilla, hoja de asistencia, validación y envío.",
  pasos: ctx => [
    { antes: () => ctx.ir("mia"), sel: "#miaSt", titulo: "Estado de tu entrega", texto: "Aquí ves si tu quincena ya fue entregada, cuándo, y si quedó a tiempo o tarde." },
    { sel: "#useGen", titulo: "Horario y planilla", texto: "Toca este botón para usar lo que ya tienes en Mi horario. Es la forma más simple: no subes ningún archivo." },
    { sel: "#drop", titulo: "Si trabajaste sin internet", texto: "Si usaste el Generador fuera de RITMO, sube aquí su respaldo en archivo." },
    { sel: "#wA", opcional: true, titulo: "Hoja de asistencia", texto: "Si planilla lo pide, sube aquí una foto clara de la hoja de asistencia firmada, o el PDF." },
    { sel: "#wV", titulo: "Valida antes de enviar", texto: "Confirma que todo está reportado: turnos, novedades, horas extra y feriados. Es tu responsabilidad como gerente." },
    { sel: "#env", titulo: "Entregar quincena", texto: "Se activa cuando todo está completo. Si entregas después de la fecha límite, se marca como tarde y no se toma en cuenta el pago de horas extra." },
    { sel: ".mine .card:nth-child(2)", opcional: true, titulo: "Cómo se entrega", texto: "Aquí queda el resumen. Si cambias algo, vuelve a entregar: se reemplaza lo anterior." }
  ]
};

const L_EDITOR_NOVEDADES = {
  id: "novedades", icono: "🔔", titulo: "Novedades y copias guardadas",
  desc: "Dónde ver las mejoras nuevas de RITMO y cómo guardar una copia en este navegador.",
  pasos: ctx => [
    { antes: () => ctx.ir("nov"), sel: "#novL > .nv:first-child", titulo: "Novedades", texto: "Cada mejora de RITMO se anuncia aquí, la más reciente arriba. Un punto naranja en la pestaña te avisa cuando hay algo nuevo." },
    { antes: () => ctx.ir("loc"), sel: "#v-loc .card", opcional: true, titulo: "Guardados aquí", texto: "Las copias que guardas con el botón de disquete quedan en este navegador, no en la nube. Úsalas solo en tu computadora y bórralas si es compartida: contienen datos del personal." }
  ]
};

const L_PRONTO = {
  id: "pronto", icono: "🛠", pronto: true, titulo: "Tutorial de tu rol",
  desc: "Estamos preparando la guía paso a paso de los módulos de tu rol. Mientras tanto, el recorrido “Conoce tu panel” te sirve de punto de partida.",
  pasos: () => []
};

export const LECCIONES = {
  Editor: [L_PANEL, L_EDITOR_HORARIO, L_EDITOR_MATRIZ, L_EDITOR_CONFIG, L_EDITOR_PLANILLA, L_EDITOR_IMPORTAR, L_EDITOR_MBK, L_EDITOR_ENTREGA, L_EDITOR_NOVEDADES],
  RRHH: [L_PANEL, L_RRHH, L_RECLUTAMIENTO],
  "Encargado de Reclutamiento": [L_PANEL, L_RRHH, L_RECLUTAMIENTO],
  "Auxiliar de Reclutamiento": [L_PANEL, L_RRHH, L_RECLUTAMIENTO],
  Visualizar: [L_PANEL, L_SEGUIMIENTO],
  Descargar: [L_PANEL, L_SEGUIMIENTO, L_CALENDARIO],
  Superusuario: [L_PANEL, L_SEGUIMIENTO, L_CALENDARIO, L_RRHH, L_RECLUTAMIENTO, L_ADMIN] // para ver las lecciones de otro rol: "Ver como"
};
export const leccionesPara = rol => LECCIONES[rol] || [L_PANEL];
