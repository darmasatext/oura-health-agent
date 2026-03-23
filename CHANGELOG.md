# Changelog | Registro de Cambios

All notable changes to this project will be documented in this file.

Todos los cambios notables a este proyecto serán documentados en este archivo.

---

## [1.0.0] - 2026-03-22

### 🇬🇧 English

#### Added
- Initial release of Oura Health Agent
- Automated ETL pipeline from Oura Ring API to BigQuery
- Cloud Run Job deployment (2-minute execution)
- Telegram notifications with daily metrics
- 23 health metrics consolidated per day:
  - Sleep score, readiness, activity
  - Heart rate (avg, min), respiratory rate
  - Temperature deviation
  - Sleep stages (REM, deep, light)
  - Steps, calories, sedentary time
- Comprehensive bilingual documentation (EN + ES)
- MIT License
- Production-ready configuration

#### Technical
- Python 3.9
- Google Cloud Run Jobs
- BigQuery partitioned table
- Rate limiting handling (429)
- DELETE + INSERT strategy (no duplicates)
- Environment variables for secrets
- Docker containerization

---

### 🇪🇸 Español

#### Agregado
- Lanzamiento inicial de Oura Health Agent
- Pipeline ETL automatizado desde API de Oura Ring a BigQuery
- Despliegue en Cloud Run Job (ejecución de 2 minutos)
- Notificaciones por Telegram con métricas diarias
- 23 métricas de salud consolidadas por día:
  - Score de sueño, preparación, actividad
  - Frecuencia cardíaca (promedio, mínima), respiratoria
  - Desviación de temperatura
  - Fases de sueño (REM, profundo, ligero)
  - Pasos, calorías, tiempo sedentario
- Documentación bilingüe completa (EN + ES)
- Licencia MIT
- Configuración lista para producción

#### Técnico
- Python 3.9
- Google Cloud Run Jobs
- Tabla BigQuery particionada
- Manejo de rate limiting (429)
- Estrategia DELETE + INSERT (sin duplicados)
- Variables de entorno para secretos
- Contenedorización Docker

---

## Future Releases | Lanzamientos Futuros

### [1.1.0] - Planned | Planeado
- 🇬🇧 XGBoost predictions for tomorrow's readiness
- 🇪🇸 Predicciones XGBoost para preparación de mañana

### [1.2.0] - Planned | Planeado
- 🇬🇧 LSTM for trend analysis (7-30 days)
- 🇪🇸 LSTM para análisis de tendencias (7-30 días)

### [2.0.0] - Planned | Planeado
- 🇬🇧 Ensemble models + SHAP explanations
- 🇪🇸 Modelos ensemble + explicaciones SHAP

---

**Legend | Leyenda:**
- 🇬🇧 Added = New feature | 🇪🇸 Agregado = Nueva funcionalidad
- 🇬🇧 Changed = Modification | 🇪🇸 Cambiado = Modificación
- 🇬🇧 Fixed = Bug fix | 🇪🇸 Arreglado = Corrección de error
- 🇬🇧 Removed = Deletion | 🇪🇸 Eliminado = Eliminación
