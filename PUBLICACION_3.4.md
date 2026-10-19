# RITMO · Publicación 3.4 (cambios del 2026-10-19)

Incluye los cambios 1 a 12 de `CAMBIOS_2026-10-19.md`, además de la 3.3 si aún no se fusionó.

## Orden de publicación
1. **GitHub Desktop:** rama `ritmo-3-4` → Publish branch → Create Pull Request → Merge.
2. **Firebase → Firestore → Reglas:** pegar todo `firestore.rules` y Publicar. Es **obligatorio**: agrega `auditoria` (nueva) y ya traía `mbk` y `prospectos`.
3. Esperar 1–2 minutos, cerrar sesión y volver a entrar (aviso de la 3.4).

## Qué probar
- **Seguimiento:** tarjetas con quincena, columna HE / Feriadas y semáforo. Los datos de horas extra aparecen cuando cada gerente guarde su horario (no antes).
- **MBK:** elegir varias semanas, aprobar la selección como GZ, descargar la imagen. GD y GO sin casilla de aprobar.
- **Recordatorio y Excel** (botones junto a los filtros).
- **Ver como:** auxiliares de planilla (salen de la columna "Auxiliar de planilla" del Excel de Roles).
- **RRHH:** rotación y bajas, Excel de personal.
- **Administración:** registro de auditoría (se llena con aprobaciones nuevas).
- **Campanita:** avisos según el rol.

## Notas
- Las cifras de horas extra y MBK las publica el **Generador** al guardar el horario; las tiendas que no lo abran aparecen sin dato.
- El "mbk" del semáforo y la alerta "entregó y no pidió MBK" usan la cantidad de agentes MBK que cada tienda publica; se completa cuando guardan su horario o cuando el superusuario recarga las altas.
- No incluido: correos automáticos y app instalable (decisión del 2026-10-19).
