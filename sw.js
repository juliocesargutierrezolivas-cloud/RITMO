// RITMO · Service Worker: guarda la interfaz y la ayuda en el navegador para que el asistente y las pantallas abran sin internet.
// No guarda datos de Firebase (horarios, personal, entregas): esos siempre van a la red. Sin internet, RITMO muestra la
// interfaz guardada y el asistente funciona; los datos reales vuelven al recuperar la conexión.
// Para publicar una versión nueva de este archivo, cambia VERSION (se borran las copias anteriores).
const VERSION = "ritmo-v1";

const CASCARON = [
  "./", "index.html", "panel.html", "visor.html", "generador.html",
  "js/nube.js", "js/firebase-config.js", "js/local.js", "js/novedades.js", "js/tutorial.js", "js/rrhh.js", "js/roles.js", "js/asistente.js",
  "js/beta-demo.js", "js/vendor/qrcode.min.js",
  "assets/logo-ampm.png", "assets/logo-mbk.png", "assets/og-ritmo.png"
];
// Servicios externos de los que depende la interfaz (SDK de Firebase, SheetJS y tipografías): se guardan al usarlos.
const EXTERNOS = ["www.gstatic.com", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(CASCARON.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("ritmo-") && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// La copia se guarda sin la parte de consulta (?rol=…, ?v=…): sin internet siempre sale la más reciente de esa página.
const clave = req => { const u = new URL(req.url); u.search = ""; return u.href; };
async function redPrimero(req) { // páginas y código: siempre lo más nuevo si hay internet; si no, la copia guardada
  try {
    // no-cache: el navegador pregunta al servidor si el archivo cambió (petición condicional, barata) en vez de usar su copia
    // temporal de hasta 10 minutos. Así, cerrar sesión y volver a entrar siempre trae la versión publicada más reciente.
    const r = await fetch(req.url, { cache: "no-cache" });
    if (r && r.ok) { const c = await caches.open(VERSION); c.put(clave(req), r.clone()); }
    return r;
  } catch (err) {
    const c = await caches.open(VERSION);
    return (await c.match(clave(req))) || (req.mode === "navigate" ? await c.match("index.html") : Response.error());
  }
}
async function cachePrimero(req) { // imágenes y animaciones
  const c = await caches.open(VERSION), g = await c.match(req);
  if (g) return g;
  const r = await fetch(req); if (r && r.ok) c.put(req, r.clone()); return r;
}
async function revalidar(req) { // librerías externas: rápido desde la copia y se actualiza en segundo plano
  const c = await caches.open(VERSION), g = await c.match(req);
  const red = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => null);
  return g || (await red) || Response.error();
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    if (/\.(png|gif|jpg|jpeg|svg|webp|ico)$/i.test(u.pathname)) return e.respondWith(cachePrimero(req));
    return e.respondWith(redPrimero(req));
  }
  if (EXTERNOS.includes(u.hostname)) return e.respondWith(revalidar(req));
  // Todo lo demás (Firestore, Authentication…) pasa directo a la red
});
