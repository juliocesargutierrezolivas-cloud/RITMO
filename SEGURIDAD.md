# RITMO · Seguridad y protección de datos

RITMO manejará **datos personales del personal** (nombres, cédulas, salarios, horarios). Este documento define cómo protegerlos y cómo evitar filtraciones desde GitHub. No contiene secretos.

## 1. Regla de oro
**Ningún dato de personas ni credencial vive en GitHub.** El repositorio solo tiene código y documentación. Los datos reales viven únicamente en Firestore, protegidos por `firestore.rules`.

Qué NO es secreto (es público por diseño): `firebaseConfig` en `js/firebase-config.js`. Identifica el proyecto; lo que protege los datos son las reglas, Authentication y las restricciones de la API key (sección 3).

## 2. GitHub (hacer una vez, lo hace el propietario del repositorio)
- [ ] **Autenticación en dos pasos (2FA)** obligatoria en la cuenta propietaria y en cada colaborador. *Settings de la cuenta › Password and authentication.*
- [ ] **Secret scanning y Push protection**: *Repositorio › Settings › Code security › Secret scanning* y *Push protection* en "Enabled". Bloquea subir llaves o tokens por error.
- [ ] **Rama `main` protegida**: *Settings › Branches › Add rule* para `main`: exigir pull request, impedir force-push e impedir borrar la rama. GitHub Pages solo publica `main`, así que ningún cambio llega a los usuarios sin revisión.
- [ ] **Colaboradores mínimos**: solo quien deba cambiar el código, con rol *Write*, nunca *Admin*.
- [ ] **Dependabot alerts** activadas (*Code security*), aunque el sitio casi no tiene dependencias.
- [ ] **Revisar el historial**: buscar en GitHub (`Code search` y *Commits*) cédulas, correos personales, "Respaldo", "Roles", salarios. Si algo sensible se subió alguna vez, **borrarlo del archivo no basta**: queda en el historial. Hay que reescribir el historial (git filter-repo) y rotar lo expuesto; consultar antes de hacerlo.
- [ ] **Repositorio privado** si GitHub del plan lo permite con Pages; si es público, la regla de oro es aún más estricta.
- [ ] Antes de cada commit, revisar en GitHub Desktop que no aparezcan archivos `.xlsx`, `.json`, `.pdf` ni "Respaldo*" (`.gitignore` ya los bloquea; no usar "Add all" a ciegas ni forzar archivos ignorados).

## 3. Firebase / Google Cloud
- [ ] **Restringir la API key**: Consola Google Cloud › *APIs y servicios › Credenciales* › la clave del navegador › *Restricciones de aplicación* = **Sitios web (referentes HTTP)** con solo `juliocesargutierrezolivas-cloud.github.io/*` (y después el dominio propio de AMPM, y `localhost` solo mientras se desarrolla). Restringir las APIs a Identity Toolkit, Cloud Firestore y Token Service.
- [ ] **App Check** (Firebase › App Check): registrar la app web con reCAPTCHA Enterprise o v3, probar en modo *sin exigir* y luego **Exigir** para Firestore y Authentication. Evita que otros sitios usen el proyecto. Requiere sumar la inicialización de App Check en `js/nube.js` (pendiente; se hace con la clave de sitio que genere Firebase).
- [ ] **Reglas de Firestore**: publicar la versión actual de `firestore.rules` (ver sección 6). Revisarlas cada vez que cambie un rol.
- [ ] **Authentication**: solo correo y contraseña; desactivar el registro libre (las cuentas las crea el superusuario); dominios autorizados = solo el sitio oficial.
- [ ] **Alertas de presupuesto** en Google Cloud (aunque el plan Spark es gratuito) para detectar uso anómalo.
- [ ] **Propietarios del proyecto**: mínimo dos personas de AMPM con 2FA; retirar cuentas personales en el traspaso.
- [ ] **Exportes y respaldos** de Firestore, cuando exista plan Blaze, a un bucket privado con acceso restringido.

## 4. Protección de datos del personal
- **Mínimo necesario**: guardar solo lo que la planilla requiere. No pedir datos que no se usen.
- **Quién ve qué**: lo definen las reglas por rol y tienda (Editor: su tienda; Visualizar y Descargar: su alcance; Superusuario: todo). Cada nuevo módulo (por ejemplo RRHH) debe tener su regla antes de publicarse.
- **Salarios y cédulas**: se cargan solo por Administración o desde el Generador dentro de RITMO, nunca por correo, chat ni GitHub.
- **Equipos compartidos**: las copias de "Guardados aquí" quedan en el navegador (IndexedDB). No usarlas en computadoras compartidas y usar "Borrar todo" al terminar. Cerrar sesión siempre.
- **Contraseñas**: cambio obligatorio cada 60 días (ya implementado). Nunca compartirlas.
- **Descargas**: los Excel de planilla y respaldos descargados contienen datos personales; guardarlos solo en OneDrive corporativo, nunca en servicios personales.
- **Fotos de la hoja de asistencia**: contienen firmas; tratarlas como datos personales.
- **Cumpleaños**: de la cédula solo se toma día y mes; no se muestra el número.
- **Retención**: definir con RRHH y Legal por cuánto tiempo se conservan las entregas y cuándo se eliminan.
- **Marco legal**: en Nicaragua aplica la Ley 787 de Protección de Datos Personales. Confirmar con Legal el aviso de privacidad, el consentimiento y el registro de la base de datos antes de la salida a producción.
- **Incidentes**: si se sospecha una filtración (cuenta comprometida, archivo subido por error) avisar de inmediato al superusuario, cambiar contraseñas afectadas y, si fue a GitHub, seguir la sección 2.

## 5. Protecciones ya incluidas en el código
- **Content-Security-Policy** (`<meta>` en `index.html`, `panel.html`, `visor.html`, `generador.html`): solo permite cargar scripts de este sitio, Firebase (`gstatic.com`) y SheetJS (`cdnjs`); conexiones solo a este sitio y a Google/Firebase; sin `<object>`; formularios y `<base>` solo al propio sitio. Si se agrega un servicio externo (por ejemplo un servicio de correo), hay que añadir su dominio a la política y probar.
- **Referrer** `same-origin`: no se envía la dirección de RITMO a otros sitios.
- **`.gitignore`** bloquea Excel, CSV, JSON, PDF, respaldos, llaves y credenciales.
- **Reglas de Firestore**: cierre por defecto, la tienda de una entrega se toma del documento (un gerente no puede escribir en otra tienda) y la colección `sistema` es solo del superusuario.

Límite conocido: GitHub Pages no permite cabeceras HTTP, por lo que la CSP va como `<meta>` y no puede incluir `frame-ancestors` (protección contra que otro sitio embeba RITMO). Se resuelve con un dominio propio detrás de un proxy o con hosting de Firebase, y ya forma parte de la conversación del traspaso con TI.
- **Mejora futura**: eliminar los scripts y estilos en línea para quitar `'unsafe-inline'` de la CSP.

## 5b. Datos del personal en RITMO (RRHH y Reclutamiento)
- El registro central `personal` guarda nombre, cédula, cargo, categoría, empresa, tienda e ingreso. No guarda fecha de nacimiento, ciudad, jefe ni salario.
- El documento se llama con un identificador derivado de la cédula (no con la cédula). Solo lo leen quienes tienen el permiso `rrhh_ver` y el gerente de cada tienda (solo su personal). GZ, distrito y operaciones ven cifras en `resumen`, sin nombres.
- En pantalla las cédulas aparecen enmascaradas; hay que marcar "Mostrar cédulas" para verlas completas.
- El Excel de altas y el de presupuesto se leen en el navegador y no se suben; el `.gitignore` impide subirlos a GitHub.
- El Service Worker (`sw.js`) guarda solo archivos de la interfaz y la ayuda, nunca datos de Firebase.
- Los roles personalizados y sus permisos los administra solo el superusuario; el permiso `administracion` no se puede conceder.

### Riesgos conocidos que quedan (aceptados por ahora)
1. El cierre de los **horarios** del Generador es solo en pantalla; el de la **planilla** lo impone el servidor.
2. Quien tiene el permiso `aperturas` (Encargado de Reclutamiento) puede indicar el GZ de una tienda **nueva** que crea; no puede cambiar el de tiendas existentes.
3. Quien puede escribir el calendario de planilla (rol Descargar o permiso `calendario`) define las fechas que cierran las quincenas de todas las tiendas: una fecha equivocada cierra o deja abiertas quincenas. Conviene que sean pocas personas.
4. No hay bitácora de auditoría (quién cambió qué y cuándo) más allá de los campos `por` y `fecha`. Recomendado agregarla antes de crecer.
5. El identificador de `personal` es un hash sin sal de la cédula; solo importa si alguien obtiene los identificadores (no los lee quien no tiene permiso).
6. Falta definir con Legal el tiempo de conservación de los registros de personal dados de baja.

## 6. Antes de publicar un cambio
1. Probar en la vista previa (sin Firebase) y, si toca permisos, con una cuenta de prueba.
2. Confirmar que no hay datos personales ni llaves en lo que se va a subir.
3. Pull request a `main`, revisarlo y fusionar.
4. Si cambió `firestore.rules`: pegarlo en *Consola Firebase › Firestore › Reglas › Publicar*. **Las reglas no se publican solas con GitHub.**
5. Comprobar en línea el inicio de sesión y una entrega.
