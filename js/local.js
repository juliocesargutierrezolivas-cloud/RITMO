// RITMO · Copias guardadas en este navegador (IndexedDB)
// Solo existen en el equipo y navegador donde se guardaron. No se sincronizan.
const DB = "ritmo-local", ST = "copias";
function abrir() {
  return new Promise((ok, mal) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(ST, { keyPath: "id" });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => mal(r.error);
  });
}
async function tx(modo, fn) {
  const db = await abrir();
  return new Promise((ok, mal) => {
    const t = db.transaction(ST, modo), s = t.objectStore(ST);
    const r = fn(s);
    t.oncomplete = () => ok(r && "result" in r ? r.result : undefined);
    t.onerror = () => mal(t.error);
  });
}
export const disponible = () => { try { return !!window.indexedDB; } catch (e) { return false; } };
// item: {tipo:'respaldo'|'asistencia', tienda, quincena, archivo, contenido, dueño}
export async function guardar(item) {
  const id = `${item.dueño}|${item.tipo}|${item.tienda}|${item.quincena}`;
  await tx("readwrite", s => s.put({ ...item, id, fecha: new Date().toISOString(), bytes: item.contenido.length }));
  return id;
}
export async function listar(dueño) {
  const all = (await tx("readonly", s => s.getAll())) || [];
  return all.filter(x => x.dueño === dueño).sort((a, b) => b.fecha.localeCompare(a.fecha));
}
export const borrar = id => tx("readwrite", s => s.delete(id));
export async function borrarTodo(dueño) { for (const x of await listar(dueño)) await borrar(x.id); }
