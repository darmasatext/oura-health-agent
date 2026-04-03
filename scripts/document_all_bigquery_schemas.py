#!/usr/bin/env python3
"""
Script maestro para documentar TODAS las tablas y views de BigQuery
Datasets: oura_biometrics, oura_analytics, oura_dashboard
"""

from google.cloud import bigquery
import sys

PROJECT_ID = "last-240000"

# ============================================================================
# DESCRIPCIONES COMPLETAS POR TABLA/VIEW
# ============================================================================

# Dataset: oura_biometrics
DAILY_BIOMETRICS_V2 = {
    "calendar_date": "Fecha del día calendario. CLUSTERING KEY principal. Rango: 2020-01-01 a presente.",
    "ingestion_timestamp": "🆕 Timestamp UTC de ingesta al pipeline. PARTITION KEY.",
    "sleep_score": "Calidad del sueño. Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐",
    "readiness_score": "Preparación para el día. Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐",
    "activity_score": "Actividad física del día. Rango: 0-100 (óptimo: 85-100). ⭐⭐⭐⭐⭐",
    "resilience_level": "🆕 Nivel de resiliencia. Valores: limited/adequate/solid/strong/exceptional. ⭐⭐⭐⭐",
    "average_hrv_ms": "🆕 Heart Rate Variability (ms). Rango: 10-200ms. ⭐⭐⭐⭐⭐ Indicador de estrés/recuperación.",
    "total_sleep_seconds": "Tiempo total dormido en segundos. Rango: 14400-36000s (4-10h). Incluye deep+REM+light. ⭐⭐⭐⭐⭐",
    "rem_sleep_seconds": "Sueño REM en segundos. Rango: 5400-10800s (1.5-3h). Fase de sueños y memoria. ⭐⭐⭐⭐",
    "deep_sleep_seconds": "Sueño profundo en segundos. Rango: 3600-7200s (1-2h). Reparación física. ⭐⭐⭐⭐⭐",
    "light_sleep_seconds": "Sueño ligero en segundos. Rango: 10800-21600s (3-6h). Transición entre fases. ⭐⭐⭐",
    "awake_time_seconds": "Tiempo despierto en cama (segundos). Menor es mejor. Incluye despertares nocturnos. ⭐⭐⭐",
    "sleep_efficiency_pct": "Eficiencia del sueño (%). Rango: 0-100 (óptimo: 85-100). Tiempo dormido vs tiempo en cama. ⭐⭐⭐⭐⭐",
    "sleep_latency_seconds": "Latencia de sueño (segundos). Tiempo para dormirse. Rango: 0-3600s (óptimo: <900s). ⭐⭐⭐",
    "bed_time_start": "⏰ Timestamp UTC de acostarse. Inicio del período de descanso.",
    "bed_time_end": "⏰ Timestamp UTC de levantarse. Fin del período de descanso.",
    "average_heart_rate": "Frecuencia cardíaca promedio (bpm) durante 24h. Rango: 40-100bpm. ⭐⭐⭐⭐",
    "lowest_heart_rate": "FC en reposo más baja (bpm). Rango: 35-70bpm (menor = mejor fitness). ⭐⭐⭐⭐⭐",
    "respiratory_rate_bpm": "Frecuencia respiratoria (resp/min) durante sueño. Rango: 12-20 rpm. ⭐⭐⭐",
    "temperature_deviation_celsius": "🌡️ Desviación de temperatura (°C) vs línea base. Rango: -2.0 a +2.0°C. ⭐⭐⭐⭐",
    "temperature_trend_deviation_celsius": "🌡️ Tendencia de temperatura (°C). Suaviza variaciones diarias. Rango: -1.5 a +1.5°C. ⭐⭐⭐",
    "steps": "🚶 Pasos totales del día. Rango: 0-50000 (meta: 10000+). ⭐⭐⭐⭐⭐",
    "active_calories": "🔥 Calorías activas (excluye metabolismo basal). Rango: 0-3000 kcal. ⭐⭐⭐⭐",
    "total_calories": "🔥 Calorías totales (actividad + basal). Rango: 1200-4000 kcal/día. ⭐⭐⭐⭐",
    "sedentary_time_seconds": "⏱️ Tiempo sedentario en segundos. Menor es mejor. Rango: 0-86400s (0-24h). ⭐⭐⭐",
    "equivalent_walking_distance_meters": "📏 Distancia equivalente caminada (metros). Basado en pasos + zancada. ⭐⭐⭐",
    "target_meters": "🎯 Objetivo diario de distancia (metros) configurado en app. ⭐⭐",
    "meters_to_target": "📊 Metros faltantes para alcanzar objetivo diario. Negativo = superado. ⭐⭐",
    "high_activity_time_seconds": "💪 Tiempo en actividad intensa (segundos). Rango: 0-21600s (0-6h/día). ⭐⭐⭐⭐",
    "medium_activity_time_seconds": "🚶‍♂️ Tiempo en actividad moderada (segundos). Rango: 0-43200s (0-12h/día). ⭐⭐⭐",
    "low_activity_time_seconds": "🚶 Tiempo en actividad ligera (segundos). Rango: 0-64800s (0-18h/día). ⭐⭐",
    "resting_time_seconds": "🧘 Tiempo en reposo consciente (segundos). Meditación, lectura, etc. ⭐⭐⭐",
    "inactive_time_seconds": "💤 Tiempo inactivo (segundos). Sin movimiento significativo. ⭐⭐",
    "met_minutes_low": "💪 MET minutos en actividad baja. 1 MET = metabolismo en reposo. Rango: 0-1200. ⭐⭐",
    "met_minutes_medium_plus": "🏃 MET minutos en actividad media/alta. Rango: 0-500 MET·min. ⭐⭐⭐⭐",
    "training_frequency": "📊 Frecuencia de entrenamiento. Valores: low/moderate/high. Calculado por Oura. ⭐⭐⭐",
    "training_volume_mets": "💪 Volumen de entrenamiento en METs. Suma ponderada intensidad × duración. ⭐⭐⭐⭐",
    "spo2_percentage_average": "🫁 Saturación de oxígeno promedio (SpO2 %) durante sueño. Rango: 90-100%. ⭐⭐⭐⭐",
    "breathing_disturbance_index": "😴 Índice de perturbaciones respiratorias. Rango: 0-30 (menor = mejor). ⭐⭐⭐",
    "stress_high_seconds": "😰 Tiempo en estrés alto (segundos). Menor es mejor. Rango: 0-43200s. ⭐⭐⭐⭐",
    "recovery_high_seconds": "😌 Tiempo en recuperación alta (segundos). Sistema nervioso relajado. ⭐⭐⭐⭐",
    "day_summary_stress": "📝 Resumen de estrés del día. Valores: restored/normal/stressful. ⭐⭐⭐",
    "cardiovascular_age": "❤️ Edad cardiovascular estimada. Basada en métricas de salud cardíaca. ⭐⭐⭐⭐",
    "vo2_max": "🏃 VO2 Max estimado (ml/kg/min). Capacidad aeróbica máxima. Rango: 20-80. ⭐⭐⭐⭐⭐",
    "restful_periods": "🧘 Número de períodos de descanso detectados. Rango: 0-10. ⭐⭐",
    "sleep_type": "🛏️ Tipo de sueño. Valores: long_sleep/sleep/late_nap/rest. Clasifica sesión principal. ⭐⭐",
    "user_id": "👤 ID del usuario Oura. Para soporte multi-usuario (actualmente 1 usuario).",
    "data_source": "📡 Fuente de datos (oura_api_v2). Para auditoría y troubleshooting.",
}

SLEEP_SESSIONS = {
    "calendar_date": "Fecha de la sesión de sueño (timezone CST). FK a daily_biometrics_v2.",
    "session_id": "🔑 ID único de sesión de Oura API. Primary key.",
    "ingestion_timestamp": "🆕 Timestamp UTC de ingesta al pipeline.",
    "type": "🛏️ Tipo de sesión. Valores: long_sleep/sleep/nap/rest. ⭐⭐⭐",
    "start_datetime": "⏰ Timestamp UTC de inicio de sesión de sueño.",
    "end_datetime": "⏰ Timestamp UTC de fin de sesión de sueño.",
    "total_sleep_duration": "⏱️ Duración total del sueño (segundos). Rango: 1800-43200s. ⭐⭐⭐⭐",
    "deep_sleep_duration": "😴 Duración sueño profundo (segundos). Rango: 0-7200s. ⭐⭐⭐⭐⭐",
    "rem_sleep_duration": "💭 Duración sueño REM (segundos). Rango: 0-10800s. ⭐⭐⭐⭐",
    "light_sleep_duration": "🌙 Duración sueño ligero (segundos). Rango: 0-21600s. ⭐⭐⭐",
    "awake_time": "😳 Tiempo despierto (segundos). Menor es mejor. ⭐⭐⭐",
    "average_hrv": "❤️ HRV promedio durante sueño (ms). Rango: 10-200ms. ⭐⭐⭐⭐⭐",
    "lowest_heart_rate": "❤️ FC más baja durante sueño (bpm). Rango: 30-70bpm. ⭐⭐⭐⭐⭐",
    "average_heart_rate": "❤️ FC promedio durante sueño (bpm). Rango: 40-80bpm. ⭐⭐⭐⭐",
    "user_id": "👤 ID del usuario Oura.",
    "data_source": "📡 Fuente de datos (oura_api_v2).",
}

DAILY_ACTIVITY_SUMMARY = {
    "calendar_date": "Fecha del día de actividad (timezone CST). FK a daily_biometrics_v2.",
    "ingestion_timestamp": "🆕 Timestamp UTC de ingesta al pipeline.",
    "score": "🏃 Score de actividad (0-100). Algoritmo Oura. Rango óptimo: 85-100. ⭐⭐⭐⭐⭐",
    "active_calories": "🔥 Calorías activas (excluye basal). Rango: 0-3000 kcal. ⭐⭐⭐⭐",
    "total_calories": "🔥 Calorías totales (actividad + basal). Rango: 1200-4000 kcal. ⭐⭐⭐⭐",
    "steps": "🚶 Pasos totales del día. Rango: 0-50000 (meta: 10000+). ⭐⭐⭐⭐⭐",
    "equivalent_walking_distance": "📏 Distancia equivalente caminada (metros). ⭐⭐⭐",
    "high_activity_time": "💪 Tiempo actividad intensa (segundos). Rango: 0-21600s. ⭐⭐⭐⭐",
    "medium_activity_time": "🚶‍♂️ Tiempo actividad moderada (segundos). Rango: 0-43200s. ⭐⭐⭐",
    "low_activity_time": "🚶 Tiempo actividad ligera (segundos). Rango: 0-64800s. ⭐⭐",
    "sedentary_time": "💺 Tiempo sedentario (segundos). Menor es mejor. ⭐⭐⭐",
    "inactivity_alerts": "⚠️ Alertas de inactividad recibidas. Rango: 0-10. ⭐⭐",
    "met_min_high": "🏃 MET minutos actividad alta. Rango: 0-500. ⭐⭐⭐⭐",
    "met_min_medium": "🚶‍♂️ MET minutos actividad media. Rango: 0-800. ⭐⭐⭐",
    "met_min_low": "🚶 MET minutos actividad baja. Rango: 0-1200. ⭐⭐",
    "user_id": "👤 ID del usuario Oura.",
    "data_source": "📡 Fuente de datos (oura_api_v2).",
}

DAILY_AGGREGATES = {
    # Aquí pondré las 66 columnas de daily_aggregates si decides mantenerla
    # Por ahora lo dejo vacío hasta que decidamos
}

# Dataset: oura_analytics (1 VIEW)
DAILY_HEALTH_METRICS_VIEW = {
    # Esta es una VIEW - BigQuery no permite actualizar schema de VIEWs
    # Solo podemos actualizar la descripción de la VIEW completa, no columnas individuales
}

# Dataset: oura_dashboard (8 VIEWs)
# Las VIEWs no permiten actualizar descripciones de columnas individuales
# Solo podemos actualizar la descripción general de cada VIEW

# ============================================================================
# FUNCIONES
# ============================================================================

def update_table_descriptions(client, dataset_id, table_id, descriptions, table_description=None):
    """Actualiza descripciones de columnas y de la tabla"""
    
    full_table_id = f"{PROJECT_ID}:{dataset_id}.{table_id}"
    table_ref = client.dataset(dataset_id).table(table_id)
    
    try:
        table = client.get_table(table_ref)
    except Exception as e:
        print(f"  ❌ Error al obtener tabla {table_id}: {e}")
        return 0
    
    # Si es una VIEW, solo actualizar descripción general
    if table.table_type == "VIEW":
        if table_description:
            table.description = table_description
            client.update_table(table, ["description"])
            print(f"  ✅ VIEW {table_id}: Descripción general actualizada")
        else:
            print(f"  ⏭️  VIEW {table_id}: Sin descripción general configurada")
        return 0
    
    # Para TABLEs, actualizar columnas
    new_schema = []
    updated_count = 0
    
    for field in table.schema:
        description = descriptions.get(field.name, field.description)
        
        new_field = bigquery.SchemaField(
            name=field.name,
            field_type=field.field_type,
            mode=field.mode,
            description=description,
            fields=field.fields
        )
        
        new_schema.append(new_field)
        
        if description and description != field.description:
            updated_count += 1
    
    # Actualizar tabla
    table.schema = new_schema
    if table_description:
        table.description = table_description
    
    table = client.update_table(table, ["schema", "description"])
    
    print(f"  ✅ {table_id}: {updated_count} columnas actualizadas")
    return updated_count

def main():
    client = bigquery.Client(project=PROJECT_ID)
    
    print("=" * 70)
    print("📝 DOCUMENTANDO TODAS LAS TABLAS Y VIEWS DE BIGQUERY")
    print("=" * 70)
    print("")
    
    total_updated = 0
    
    # ========================================================================
    # Dataset 1: oura_biometrics
    # ========================================================================
    print("1️⃣  Dataset: oura_biometrics")
    print("-" * 70)
    
    # 1.1 daily_biometrics_v2
    count = update_table_descriptions(
        client,
        "oura_biometrics",
        "daily_biometrics_v2",
        DAILY_BIOMETRICS_V2,
        "🏆 Tabla principal (Silver Layer). Datos diarios agregados de Oura Ring con métricas de sueño, recuperación, actividad y salud. Fuente única de verdad para el dashboard. ETL v2 con MERGE anti-duplicados. Actualización: 7:00 AM y 7:00 PM CST."
    )
    total_updated += count
    
    # 1.2 sleep_sessions
    count = update_table_descriptions(
        client,
        "oura_biometrics",
        "sleep_sessions",
        SLEEP_SESSIONS,
        "😴 Tabla Bronze Layer. Sesiones individuales de sueño detectadas por Oura (incluye siestas). Granularidad: por sesión, puede haber múltiples sesiones por día. Fuente: /v2/usercollection/sleep endpoint."
    )
    total_updated += count
    
    # 1.3 daily_activity_summary
    count = update_table_descriptions(
        client,
        "oura_biometrics",
        "daily_activity_summary",
        DAILY_ACTIVITY_SUMMARY,
        "🏃 Tabla Bronze Layer. Resumen diario de actividad física de Oura. Una fila por día. Incluye pasos, calorías, MET minutes y tiempo por intensidad. Fuente: /v2/usercollection/daily_activity endpoint."
    )
    total_updated += count
    
    print("")
    
    # ========================================================================
    # Dataset 2: oura_analytics
    # ========================================================================
    print("2️⃣  Dataset: oura_analytics")
    print("-" * 70)
    
    # 2.1 daily_health_metrics (VIEW)
    update_table_descriptions(
        client,
        "oura_analytics",
        "daily_health_metrics",
        {},
        "📊 VIEW Silver Layer. Analytics calculados: moving averages (7d, 30d), categorías (excellent/good/fair/poor), zonas HRV, deltas día a día, porcentajes de fases. Origen: oura_biometrics.daily_aggregates. Uso: Rangos custom de fechas en dashboard."
    )
    
    print("")
    
    # ========================================================================
    # Dataset 3: oura_dashboard (Gold Layer VIEWs)
    # ========================================================================
    print("3️⃣  Dataset: oura_dashboard (Gold Layer)")
    print("-" * 70)
    
    gold_views = {
        "home_kpis": "🏠 KPIs del home dashboard para períodos 7/14/30/90 días. Pre-calculados: valores actuales, anteriores, deltas absolutos y %. Ahorra queries al frontend.",
        "hrv_alert_current": "❤️ HRV Alert del día actual. Incluye zona HRV (green/yellow/red), categoría readiness, recomendación automática. Widget de alerta temprana.",
        "sleep_scorecard_periods": "😴 Sleep Scorecard por períodos (7/14/30 días). Promedios + checks (✅/❌) por métrica. Dashboard de calidad de sueño.",
        "weekly_patterns": "📅 Patrones semanales (promedios por día de semana). Períodos: 4w o 12w. Identifica mejores/peores días. Widget de tendencias.",
        "recovery_factors_current": "🔄 Recovery Factors del día actual. Todos los contributors de readiness, identifica factor más bajo. Dashboard de recuperación.",
        "activity_breakdown_current": "🏃 Activity Breakdown del día actual. Distribución horas (resting/inactive/active) + alerta sedentarismo. Widget de movimiento.",
        "stress_balance_current": "😌 Stress Balance del día actual. Distribución de horas por estado de estrés + resiliencia. Widget de bienestar mental.",
        "trends_periods": "📈 Trends (series temporales) por períodos (7/14/30/90 días). Rolling averages 7d, categorías, zonas. Gráficos de evolución.",
    }
    
    for view_name, description in gold_views.items():
        update_table_descriptions(
            client,
            "oura_dashboard",
            view_name,
            {},
            description
        )
    
    print("")
    print("=" * 70)
    print(f"✅ DOCUMENTACIÓN COMPLETADA")
    print("=" * 70)
    print(f"Total de columnas documentadas: {total_updated}")
    print("")
    print("📊 Resumen por dataset:")
    print("  • oura_biometrics: 3 tablas documentadas (daily_biometrics_v2, sleep_sessions, daily_activity_summary)")
    print("  • oura_analytics: 1 view documentada (daily_health_metrics)")
    print("  • oura_dashboard: 8 views documentadas (Gold Layer)")
    print("")
    print("🔗 Verificar en BigQuery Console:")
    print(f"  https://console.cloud.google.com/bigquery?project={PROJECT_ID}")

if __name__ == "__main__":
    main()
