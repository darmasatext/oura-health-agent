# ✅ OURA V2 MIGRATION - READY TO RUN

## 🚨 2 Comandos para Resolver

```bash
# 1. Autenticación BigQuery
unset GOOGLE_APPLICATION_CREDENTIALS && gcloud auth application-default login

# 2. Token Oura
export OURA_TOKEN="your_oura_token_here"
```

## 🚀 Ejecutar Migración

```bash
cd /home/coder/.openclaw/workspace/proyectos-source/oura
bash RUN_MIGRATION.sh
```

## 📊 Qué Hace

1. ✅ Crea tabla `daily_biometrics_v2` (46 métricas, partitioned + clustered)
2. ✅ Descarga 90 días de datos históricos de Oura API
3. ✅ Valida HRV coverage >80%, contributors >80%
4. ✅ Genera estadísticas y notifica por Telegram (opcional)

**Tiempo**: 3-5 minutos

## 📁 Archivos Creados

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| `full_migration_v2.py` | 18 KB | Script principal (crea tabla + carga + valida) |
| `create_table_v2.sql` | 9.7 KB | DDL tabla v2 (46 métricas) |
| `validate_v2.sql` | 6.7 KB | 7 queries de validación |
| `main_v2.py` | 15 KB | Sync diario (uso futuro) |
| `RUN_MIGRATION.sh` | 3.6 KB | One-click script |

## 🎯 Output Esperado

```
✅ MIGRACIÓN V2 COMPLETA
===============================================
📊 Registros cargados: 85
💓 HRV disponible: 72 días (84.7%)
🎯 Contributors disponibles: 75 días (88.2%)

✅ BIGQUERY V2 LISTO
```

## 📖 Más Información

- **Reporte completo**: `BIGQUERY-AGENT-REPORT.md`
- **Troubleshooting**: `BIGQUERY-MIGRATION-STATUS.md`
- **Auth details**: `BIGQUERY-AUTH-REQUIRED.md`

---

**TL;DR**: Autentica → Export token → `bash RUN_MIGRATION.sh` → ☕ Wait 3-5 min → Done ✅
