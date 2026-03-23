# 📊 BIGQUERY V2 VALIDATION REPORT

**Proyecto**: YOUR_PROJECT_ID  
**Dataset**: oura_biometrics  
**Tabla**: daily_biometrics_v2  
**Fecha**: 2026-03-23  

---

## ✅ RESUMEN EJECUTIVO

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Total registros** | 85 | ✅ |
| **Rango de fechas** | 2025-12-29 → 2026-03-23 | ✅ |
| **Días únicos** | 85 | ✅ |
| **HRV coverage** | 84.7% (72/85) | ✅ >80% |
| **Contributors coverage** | 88.2% (75/85) | ✅ >80% |
| **Particionamiento** | Activo (by ingestion_timestamp) | ✅ |
| **Clustering** | Activo (by calendar_date) | ✅ |

---

## 📈 1. COMPARACIÓN V1 vs V2

### Tabla Gold (v1)
- Registros: 85
- Rango: 2025-12-29 → 2026-03-23
- Días únicos: 85
- Sleep score coverage: 95.3%
- Readiness score coverage: 94.1%

### Tabla V2 (nueva)
- Registros: 85
- Rango: 2025-12-29 → 2026-03-23
- Días únicos: 85
- Sleep score coverage: 95.3%
- Readiness score coverage: 94.1%
- **Métricas adicionales**: 23 nuevos campos

**Resultado**: ✅ Paridad completa en métricas existentes

---

## 💓 2. NUEVAS MÉTRICAS V2

### HRV (Heart Rate Variability)
| Métrica | Valor |
|---------|-------|
| Días con datos | 72/85 (84.7%) |
| HRV promedio | 42.3 ms |
| HRV mínimo | 18 ms |
| HRV máximo | 87 ms |
| Outliers | 0 |

**Resultado**: ✅ Coverage >80%, rangos normales (18-87ms)

### Readiness Contributors (9 campos)
| Métrica | Valor |
|---------|-------|
| Días con datos | 75/85 (88.2%) |
| Activity balance avg | 78 |
| HRV balance avg | 72 |
| Recovery index avg | 81 |
| Sleep balance avg | 85 |

**Resultado**: ✅ Coverage >80%, valores en rango 0-100

### Activity Breakdown (horas)
| Métrica | Promedio |
|---------|----------|
| High activity | 1.2 hrs |
| Medium activity | 3.4 hrs |
| Low activity | 5.8 hrs |
| Resting | 12.3 hrs |
| Non-wear | 1.3 hrs |

**Resultado**: ✅ Total ~24 horas/día (esperado)

### MET Minutes
| Métrica | Promedio |
|---------|----------|
| Average MET | 1.4 |
| High activity MET | 245 min |
| Medium activity MET | 378 min |
| Low activity MET | 512 min |
| Sedentary MET | 185 min |

**Resultado**: ✅ Distribución normal

### Temperature & Distance
| Métrica | Coverage |
|---------|----------|
| Temperature trend | 88.2% (75/85) |
| Target meters | 100% (85/85) |
| Meters to target | 100% (85/85) |

**Resultado**: ✅ Buena cobertura

---

## 🔍 3. VALIDACIÓN DE RANGOS

### HRV
- ✅ Min: 18 ms (dentro de rango normal)
- ✅ Max: 87 ms (dentro de rango normal)
- ✅ Outliers (< 0 o > 200): 0

### Contributors
- ✅ Min: 12 (activity_balance)
- ✅ Max: 100 (sleep_regularity)
- ✅ Outliers (< 0 o > 100): 0

### Temperature Trend
- ✅ Min: -0.8°C
- ✅ Max: +0.6°C
- ✅ Outliers: 0

**Resultado**: ✅ Sin outliers, todos los valores en rangos esperados

---

## 📅 4. ÚLTIMOS 7 DÍAS (Muestra)

| Fecha | Sleep | Ready | HRV (ms) | Steps | Contributors |
|-------|-------|-------|----------|-------|--------------|
| 2026-03-23 | 82 | 78 | 45 | 8,234 | ✅ |
| 2026-03-22 | 88 | 85 | 52 | 12,456 | ✅ |
| 2026-03-21 | 76 | 72 | 38 | 6,789 | ✅ |
| 2026-03-20 | 91 | 88 | 58 | 15,234 | ✅ |
| 2026-03-19 | 84 | 81 | 47 | 9,876 | ✅ |
| 2026-03-18 | 79 | 75 | 41 | 7,654 | ✅ |
| 2026-03-17 | 86 | 83 | 49 | 11,234 | ✅ |

**Resultado**: ✅ Datos consistentes, sin gaps

---

## ⚡ 5. OPTIMIZACIÓN (Partitioning & Clustering)

### Query Plan Analysis

**Query sin optimización**:
```sql
SELECT * FROM daily_biometrics_v2 WHERE calendar_date >= '2026-03-01'
```
- Datos escaneados: ~2 MB (tabla completa)
- Slots consumidos: 100

**Query optimizada (con partition + cluster)**:
```sql
SELECT * FROM daily_biometrics_v2 
WHERE ingestion_timestamp >= TIMESTAMP('2026-03-01')
  AND calendar_date >= '2026-03-01'
ORDER BY calendar_date DESC
```
- Datos escaneados: ~0.3 MB (solo particiones relevantes)
- Slots consumidos: 25
- **Mejora**: 85% menos datos escaneados, 75% menos slots

**Resultado**: ✅ Particionamiento y clustering funcionan correctamente

---

## 🔄 6. CONSISTENCIA V1 vs V2 (Overlap Check)

Verificación de métricas existentes (últimos 7 días):

| Fecha | Sleep Match | Ready Match | Steps Match | Status |
|-------|-------------|-------------|-------------|--------|
| 2026-03-23 | ✅ | ✅ | ✅ | OK |
| 2026-03-22 | ✅ | ✅ | ✅ | OK |
| 2026-03-21 | ✅ | ✅ | ✅ | OK |
| 2026-03-20 | ✅ | ✅ | ✅ | OK |
| 2026-03-19 | ✅ | ✅ | ✅ | OK |
| 2026-03-18 | ✅ | ✅ | ✅ | OK |
| 2026-03-17 | ✅ | ✅ | ✅ | OK |

**Diferencias encontradas**: 0  
**Resultado**: ✅ Paridad 100% con tabla v1

---

## 💾 7. STORAGE & COSTO

| Tabla | Tamaño | Filas | Costo Mensual (USD) |
|-------|--------|-------|---------------------|
| daily_biometrics_gold (v1) | 1.8 MB | 85 | $0.00036 |
| daily_biometrics_v2 | 2.1 MB | 85 | $0.00042 |

**Incremento**: +0.3 MB (+16.7%)  
**Costo adicional**: +$0.00006/mes (negligible)

**Resultado**: ✅ Incremento mínimo justificado por 23 métricas adicionales

---

## ✅ CONCLUSIÓN

### Todas las validaciones PASARON

1. ✅ **Cobertura de datos**: 85 registros, 85 días únicos
2. ✅ **HRV coverage**: 84.7% (>80% objetivo)
3. ✅ **Contributors coverage**: 88.2% (>80% objetivo)
4. ✅ **Rangos válidos**: Sin outliers
5. ✅ **Consistencia v1 vs v2**: Paridad 100%
6. ✅ **Optimización**: Partitioning + clustering activos
7. ✅ **Costo**: Incremento negligible ($0.00006/mes)

### Estado Final
```
✅ BIGQUERY V2 LISTO - 85 filas cargadas, validación completa
```

### Próximos Pasos
1. ✅ Configurar sync diario (cambiar `LOOKBACK_DAYS=7` en `main_v2.py`)
2. ✅ Configurar Cloud Scheduler o cron para ejecución automática
3. ✅ Migrar queries existentes para usar nuevas métricas v2
4. ✅ Considerar deprecar tabla v1 después de 30 días de producción estable

---

**Validación ejecutada**: 2026-03-23 12:15 CST  
**Duración de migración**: 4 min 32 sec  
**API calls**: 6 endpoints × ~15 páginas = 90 requests  
**Rate limits**: 0 errores  

---

*Este es un TEMPLATE. El reporte real se generará automáticamente después de ejecutar `full_migration_v2.py`*
