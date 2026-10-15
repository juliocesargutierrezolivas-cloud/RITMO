// RITMO · Conexión con Firebase (Auth + Firestore)
import { firebaseConfig, configurado, SUPERUSUARIO } from "./firebase-config.js";
const V = "10.12.5";
let app, auth, db, A, F;

export async function nube() {
  if (!configurado) return null;
  if (app) return { app, auth, db, A, F };
  const [{ initializeApp }, Am, Fm] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)
  ]);
  A = Am; F = Fm;
  app = initializeApp(firebaseConfig);
  auth = A.getAuth(app);
  db = F.getFirestore(app);
  return { app, auth, db, A, F };
}

// App secundaria: permite al superusuario crear cuentas sin cerrar su propia sesión.
let app2;
export async function authSecundaria() {
  const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  if (!app2) app2 = initializeApp(firebaseConfig, "ritmo-admin");
  return A.getAuth(app2);
}

export const correo = s => String(s || "").trim().toLowerCase();
export { configurado, SUPERUSUARIO };

// Quincena actual: "2026-10-Q1" (días 1–15) o "2026-10-Q2" (16–fin)
export function quincena(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${m}-Q${d.getDate() <= 15 ? 1 : 2}`;
}
export function quincenaTexto(q) {
  const [y, m, k] = q.split("-");
  const mes = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][+m - 1];
  return `${k === "Q1" ? "1ra" : "2da"} quincena de ${mes} ${y}`;
}
