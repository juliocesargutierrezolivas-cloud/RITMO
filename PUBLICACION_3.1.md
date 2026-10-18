# RITMO · Publicación final 2.10 → 3.1

## Qué incluye
- **2.10** · Carga de altas solo del superusuario, estado de cargas, respaldo y reinicio, número de tienda tomado del código (AMPM16 → 16), RRHH/Reclutamiento sin quincena.
- **3.0** · Pantalla de carga con barras del logo, manual ocultable, accesibilidad (botón **Aa**: tema, letra 100/112/125 %, luz nocturna), tablero de RRHH (filtros región/zona/tienda, tarjetas que filtran, estado por tienda, ficha de la persona).
- **3.1** · Doble motivo de baja en la ficha, prospectos de reclutamiento con "Contratar".

## Archivos nuevos o cambiados
`panel.html`, `visor.html`, `index.html`, `sw.js`, `js/novedades.js`, `js/a11y.js` (nuevo), `css/ritmo-a11y.css` (nuevo), `firestore.rules`, `ANALISIS_MEJORAS_2026-10-18.md`, este archivo.

## Orden de publicación
1. **GitHub Desktop** (rama nueva o `ritmo-2-9`): resumen `v3.1: accesibilidad, tablero RRHH, doble motivo de baja y prospectos` → Commit → Push → Pull Request → Merge.
2. **Firebase → Firestore → Reglas**: pega todo `firestore.rules` y pulsa Publicar. **Es obligatorio** para 3.1: agrega la colección `prospectos`; sin esto, crear prospectos da "permission-denied".
3. Espera 1–2 minutos, cierra sesión y vuelve a entrar (verás el aviso de la 3.1).
4. Prueba rápida: botón **Aa**; RRHH → filtros y ficha; Reclutamiento → crear un prospecto, pasarlo a "Aceptado por la tienda" y contratarlo (usa una cédula de prueba y luego elimina la línea con ✕).

## Decisiones tomadas por defecto (cámbialas si no te sirven)
- Tema oscuro cubre panel, inicio y visor; el Generador recibe tamaño de letra y luz nocturna desde el panel.
- "Aceptado por la tienda" lo marca el reclutador (no el gerente dentro de RITMO).
- Prospectos no guardan cédula hasta contratar.
- La tarjeta "3 · Registrar una baja" sigue; la baja también se puede registrar desde la ficha.

## Pendiente (necesita tus respuestas)
Tipo de contrato · quién ve/edita salarios · "aprobado" y bloqueos en MBK · cuántos reclutadores y cómo se asignan · novedades, estudiantes y carga de trabajo (requieren que el Generador publique resúmenes) · GT adicional / eventual · Planilla MBK para el GZ · editar/eliminar tiendas.
