// RITMO · Configuración de Firebase
// Pega aquí los datos de tu app web (Consola Firebase › Configuración del proyecto › Tus apps).
// Estos valores NO son secretos: identifican el proyecto. La seguridad la dan las reglas (firestore.rules).
export const firebaseConfig = {
  apiKey: "PEGAR_AQUI",
  authDomain: "PEGAR_AQUI",
  projectId: "PEGAR_AQUI",
  storageBucket: "PEGAR_AQUI",
  messagingSenderId: "PEGAR_AQUI",
  appId: "PEGAR_AQUI"
};

// Correo del superusuario inicial (debe coincidir con firestore.rules).
export const SUPERUSUARIO = "julio.gutierrez@ampm.com.ni";

export const configurado = !Object.values(firebaseConfig).some(v => String(v).includes("PEGAR"));
