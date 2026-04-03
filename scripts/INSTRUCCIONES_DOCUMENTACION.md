# 📝 Instrucciones: Completar Documentación de Columnas en BigQuery

**Estado actual:** Ya tienes 7 columnas documentadas con emojis y estrellas ⭐  
**Faltan:** 44 columnas sin descripción

---

## 🎯 OBJETIVO

Completar las descripciones faltantes en `daily_biometrics_v2` manteniendo el estilo existente:
- ✅ Emojis para contexto visual
- ✅ Rangos de valores esperados
- ✅ Estrellas (⭐) para indicar importancia
- ✅ Explicaciones claras en español

---

## 🚀 EJECUCIÓN (Desde tu Mac Mini M1)

### Paso 1: Configurar credenciales

```bash
cd ~/Downloads/oura-dashboard
export GOOGLE_APPLICATION_CREDENTIALS="config/service_account.json"
```

### Paso 2: Ejecutar script

```bash
python3 scripts/complete_missing_descriptions.py
```

### Paso 3: Revisar y confirmar

El script mostrará:
```
📝 Completando descripciones faltantes en daily_biometrics_v2...

  ✅ total_sleep_seconds
     Tiempo total dormido en segundos. Rango: 14400-36000s (4-10h). I...
  ✅ rem_sleep_seconds
     Sueño REM en segundos. Rango: 5400-10800s (1.5-3h). Fase de sue...
  ✅ deep_sleep_seconds
     Sueño profundo en segundos. Rango: 3600-7200s (1-2h). Reparació...
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN:
   • Descripciones agregadas: 44
   • Descripciones mantenidas: 7
   • Total columnas: 51
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

¿Actualizar tabla en BigQuery? (y/n):
```

Escribe `y` y presiona Enter para confirmar.

---

## ✅ VERIFICACIÓN

Después de ejecutar, verifica en BigQuery Console:

1. Ve a: https://console.cloud.google.com/bigquery?project=last-240000
2. Navega a: `oura_biometrics` → `daily_biometrics_v2`
3. Haz clic en pestaña **"Esquema"**
4. Verifica que las 44 columnas nuevas tengan descripción

**Ejemplo de cómo se verá:**

```
Columna: total_sleep_seconds
Tipo: INTEGER
Modo: NULLABLE
Descripción: Tiempo total dormido en segundos. Rango: 14400-36000s (4-10h). Incluye deep+REM+light. ⭐⭐⭐⭐⭐
```

---

## 📊 COLUMNAS QUE SE DOCUMENTARÁN

### Métricas de Sueño (9 columnas)
- `total_sleep_seconds`, `rem_sleep_seconds`, `deep_sleep_seconds`
- `light_sleep_seconds`, `awake_time_seconds`, `sleep_efficiency_pct`
- `sleep_latency_seconds`, `bed_time_start`, `bed_time_end`

### Métricas Cardíacas (2 columnas)
- `average_heart_rate`, `lowest_heart_rate`

### Temperatura y Respiración (3 columnas)
- `respiratory_rate_bpm`, `temperature_deviation_celsius`
- `temperature_trend_deviation_celsius`

### Actividad Física (6 columnas)
- `steps`, `active_calories`, `total_calories`
- `sedentary_time_seconds`, `equivalent_walking_distance_meters`
- `target_meters`, `meters_to_target`

### Horas de Actividad (5 columnas)
- `high_activity_hours`, `medium_activity_hours`, `low_activity_hours`
- `resting_hours`, `non_wear_hours`

### MET Minutes (5 columnas)
- `average_met_minutes`, `high_activity_met_minutes`
- `medium_activity_met_minutes`, `low_activity_met_minutes`
- `sedentary_met_minutes`

### Contributors de Readiness (9 columnas)
- `activity_balance`, `body_temperature_contributor`, `hrv_balance`
- `previous_day_activity`, `previous_night`, `recovery_index`
- `resting_heart_rate_contributor`, `sleep_balance`, `sleep_regularity`

### Otros (5 columnas)
- `day_summary`, `sleep_type`, `restless_periods`, `inactivity_alerts`

---

## 🛡️ SEGURIDAD

**El script:**
- ✅ Mantiene las 7 descripciones existentes (no las sobrescribe)
- ✅ Solo agrega descripciones a columnas sin descripción
- ✅ Pide confirmación antes de actualizar BigQuery
- ✅ No modifica tipos de datos ni estructura

**Si algo sale mal:**
- BigQuery mantiene historial de cambios por 7 días
- Puedes revertir desde la consola: "Restaurar tabla"

---

## 📝 EJEMPLO DE DESCRIPCIONES

**Estilo actual (que se mantendrá):**
```
calendar_date: Fecha del día calendario. CLUSTERING KEY principal. Rango: 2020-01-01 a presente.
readiness_score: Preparación para el día. Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐
```

**Nuevas descripciones (mismo estilo):**
```
total_sleep_seconds: Tiempo total dormido en segundos. Rango: 14400-36000s (4-10h). Incluye deep+REM+light. ⭐⭐⭐⭐⭐
steps: 🚶 Pasos totales del día. Rango: 0-50000 (meta: 10000+). ⭐⭐⭐⭐⭐
hrv_balance: ❤️ Balance HRV (contributor). Rango: 0-100. Variabilidad del ritmo cardíaco. ⭐⭐⭐⭐⭐
```

---

## 🐛 TROUBLESHOOTING

### Error: "Permission denied"
**Solución:** Verifica que el service account tenga rol `BigQuery Data Editor`

### Error: "Table not found"
**Solución:** Confirma que estás en el proyecto correcto (`last-240000`)

### Las descripciones no aparecen en la consola
**Solución:** Refresca la página (Ctrl+R o Cmd+R)

---

## 📞 SOPORTE

Si encuentras algún problema:
1. Revisa los logs del script
2. Verifica permisos del service account
3. Contacta al equipo de datos

---

**Tiempo estimado:** 30 segundos  
**Impacto:** Mejora de documentación y buenas prácticas ✅
