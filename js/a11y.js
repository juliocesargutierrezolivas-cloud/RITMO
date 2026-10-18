// RITMO · Accesibilidad: tema claro/oscuro, tamaño de letra y luz nocturna. Se carga en <head> (script clásico) para no parpadear.
// Preferencia guardada en este navegador: ritmo_accessibility. Dentro del iframe del Generador no hace nada: lo escala la página que lo contiene.
(function () {
  "use strict";
  var KEY = "ritmo_accessibility", D = { tema: "auto", letra: 100, noche: 0 };
  var enMarco = window.top !== window;
  function leer() {
    try { var o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o && typeof o === "object") return ok(o); } catch (e) {}
    return ok({});
  }
  function ok(o) {
    var t = ["auto", "claro", "oscuro"].indexOf(o.tema) >= 0 ? o.tema : D.tema;
    var l = [100, 112, 125].indexOf(+o.letra) >= 0 ? +o.letra : D.letra;
    var n = [0, 1, 2, 3].indexOf(+o.noche) >= 0 ? +o.noche : D.noche;
    return { tema: t, letra: l, noche: n };
  }
  var P = leer(), mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  function oscuro() { return P.tema === "oscuro" || (P.tema === "auto" && mq && mq.matches); }
  var capa;
  function aplicar() {
    if (enMarco) return;
    var h = document.documentElement;
    h.setAttribute("data-tema", oscuro() ? "oscuro" : "claro");
    h.style.zoom = P.letra === 100 ? "" : String(P.letra / 100);
    if (document.body) {
      if (!capa) { capa = document.createElement("div"); capa.setAttribute("aria-hidden", "true"); capa.id = "a11yNoche"; document.body.appendChild(capa); }
      capa.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483000;mix-blend-mode:multiply;transition:background .3s;background:" +
        ["transparent", "rgba(255,214,150,.18)", "rgba(255,190,110,.32)", "rgba(255,165,80,.46)"][P.noche];
    }
  }
  function poner(k, v) { P[k] = v; P = ok(P); guardar(); aplicar(); pintarPanel(); }
  if (mq && mq.addEventListener) mq.addEventListener("change", aplicar);
  if (!enMarco) aplicar();

  // ----- Ventana de ajustes (se crea al primer uso)
  var caja, boton;
  function pintarPanel() {
    if (!caja) return;
    caja.querySelectorAll("[data-k]").forEach(function (b) {
      var on = String(P[b.dataset.k]) === b.dataset.v; b.setAttribute("aria-pressed", on ? "true" : "false"); b.className = "a11y-op" + (on ? " on" : "");
    });
  }
  function abrir() {
    if (caja) { caja.hidden = !caja.hidden; if (!caja.hidden) caja.querySelector("button").focus(); return; }
    caja = document.createElement("div"); caja.id = "a11yBox"; caja.setAttribute("role", "dialog"); caja.setAttribute("aria-label", "Accesibilidad");
    var grupo = function (t, k, ops) {
      return '<div class="a11y-g"><b>' + t + "</b><div>" + ops.map(function (o) { return '<button type="button" data-k="' + k + '" data-v="' + o[0] + '">' + o[1] + "</button>"; }).join("") + "</div></div>";
    };
    caja.innerHTML = '<div class="a11y-h"><b>Accesibilidad</b><button type="button" id="a11yX" aria-label="Cerrar">✕</button></div>' +
      grupo("Tema", "tema", [["auto", "Automático"], ["claro", "Claro"], ["oscuro", "Oscuro"]]) +
      grupo("Tamaño de letra", "letra", [[100, "100 %"], [112, "112 %"], [125, "125 %"]]) +
      grupo("Luz nocturna", "noche", [[0, "Apagada"], [1, "Suave"], [2, "Media"], [3, "Cálida"]]) +
      '<button type="button" id="a11yR" class="a11y-r">Restablecer</button>';
    document.body.appendChild(caja);
    caja.addEventListener("click", function (e) {
      var b = e.target.closest("[data-k]"); if (b) { poner(b.dataset.k, b.dataset.k === "tema" ? b.dataset.v : +b.dataset.v); return; }
      if (e.target.closest("#a11yX")) caja.hidden = true;
      if (e.target.closest("#a11yR")) { P = ok({}); guardar(); aplicar(); pintarPanel(); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && caja && !caja.hidden) { caja.hidden = true; if (boton) boton.focus(); } });
    pintarPanel(); caja.querySelector("button").focus();
  }
  function montarBoton() {
    if (enMarco || boton) return;
    var tut = document.getElementById("tutB");
    boton = document.createElement("button"); boton.type = "button"; boton.id = "a11yB"; boton.setAttribute("aria-label", "Accesibilidad"); boton.title = "Accesibilidad: tema, letra y luz nocturna"; boton.textContent = "Aa";
    if (tut && tut.parentNode) { boton.className = "btn"; tut.parentNode.insertBefore(boton, tut); }
    else { boton.className = "a11y-flot"; document.body.appendChild(boton); }
    boton.addEventListener("click", abrir);
  }
  function listo() { aplicar(); montarBoton(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", listo); else listo();
  window.RitmoA11y = { get: function () { return Object.assign({}, P); }, set: poner, abrir: abrir };
})();
