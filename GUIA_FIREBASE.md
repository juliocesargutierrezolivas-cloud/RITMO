# RITMO · Conectar Firebase (una sola vez, ~10 min)

Firebase guarda los usuarios y las entregas de cada quincena. Plan gratuito (Spark).

## 1. Crear el proyecto
1. Entra a **console.firebase.google.com** con la cuenta de Google que será dueña del sistema.
2. **Crear un proyecto** → nombre: `ritmo-ampm` → desactiva Google Analytics → **Crear**.

## 2. Activar el inicio de sesión
1. Menú izquierdo › **Compilación › Authentication › Comenzar**.
2. Pestaña **Método de acceso** › **Correo electrónico/contraseña** › activa el primer interruptor › **Guardar**.
3. Pestaña **Configuración › Dominios autorizados** › **Agregar dominio** › `juliocesargutierrezolivas-cloud.github.io`.
4. Pestaña **Plantillas** › lápiz › **Idioma de la plantilla: Español**.

## 3. Crear la base de datos
1. **Compilación › Firestore Database › Crear base de datos**.
2. Ubicación: `nam5 (United States)` › **Modo de producción** › **Crear**.
3. Pestaña **Reglas** › borra todo › pega el contenido de `firestore.rules` › **Publicar**.

## 4. Registrar la app web
1. ⚙ **Configuración del proyecto › General › Tus apps** › icono **</>**.
2. Apodo: `RITMO web` (sin Hosting) › **Registrar app**.
3. Copia el bloque `firebaseConfig` (apiKey, authDomain, projectId…) y pégalo en el chat para Claude, o en `js/firebase-config.js`.

## 5. Tu acceso de superusuario
1. **Authentication › Usuarios › Agregar usuario**.
2. Correo: `julio.gutierrez@ampm.com.ni` · contraseña: la que tú elijas (mín. 8 caracteres).

## 6. Cargar a todos
1. Entra a RITMO con tu correo.
2. **Administración › Importar roles** › elige `Roles_de_Ritmo_v2.xlsx` › **Publicar tiendas y usuarios**.
3. **Crear accesos**: crea cada cuenta y envía a cada correo un enlace para que defina su contraseña.

## Seguridad
- El `firebaseConfig` no es secreto; la protección la dan las reglas de `firestore.rules`.
- Cada gerente solo ve y entrega su tienda. GZ, distrito y operaciones solo ven el estado.
- El contenido de los respaldos (cédulas y salarios) solo lo leen la tienda, planilla y el superusuario.
- Nunca subir Excel, JSON de respaldo ni planillas al repositorio (bloqueado en `.gitignore`).
