// RITMO · Configuración de Firebase
// Pega aquí los datos de tu app web (Consola Firebase › Configuración del proyecto › Tus apps).
// Estos valores NO son secretos: identifican el proyecto. La seguridad la dan las reglas (firestore.rules).
export const firebaseConfig = {
  apiKey: "AIzaSyB90skP4IQZ7881nMQsO9xc8GeedxlMjQU",
  authDomain: "ritmo-ampm.firebaseapp.com",
  projectId: "ritmo-ampm",
  storageBucket: "ritmo-ampm.firebasestorage.app",
  messagingSenderId: "701995166870",
  appId: "1:701995166870:web:8f26f82d31f6659049e6b7"
};

// Correo del superusuario inicial (debe coincidir con firestore.rules).
export const SUPERUSUARIO = "julio.gutierrez@ampm.com.ni";

export const configurado = !Object.values(firebaseConfig).some(v => String(v).includes("PEGAR"));
