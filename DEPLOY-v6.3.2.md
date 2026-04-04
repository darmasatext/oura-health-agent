# Despliegue Dashboard v6.3.2 - RESPIRATORY-FIX

**Fecha:** 2026-04-03  
**Fix:** Removido campo `respiratory_rate_bpm` inexistente del query Sleep

---

## 🐛 Problema Resuelto

**Error anterior:**
```
BigQuery error: Unrecognized name: respiratory_rate_bpm at [25:7]
```

**Causa:** El query `getSleepData` en `/lib/queries-multiuser.ts` intentaba seleccionar la columna `respiratory_rate_bpm`, pero:
- ❌ No existe en el schema de BigQuery (`daily_biometrics_v2`)
- ❌ No está definida en el ETL v7.1
- ❌ No se usa en ninguna parte de la UI

**Solución:** Eliminada la línea del query (línea 41 de `queries-multiuser.ts`)

---

## 📦 Package Generado

**Ubicación GCS:**
```
gs://oura-dashboard-deploy-20260329/releases/dashboard-v6.3.2-RESPIRATORY-FIX.tar.gz
```

**Tamaño:** 5.8 MB  
**Archivos incluidos:**
- `dashboard/.next/` (build optimizado)
- `dashboard/lib/` (queries corregidos)
- `dashboard/app/` (páginas)
- `package.json`, `package-lock.json`, `next.config.js`

---

## 🚀 Instrucciones de Despliegue

### En `octo` (VPS de producción)

```bash
# 1. SSH a octo
ssh octo

# 2. Descargar package
cd /root
gsutil cp gs://oura-dashboard-deploy-20260329/releases/dashboard-v6.3.2-RESPIRATORY-FIX.tar.gz .

# 3. Backup del dashboard actual
cd /root/oura-dashboard
tar -czf ~/dashboard-backup-$(date +%Y%m%d-%H%M).tar.gz dashboard/

# 4. Extraer nueva versión
tar -xzf ~/dashboard-v6.3.2-RESPIRATORY-FIX.tar.gz

# 5. Verificar variables de entorno
cat dashboard/.env.local
# Debe contener:
# BIGQUERY_PROJECT_ID=last-240000
# BIGQUERY_DATASET=oura_biometrics
# GOOGLE_APPLICATION_CREDENTIALS=/root/credentials/bq-readonly-key.json

# 6. Reiniciar servicio
sudo systemctl restart oura-dashboard

# 7. Verificar logs
sudo journalctl -u oura-dashboard -f --lines=50
```

### Verificación Post-Despliegue

```bash
# Check de salud
curl http://localhost:3000

# Probar página Sleep específicamente
curl -I http://localhost:3000/sleep

# Ver logs en tiempo real
sudo journalctl -u oura-dashboard -f
```

**Esperar ver:**
- ✅ "ready" en los logs
- ✅ Status 200 en `/sleep`
- ✅ Sin errores de BigQuery

---

## 🔍 Verificación de Datos

**Query de prueba en BigQuery:**
```sql
-- Verificar que el dashboard puede consultar datos
SELECT 
  calendar_date,
  sleep_score,
  total_sleep_seconds,
  average_heart_rate,
  lowest_heart_rate_bpm
FROM `last-240000.oura_biometrics.daily_biometrics_fer`
WHERE calendar_date >= CURRENT_DATE() - 7
  AND sleep_score IS NOT NULL
ORDER BY calendar_date DESC
LIMIT 10
```

**Nota:** Ya NO se selecciona `respiratory_rate_bpm`. Si se necesita en el futuro, agregar al ETL primero.

---

## 🔧 Rollback (si es necesario)

```bash
# Restaurar backup anterior
cd /root/oura-dashboard
rm -rf dashboard/
tar -xzf ~/dashboard-backup-YYYYMMDD-HHMM.tar.gz
sudo systemctl restart oura-dashboard
```

---

## 📋 Cambios en el Código

**Archivo modificado:**
- `dashboard/lib/queries-multiuser.ts` (línea 41 eliminada)

**Diff:**
```diff
       bedtime_start,
       bedtime_end,
       average_heart_rate,
       lowest_heart_rate_bpm,
-      respiratory_rate_bpm
     FROM `${PROJECT_ID}.${DATASET}.${TABLE}`
```

---

## ✅ Checklist de Despliegue

- [ ] Package descargado de GCS
- [ ] Backup del dashboard actual creado
- [ ] Nueva versión extraída
- [ ] Variables de entorno verificadas
- [ ] Servicio reiniciado
- [ ] Página `/sleep` carga sin errores BigQuery
- [ ] Logs muestran "ready" sin errores
- [ ] Datos de sleep se visualizan correctamente

---

## 📞 Soporte

Si hay problemas:
1. Revisar logs: `sudo journalctl -u oura-dashboard -f`
2. Verificar credenciales BigQuery: `cat /root/credentials/bq-readonly-key.json`
3. Probar query manualmente en BigQuery console
4. Rollback si es crítico

**Fix futuro:** Si se necesita `respiratory_rate`, agregarlo primero al ETL en `main_v3_multiuser.py`.
